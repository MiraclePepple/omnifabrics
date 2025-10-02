// src/modules/payments/payment.controller.ts
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { Order } from '../orders/order.model';
import { Transaction } from './transaction.model';
import { OrderService } from '../orders/order.service';

export class PaymentController {
  // Client calls this to initialize payment for an existing order
  static async payForOrder(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const { order_id } = req.body;
      if (!order_id) return res.status(400).json({ error: 'Missing order_id' });

      const order = await OrderService.getOrderById(user.user_id, Number(order_id));
      if (!order) return res.status(404).json({ error: 'Order not found' });

      const products: any[] = JSON.parse((order as any).product_info || '[]');
      if (!Array.isArray(products) || products.length === 0) return res.status(400).json({ error: 'Order has no products' });

      const amount = products.reduce((sum, p) => sum + Number(p.price) * Number(p.quantity), 0);

      const meta = {
        email: user.email,
        phone_number: user.phone_number,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      };

      const { transaction, payment_link } = await PaymentService.initializePayment(
        user.user_id,
        order as Order,
        amount,
        (order as any).currency ?? 'NGN',
        meta
      );

      return res.status(200).json({
        message: 'Payment initialized',
        payment_link,
        transaction_id: transaction.transaction_id,
      });
    } catch (err: any) {
      console.error('payForOrder error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // Provider webhook (Squadco sends event here)
  static async webhook(req: Request, res: Response) {
    try {
      const payload = req.body;
      // provider payload may vary — we pass full payload to finalizer
      await PaymentService.finalizePayment(payload);
      // respond quickly 200 to provider
      return res.status(200).json({ status: 'ok' });
    } catch (err: any) {
      console.error('Webhook error:', err);
      // still return 200/500 depending on provider expectations; we return 500 so you can see failure during testing
      return res.status(500).json({ error: err.message });
    }
  }

  // Optional: manual verify endpoint for redirect flow (client returns with tx_ref)
  static async verifyRedirect(req: Request, res: Response) {
    try {
      const { provider_ref, transaction_id } = req.query;
      if (!provider_ref && !transaction_id) return res.status(400).json({ error: 'Missing provider_ref or transaction_id' });

      const verifyResp = await PaymentService.verifyTransaction(String(provider_ref || transaction_id));
      if (!verifyResp) return res.status(400).json({ error: 'Payment not successful' });

      // finalize using provider response (the structure may vary - adapt as necessary)
      await PaymentService.finalizePayment(verifyResp);

      return res.status(200).json({ message: 'Payment verified' });
    } catch (err: any) {
      console.error('verifyRedirect error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
}
