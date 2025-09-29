import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const { email, phone_number, password } = req.body;
      const user = await AuthService.signup(email, phone_number, password);
      return res.status(201).json({ message: 'User created successfully', user_id: user.user_id });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async completeProfile(req: Request, res: Response) {
    try {
      const { user_id, profile } = req.body; // profile = { first_name, last_name, gender, ... }
      const user = await AuthService.completeProfile(user_id, profile);
      return res.json({ message: 'Profile completed', user });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.login(email, password);
      return res.json({ message: 'Login successful', user, token });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async sendOtp(req: Request, res: Response) {
    try {
      const { user_id, type } = req.body;
      const otp = await AuthService.sendOtp(user_id, type);
      return res.json({ message: 'OTP sent', otp_code: otp.code });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { user_id, code, type } = req.body;
      await AuthService.verifyOtp(user_id, code, type);
      return res.json({ message: 'OTP verified' });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { user_id, newPassword } = req.body;
      const user = await AuthService.resetPassword(user_id, newPassword);
      return res.json({ message: 'Password reset successful', user });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async createStore(req: Request, res: Response) {
    try {
      const { user_id, storeData } = req.body;
      const store = await AuthService.createStore(user_id, storeData);
      return res.status(201).json({ message: 'Store created', store });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
