import { User } from '../users/user.model';
import Store from '../store/store.model';
import { Product } from '../products/product.model';
import { Op } from 'sequelize';

export class AdminUserService {
  // Get all users with optional filters
  static async getAllUsers(filters?: { is_seller?: boolean; is_active?: boolean; is_suspended?: boolean }) {
    const where: any = {};
    if (filters?.is_seller !== undefined) where.is_seller = filters.is_seller;
    if (filters?.is_active !== undefined) where.is_active = filters.is_active;
    if (filters?.is_suspended !== undefined) where.is_suspended = filters.is_suspended;

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      include: [
        { model: Store, as: 'stores' }, // optional: include user's store
      ],
    });

    return users;
  }

  // Get single user by ID
  static async getUserById(user_id: number) {
    const user = await User.findByPk(user_id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Store, as: 'stores', include: [{ model: Product, as: 'products' }] }],
    });

    if (!user) throw new Error('User not found');
    return user;
  }

  // Block or unblock a user
  static async blockUnblockUser(user_id: number, block: boolean) {
    const user = await User.findByPk(user_id);
    if (!user) throw new Error('User not found');

    user.is_active = !block;
    await user.save();

    return { message: `User ${block ? 'blocked' : 'unblocked'} successfully` };
  }

  // Suspend or activate a user
  static async suspendActivateUser(user_id: number, suspend: boolean) {
    const user = await User.findByPk(user_id);
    if (!user) throw new Error('User not found');

    user.is_suspended = suspend;
    await user.save();

    return { message: `User ${suspend ? 'suspended' : 'activated'} successfully` };
  }

  // Delete user (soft delete)
  static async deleteUser(user_id: number) {
    const user = await User.findByPk(user_id);
    if (!user) throw new Error('User not found');

    await user.destroy();
    return { message: 'User deleted successfully' };
  }
}
