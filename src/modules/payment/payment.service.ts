// src/modules/payments/payment.service.ts
import axios from 'axios';
import sequelize from '../../config/db';
import { Order } from '../orders/order.model';
import { Product } from '../products/product.model';
import { ProductItem } from '../product_items/product_item.model';
import { Transaction } from './transaction.model';

// env keys — set them in .env
const SQUADCO_SECRET = process.env.SQUADCO_SECRET_KEY || '';
const SQUADCO_BASE = process.env.SQUADCO_BASE_URL || 'https://api.squadco.com/v1';
const APP_BASE = process.env.APP_BASE_URL || 'http://localhost:3000';

if (!SQUADCO_SECRET) {
  console.warn('SQUADCO_SECRET_KEY not set — payment provider calls will fail until you set it.');
}

export class PaymentService {
  /**
   * Initialize a payment with Squadco (or provider).
   * Creates a Transaction row (pending) and returns checkout link + transaction.
   */
  static async initializePayment(
    user_id: number,
    order: Order | null,
    amount: number,
    currency = 'NGN',
    meta: any = {}
  ) {
    // Create pending transaction record
    const tx = await Transaction.create({
      order_id: order ? (order as any).order_id : null,
      user_id,
      amount,
      currency,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Build provider payload — adapt fields to Squadco docs
    const payload = {
      reference: `omni_${tx.transaction_id}_${Date.now()}`,
      amount: Number(amount).toFixed(2),
      currency,
      redirect_url: `${APP_BASE}/payments/verify`,
      customer: {
        email: meta.email,
        phone_number: meta.phone_number,
        name: meta.name || 'Customer',
      },
      metadata: {
        internal_transaction_id: tx.transaction_id,
        ...meta,
      },
      description: `Payment for order ${order ? (order as any).order_id : 'N/A'}`,
    };

    // Call Squadco API
    const resp = await axios.post(`${SQUADCO_BASE}/payments`, payload, {
      headers: {
        Authorization: `Bearer ${SQUADCO_SECRET}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });

    const data = resp.data;

    // Guard: provider success flag may differ; adapt if needed
    if (!data || (data.success !== true && data.status !== 'success')) {
      await tx.update({ status: 'failed', provider_data: data, updated_at: new Date() }).catch(() => {});
      throw new Error('Failed to initialize Squadco payment');
    }

    // provider_ref and checkout URL field names may vary — adapt as necessary
    const providerRef = data.payment_id ?? data.data?.id ?? data.data?.reference ?? null;
    const checkoutUrl = data.checkout_url ?? data.data?.checkout_url ?? data.data?.link ?? data.data?.authorization_url ?? null;

    await tx.update({
      provider_ref: providerRef,
      provider_data: data,
      updated_at: new Date(),
    });

    return {
      transaction: tx,
      payment_link: checkoutUrl,
      provider_response: data,
    };
  }

  /**
   * Verify transaction at provider side using provider reference/id.
   * Returns provider response object.
   */
  static async verifyTransaction(providerRef: string) {
    if (!providerRef) throw new Error('Missing provider reference to verify');

    const resp = await axios.get(`${SQUADCO_BASE}/payments/${encodeURIComponent(providerRef)}`, {
      headers: { Authorization: `Bearer ${SQUADCO_SECRET}` },
      timeout: 10000,
    });

    if (!resp.data || (resp.data.success !== true && resp.data.status !== 'success')) {
      throw new Error('Payment verification failed at provider');
    }
    return resp.data;
  }

  /**
   * Finalize payment - called from webhook or manual verify redirect.
   * providerPayload should be the full provider payload (Squadco webhook body).
   *
   * Steps:
   *  - find local Transaction (via metadata.internal_transaction_id or provider_ref)
   *  - verify provider status
   *  - mark tx paid, update order payment status, decrement variant stock inside DB tx
   */
  static async finalizePayment(providerPayload: any) {
    // Defensive: provider structures vary. Try to get both provider payment id and internal metadata.
    const providerPaymentId = providerPayload.payment_id ?? providerPayload.data?.id ?? providerPayload.data?.payment_id ?? providerPayload.id ?? null;
    const metadata = providerPayload.metadata ?? providerPayload.data?.metadata ?? providerPayload.data?.meta ?? null;
    const internalTxId = metadata?.internal_transaction_id ?? providerPayload.data?.metadata?.internal_transaction_id ?? null;

    // Locate transaction by internal id first then by provider_ref
    let tx: any = null;
    if (internalTxId) {
      tx = await Transaction.findByPk(Number(internalTxId));
    }
    if (!tx && providerPaymentId) {
      tx = await Transaction.findOne({ where: { provider_ref: String(providerPaymentId) } });
    }
    if (!tx) throw new Error('Transaction record not found');

    // Verify with provider to avoid spoofed webhooks
    const verifyResp = await this.verifyTransaction(providerPaymentId ?? tx.provider_ref);
    // adapt success test accordingly
    const isSuccess = verifyResp && (verifyResp.success === true || verifyResp.status === 'success' || verifyResp.data?.status === 'success');

    if (!isSuccess) {
      await tx.update({ status: 'failed', provider_data: providerPayload }).catch(() => {});
      throw new Error('Provider reports payment unsuccessful');
    }

    // Start DB transaction for finalization (decrement stock, mark paid)
    const t = await sequelize.transaction();
    try {
      await tx.update({ status: 'paid', provider_data: verifyResp, provider_ref: providerPaymentId ?? tx.provider_ref, updated_at: new Date() }, { transaction: t });

      // If transaction linked to order, update order and decrement inventory
      if (tx.order_id) {
        const order = await Order.findByPk(tx.order_id, { transaction: t, lock: t.LOCK.UPDATE });
        if (!order) throw new Error('Order not found for transaction');

        const products: any[] = JSON.parse(order.product_info || '[]');

        for (const p of products) {
          if (p.product_item_id) {
            const variant = await ProductItem.findByPk(p.product_item_id, { transaction: t, lock: t.LOCK.UPDATE });
            if (!variant) throw new Error(`Product variant ${p.product_item_id} not found`);
            if (variant.quantity !== null && variant.quantity < p.quantity) {
              throw new Error(`Insufficient stock for variant ${p.product_item_id}`);
            }
            if (variant.quantity !== null) {
              await variant.update({ quantity: variant.quantity - p.quantity, is_available: (variant.quantity - p.quantity) > 0 }, { transaction: t });
            }
          } else {
            const product = await Product.findByPk(p.product_id, { transaction: t, lock: t.LOCK.UPDATE });
            if (!product) throw new Error(`Product ${p.product_id} not found`);
            // If product-level quantity exists in schema, decrement it
            if ((product as any).quantity !== undefined) {
              const newQty = Number((product as any).quantity) - Number(p.quantity);
              await product.update({ quantity: newQty, is_active: newQty > 0 }, { transaction: t });
            }
          }
        }

        // mark order paid & update tracking
        await order.update({ payment_status: 'paid', tracking_status: 'processing' }, { transaction: t });
      }

      await t.commit();
      return { success: true, tx };
    } catch (err) {
      await t.rollback();
      await tx.update({ status: 'failed', provider_data: providerPayload }).catch(() => {});
      throw err;
    }
  }
}
