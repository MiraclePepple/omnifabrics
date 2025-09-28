import { Request, Response } from 'express';
import { UserService } from './user.service';
import { completeProfileSchema } from './user.validation';

export class UserController {
  static async completeProfile(req: Request, res: Response) {
    const { error } = completeProfileSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const updatedUser = await UserService.completeProfile(req.user.user_id, req.body);

      return res.status(200).json({
        message: 'Profile completed successfully.',
        user: updatedUser,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Now fully typed
      const {
        user_id,
        first_name,
        last_name,
        email,
        phone_number,
        is_active,
        is_suspended,
        created_at
      } = req.user;

      return res.json({
        message: "Profile fetched successfully",
        user: {
          user_id,
          first_name,
          last_name,
          email,
          phone_number,
          is_active,
          is_suspended,
          created_at,
        },
      });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
}
