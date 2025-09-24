import { Payment } from './payment.model';
import { Order } from '../orders/order.model';

export const initiatePayment = async (userId:number, orderId:number, amount:number, method:string) => {
  // Create Payment row (status pending)
  const payment = await Payment.create({ order_id: orderId, amount, payment_method: method, payment_status:
     'pending', user_id: userId, created_at: new Date() });
  // TODO: call Flutterwave or other gateway and return checkout data
  return payment;
};

export const confirmPayment = async (reference:string, status:string) => {
  // update payment by reference
  const payment = await Payment.findOne({ where: { reference }});
  if (!payment) throw new Error('Payment not found');
  payment.set('payment_status', status);
  payment.set('paid_at', new Date());
  await payment.save();
  return payment;
};
