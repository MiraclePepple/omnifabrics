import { User } from './user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export class UserService {
  // Fetch user profile
  static async getProfile(user_id: number) {
    const user = await User.findByPk(user_id, {
      attributes: {
        exclude: ['password']
      }
    });
    if (!user) throw new Error('User not found');
    return user;
  }

  // Update user profile/settings
  static async updateProfile(user_id: number, data: any) {
    const user = await User.findByPk(user_id);
    if (!user) throw new Error('User not found');

    await user.update({
      first_name: data.first_name ?? user.first_name,
      last_name: data.last_name ?? user.last_name,
      gender: data.gender ?? user.gender,
      state: data.state ?? user.state,
      city: data.city ?? user.city,
      country: data.country ?? user.country,
      address: data.address ?? user.address,
      email: data.email ?? user.email,
      phone_number: data.phone_number ?? user.phone_number,
    });

    return user;
  }

  // Change password (requires old password)
  static async changePassword(user_id: number, oldPassword: string, newPassword: string) {
    const user = await User.findByPk(user_id);
    if (!user) throw new Error('User not found');

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) throw new Error('Old password is incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    return { message: 'Password changed successfully' };
  }

  // Reset password via OTP (reuses AuthService logic if needed)
  static async resetPassword(user_id: number, newPassword: string) {
    const user = await User.findByPk(user_id);
    if (!user) throw new Error('User not found');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    return { message: 'Password reset successfully' };
  }
}
