import { Request, Response } from 'express';
import { StoreService } from './store.service';

export class StoreController {
  // Request OTP for store creation
  static async requestStoreOTP(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const result = await StoreService.requestStoreOTP(email);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Verify OTP
  static async verifyStoreOTP(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.user_id;
      const { otp } = req.body;
      const result = await StoreService.verifyStoreOTP(user_id, otp);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Create store
  static async createStore(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.user_id;
      const { storeData } = req.body; // extract storeData from body
    if (!storeData || !storeData.name) {
      return res.status(400).json({ error: 'Store name is required' });
    }
      const store = await StoreService.createStore(user_id, storeData);
      return res.json({ message: 'Store created successfully', store });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Switch mode
  static async switchMode(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.user_id;
      const { mode } = req.body;
      const result = await StoreService.switchMode(user_id, mode);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}  