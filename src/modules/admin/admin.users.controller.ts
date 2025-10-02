import { Request, Response } from 'express';
import { User } from '../users/user.model'; // adjust path if you keep admin modules in different folder

// Admin user management controller
export const AdminUsersController = {
  // GET /admin/users?type=buyers|sellers|suspended
  async listUsers(req: Request, res: Response) {
    try {
      const type = (req.query.type as string) || '';
      const where: any = {};

      if (type === 'sellers') where.is_seller = true;
      if (type === 'buyers') where.is_seller = false;
      if (type === 'suspended') where.is_suspended = true;

      const users = await User.findAll({
        where,
        attributes: { exclude: ['password'] },
      });

      return res.json({ users });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  },

  // GET /admin/users/:id
  async getUser(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
      if (!user) return res.status(404).json({ message: 'User not found' });
      return res.json({ user });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  },

  // PATCH /admin/users/:id/block
  async blockUser(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      (user as any).is_active = false;
      (user as any).is_suspended = true;
      await user.save();
      return res.json({ message: 'User blocked/suspended' });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  },

  // PATCH /admin/users/:id/unblock
  async unblockUser(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      (user as any).is_active = true;
      (user as any).is_suspended = false;
      await user.save();
      return res.json({ message: 'User unblocked/activated' });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  },

  // PATCH /admin/users/:id/suspend
  async suspendUser(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      (user as any).is_suspended = true;
      await user.save();
      return res.json({ message: 'User suspended' });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  },

  // PATCH /admin/users/:id/activate
  async activateUser(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      (user as any).is_suspended = false;
      (user as any).is_active = true;
      await user.save();
      return res.json({ message: 'User activated' });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  },

  // DELETE /admin/users/:id
  async deleteUser(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      await user.destroy();
      return res.json({ message: 'User deleted' });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  },
};
