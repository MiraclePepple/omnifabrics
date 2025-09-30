// src/modules/payments/payment.controller.ts
import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { OrderService } from '../orders/order.service';

export class PaymentController {
  // Client calls this to pay for an existing order
  static async payForOrder(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const { order_id, use_saved_card } = req.body;
      if (!order_id) return res.status(400).json({ error: 'Missing order_id' });

      const order = await OrderService.getOrderById(user.user_id, Number(order_id));
      if (!order) return res.status(404).json({ error: 'Order not found' });

      // parse products from order.product_info
      const products: any[] = JSON.parse(order.product_info || '[]');
      if (!products.length) return res.status(400).json({ error: 'Order has no products' });

      const amount = products.reduce((sum, p) => sum + Number(p.price) * Number(p.quantity), 0);

      const meta = {
        email: user.email,
        phone_number: user.phone_number,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim()
      };

      const { transaction, payment_link } = await PaymentService.initializePayment(
        user.user_id,
        order,
        amount,
        'NGN',
        meta,
        use_saved_card
      );

      return res.status(200).json({
        message: 'Payment initialized',
        payment_link,
        transaction_id: transaction.transaction_id
      });
    } catch (err: any) {
      console.error('payForOrder error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // Webhook for Flutterwave
  static async webhook(req: Request, res: Response) {
    try {
      const payload = req.body;
      const providerId = payload.data?.id || payload.data?.tx_ref || payload.tx;

      const verifyResp = await PaymentService.verifyTransaction(providerId);
      if (!verifyResp || verifyResp.status !== 'success') {
        return res.status(200).json({ status: 'ignored' });
      }

      await PaymentService.finalizePayment(payload);
      return res.status(200).json({ status: 'ok' });
    } catch (err: any) {
      console.error('Webhook error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // Manual verification endpoint (optional redirect flow)
  static async verifyRedirect(req: Request, res: Response) {
    try {
      const { tx_ref, transaction_id } = req.query;
      if (!tx_ref && !transaction_id) return res.status(400).json({ error: 'Missing tx_ref or transaction_id' });

      const verifyResp = await PaymentService.verifyTransaction((tx_ref as string) || (transaction_id as string));
      if (!verifyResp || verifyResp.status !== 'success') return res.status(400).json({ error: 'Payment not successful' });

      await PaymentService.finalizePayment(verifyResp);

      return res.status(200).json({ message: 'Payment verified' });
    } catch (err: any) {
      console.error('verifyRedirect error:', err);
      return res.status(500).json({ error: err.message });
    }
  }
}
