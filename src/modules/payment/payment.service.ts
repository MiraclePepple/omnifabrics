// src/modules/payment/payment.service.ts
import axios from "axios";
import { Transaction } from "./transaction.model";
import { Order } from "../orders/order.model";
import { ProductItem } from "../product_items/product_item.model";
import { Product } from "../products/product.model";
import sequelize from "../../config/db";

const SQUADCO_SECRET = process.env.SQUADCO_SECRET_KEY!;
const SQUADCO_BASE = process.env.SQUADCO_BASE_URL || "https://api.squadco.com/v1";
const APP_BASE = process.env.APP_BASE_URL || "http://localhost:3000";

export class PaymentService {

  // Initialize payment with Squadco
  static async initializePayment(
    user_id: number,
    order: Order,
    amount: number,
    currency = "NGN",
    meta: any = {}
  ) {
    // 1️⃣ Create pending transaction
    const tx = await Transaction.create({
      order_id: order.order_id,
      user_id,
      amount,
      currency,
      status: "pending",
    });

    // 2️⃣ Squadco payload
    const payload = {
      reference: `omni_${tx.transaction_id}_${Date.now()}`,
      amount: Number(amount).toFixed(2),
      currency,
      redirect_url: `${APP_BASE}/payments/verify`,
      customer: {
        email: meta.email,
        phone_number: meta.phone_number,
        name: meta.name || "Customer",
      },
      metadata: {
        internal_transaction_id: tx.transaction_id,
        ...meta,
      },
      description: `Payment for order ${order.order_id}`,
    };

    // 3️⃣ Call Squadco
    const resp = await axios.post(`${SQUADCO_BASE}/payments`, payload, {
      headers: {
        Authorization: `Bearer ${SQUADCO_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    const data = resp.data;
    if (!data || !data.success) {
      await tx.update({ status: "failed", provider_data: data });
      throw new Error("Failed to initialize Squadco payment");
    }

    // 4️⃣ Update transaction
    await tx.update({
      provider_ref: data.payment_id,
      provider_data: data,
      status: "pending",
    });

    return {
      transaction: tx,
      payment_link: data.checkout_url,
      provider_response: data,
    };
  }

  // Verify payment
  static async verifyTransaction(providerRef: string) {
    const resp = await axios.get(`${SQUADCO_BASE}/payments/${providerRef}`, {
      headers: { Authorization: `Bearer ${SQUADCO_SECRET}` },
    });

    if (!resp.data || !resp.data.success) throw new Error("Payment verification failed");
    return resp.data;
  }

  // Finalize payment from webhook
  static async finalizePayment(providerData: any) {
    if (!providerData.metadata?.internal_transaction_id) {
      throw new Error("Invalid webhook payload: missing metadata");
    }

    const tx = await Transaction.findByPk(providerData.metadata.internal_transaction_id);
    if (!tx) throw new Error("Transaction not found");

    const verifyResp = await this.verifyTransaction(providerData.payment_id);
    if (!verifyResp?.success) {
      await tx.update({ status: "failed", provider_data: providerData });
      throw new Error("Payment verification failed");
    }

    const t = await sequelize.transaction();
    try {
      // Update transaction to paid
      await tx.update({ status: "paid", provider_data: providerData }, { transaction: t });

      // Update order stock & status
      const order = await Order.findByPk(tx.order_id, { transaction: t });
      if (!order) throw new Error("Order not found");

      const products: any[] = JSON.parse(order.product_info || "[]");

      for (const p of products) {
        if (p.product_item_id) {
          const variant = await ProductItem.findByPk(p.product_item_id, { transaction: t, lock: t.LOCK.UPDATE });
          if (!variant) throw new Error(`Product variant ${p.product_item_id} not found`);
          if (variant.quantity !== null && variant.quantity < p.quantity) throw new Error("Insufficient stock");
          if (variant.quantity !== null) {
            await variant.update(
              { quantity: variant.quantity - p.quantity, is_available: variant.quantity - p.quantity > 0 },
              { transaction: t }
            );
          }
        } else {
          const product = await Product.findByPk(p.product_id, { transaction: t, lock: t.LOCK.UPDATE });
          if (!product) throw new Error(`Product ${p.product_id} not found`);
        }
      }

      await order.update({ payment_status: "paid", tracking_status: "processing" }, { transaction: t });

      await t.commit();
      return { success: true, tx };
    } catch (err) {
      await t.rollback();
      await tx.update({ status: "failed", provider_data: providerData }).catch(() => {});
      throw err;
    }
  }
}
