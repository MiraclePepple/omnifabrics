// src/modules/user/user.service.ts
import { User } from './user.model';

export class UserService {
  static async completeProfile(
    userId: number,
    data: {
      first_name: string;
      last_name: string;
      gender: string;
      state?: string;
      city?: string;
      country?: string;
      address?: string;
    }
  ) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    await user.update({
      ...data,
      profile_completed: true
    });

    return user;
  }
}
