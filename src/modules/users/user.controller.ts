import { Request, Response } from 'express';
import { UserService } from './user.service';

export class UserController {
  // Get user profile
  static async getProfile(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.user_id;
      const user = await UserService.getProfile(user_id);
      return res.json({ message: 'Profile fetched successfully', user });
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }

  // Update profile/settings
  static async updateProfile(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.user_id;
      const data = req.body;
      const user = await UserService.updateProfile(user_id, data);
      return res.json({ message: 'Profile updated successfully', user });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Change password
  static async changePassword(req: Request, res: Response) {
    try {
      const user_id = (req as any).user.user_id;
      const { oldPassword, newPassword } = req.body;
      const result = await UserService.changePassword(user_id, oldPassword, newPassword);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // Reset password (via OTP)
  static async resetPassword(req: Request, res: Response) {
    try {
      const { user_id, newPassword } = req.body;
      const result = await UserService.resetPassword(user_id, newPassword);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
