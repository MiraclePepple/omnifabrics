import axios from 'axios';
import sequelize from '../../config/db';
import { Order } from '../orders/order.model';
import { Product } from '../products/product.model';
import { ProductItem } from '../product_items/product_item.model';
import { Transaction } from './transaction.model';
import Card from '../card/card.model';

const FLW_SECRET = process.env.FLW_SECRET_KEY!;
const FLW_BASE = process.env.FLW_BASE_URL || 'https://api.flutterwave.com/v3';
const APP_BASE = process.env.APP_BASE_URL || 'http://localhost:3000';

export class PaymentService {
  // 1) initialize payment with Flutterwave and create Transaction (pending)
  static async initializePayment(user_id: number, order: Order | null, amount: number, currency = 'NGN', meta: any = {}, use_saved_card: any) {
    // create pending transaction record
    const tx = await Transaction.create({
      order_id: order ? order.getDataValue('order_id') : null,
      user_id,
      amount,
      currency,
      status: 'pending'
    });

    // build payload for Flutterwave
    const payload = {
      tx_ref: `omnifabrics_${tx.getDataValue('transaction_id')}_${Date.now()}`,
      amount: Number(amount).toFixed(2),
      currency,
      redirect_url: `${APP_BASE}/payment/verify`, // optional endpoint for redirect after pay
      customer: {
        email: meta.email,
        phonenumber: meta.phone_number,
        name: meta.name || 'Customer'
      },
      meta: {
        internal_transaction_id: tx.getDataValue('transaction_id'),
        ...meta
      },
      customizations: {
        title: 'Omnifabrics Payment',
        description: 'Payment for order on Omnifabrics'
      }
    };

    // call flutterwave initialize payment
    const resp = await axios.post(`${FLW_BASE}/payments`, payload, {
      headers: {
        Authorization: `Bearer ${FLW_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    const data = resp.data;
    if (data.status !== 'success') {
      // update tx as failed
      await tx.update({ status: 'failed', provider_data: data });
      throw new Error('Failed to initialize payment');
    }

    // Save provider reference & provider_data
    await tx.update({
      provider_ref: data.data?.id || data.data?.tx_ref || null,
      provider_data: data,
      status: 'pending'
    });

    // Return link for client to pay (checkout_url)
    return {
      transaction: tx,
      payment_link: data.data?.link || data.data?.checkout_url || data.data?.flw_ref || null,
      provider_response: data
    };
  }

  // 2) verify transaction with Flutterwave (used in webhook or redirect verify)
  static async verifyTransaction(provider_txn_id_or_tx_ref: string) {
    // Flutterwave provides verify endpoint: /transactions/{id}/verify
    // we will try both by id and by tx_ref.
    try {
      // Try verify by transaction id
      let resp;
      try {
        resp = await axios.get(`${FLW_BASE}/transactions/${provider_txn_id_or_tx_ref}/verify`, {
          headers: { Authorization: `Bearer ${FLW_SECRET}` }
        });
      } catch (err) {
        // fallback: search by tx_ref (some implementations)
        resp = await axios.get(`${FLW_BASE}/transactions/verify_by_reference?tx_ref=${provider_txn_id_or_tx_ref}`, {
          headers: { Authorization: `Bearer ${FLW_SECRET}` }
        });
      }

      return resp.data;
    } catch (err: any) {
      throw new Error('Failed to verify transaction with Flutterwave');
    }
  }

  // 3) finalize transaction: called after verifying provider says success
  //    - set transaction to paid
  //    - set order.payment_status = 'paid'
  //    - decrement stock for product variants inside a DB transaction
  static async finalizePayment(providerData: any) {
    // providerData should include meta.internal_transaction_id or id
    const providerTx = providerData.data || providerData; // shape may vary
    const internalTxId = providerData.data?.meta?.internal_transaction_id || providerData.meta?.internal_transaction_id || providerData.data?.id;
    // Try to locate Transaction record
    let tx: any = null;
    if (internalTxId) {
      tx = await Transaction.findByPk(internalTxId);
    }

    // Fallback: search by provider_ref
    if (!tx) {
      tx = await Transaction.findOne({ where: { provider_ref: providerTx.id } });
    }

    if (!tx) throw new Error('Transaction record not found');

    // double-check status via flutterwave verify for safety
    const verifyResp = await this.verifyTransaction(providerTx.id || providerData.data?.id || providerData.tx_ref || providerTx.id);

    if (!verifyResp || verifyResp.status !== 'success') {
      await tx.update({ status: 'failed', provider_data: providerData });
      throw new Error('Payment verification failed');
    }

    // At this point payment is successful, proceed to finalize order & decrement stock
    const t = await sequelize.transaction();
    try {
      // mark transaction paid
      await tx.update({ status: 'paid', provider_data: providerData, provider_ref: providerTx.id }, { transaction: t });

      // If tx has order_id, update order
      const orderId = tx.getDataValue('order_id');
      if (orderId) {
        const order = await Order.findByPk(orderId, { transaction: t });
        if (!order) throw new Error('Order not found for this transaction');

        // Parse products array from order
        const products: any[] = order.getDataValue('products') || [];

        // For each product => decrement ProductItem quantity (if using product_item), else skip or adjust product-level quantity
        for (const p of products) {
          // p should include product_id, product_item_id (optional), quantity, price
          if (p.product_item_id) {
            const variant = await ProductItem.findByPk(p.product_item_id, { transaction: t, lock: t.LOCK.UPDATE });
            if (!variant) throw new Error(`Product variant ${p.product_item_id} not found`);
            // Check quantity
            if (variant.quantity !== null && variant.quantity < p.quantity) {
              throw new Error(`Insufficient stock for variant ${p.product_item_id}`);
            }
            // Decrement
            if (variant.quantity !== null) {
              await variant.update({ quantity: variant.quantity - p.quantity, is_available: (variant.quantity - p.quantity) > 0 }, { transaction: t });
            } else {
              // variant quantity null -> keep as available
            }
          } else {
            // if no variant, optionally decrement a product-level stock field if you have one
            const product = await Product.findByPk(p.product_id, { transaction: t, lock: t.LOCK.UPDATE });
            if (!product) throw new Error(`Product ${p.product_id} not found`);
            // If your product model has quantity, decrement it. If not, skip.
            if ((product as any).quantity !== undefined) {
              const newQty = (product as any).quantity - p.quantity;
              await product.update({ quantity: newQty, is_active: newQty > 0 }, { transaction: t });
            }
          }
        }

        // finalize order: set payment_status = paid, tracking_status remains pending or processing
        await order.update({ payment_status: 'paid', tracking_status: 'processing' }, { transaction: t });

        // (Optional) credit seller wallet / create payouts or transaction logs per product/store
      }

      await t.commit();
      return { success: true, tx };
    } catch (err) {
      await t.rollback();
      // mark tx failed
      await tx.update({ status: 'failed', provider_data: providerData }).catch(() => {});
      throw err;
    }
  }
}
