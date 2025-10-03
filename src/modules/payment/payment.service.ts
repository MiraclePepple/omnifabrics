// src/modules/payments/payment.service.ts
import { Payment } from "./payment.model";
import { Order } from "../orders/order.model";
import axios from "axios";
import { User } from "../users/user.model";

const SQUADCO_SECRET_KEY = process.env.SQUADCO_SECRET_KEY!;
const SQUADCO_BASE_URL = process.env.SQUADCO_BASE_URL || "https://sandbox-api-d.squadco.com";
const CALLBACK_URL = process.env.SQUADCO_CALLBACK_URL!;


export class PaymentService {

  // Initialize a payment for an order
  static async payForOrder(user_id: number, order_id: number) {
    // 1. Fetch order
    const order = await Order.findByPk(order_id);
    if (!order) throw new Error("Order not found");
    if (order.is_canceled) throw new Error("Cannot pay for canceled order");

    // 2. Fetch user
    const user = await User.findByPk(user_id);
    if (!user) throw new Error("User not found");
    if (!user.email) throw new Error("User email is required for payment");

    // 3. Create a payment record
    const payment = await Payment.create({
      order_id,
      user_id,
      amount: order.total_amount,
      status: "pending",
      payment_reference: `SQUADCO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    });

    // 4. Prepare payload for Squadco
    const payload = {
      amount: Math.round(order.total_amount * 100), // kobo, must be integer
      email: user.email,
      callback_url: CALLBACK_URL
    };

    console.log("Squadco payload:", payload); // debug log

    // 5. Call Squadco API
    try {
      const response = await axios.post(
        `${SQUADCO_BASE_URL}/transaction/Initiate`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${SQUADCO_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      ); console.log("Squadco response:", response.data);

      if (!response.data.success) {
        console.error("Squadco response error:", response.data);
        throw new Error(response.data.message || "Failed to initiate payment");
      }

      return { payment, payment_link: response.data.data.payment_url };
    } catch (err: any) {
      console.error("Squadco request failed:", err.response?.data || err.message);
      throw new Error(err.response?.data?.message || "Squadco request failed with status 400");
    }
  }



  // Handle Squadco webhook
  static async handleWebhook(data: any) {
  console.log("Handling webhook data:", data);

  const payment = await Payment.findOne({ where: { order_id: data.order_id } });
  if (!payment) throw new Error("Payment record not found");

  if (data.status === "paid" || data.status === "successful") {
    payment.status = "successful";
    await payment.save();

    const order = await Order.findByPk(payment.order_id);
    if (order) {
      order.delivery_status = "pending"; // order ready to process
      await order.save();
    }
  } else if (data.status === "failed") {
    payment.status = "failed";
    await payment.save();
  }

  return payment;
}



  // Get user payments
  static async getUserPayments(user_id: number) {
    return Payment.findAll({ where: { user_id }, include: [{ model: Order, as: "order" }] });
  }
}

