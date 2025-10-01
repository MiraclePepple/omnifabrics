import { Request, Response } from 'express';
import { AdminUserService } from './admin.user.service';

export class AdminUserController {
  static async listUsers(req: Request, res: Response) {
    try {
      const { is_seller, is_active, is_suspended } = req.query;
      const filters: any = {};
      if (is_seller !== undefined) filters.is_seller = is_seller === 'true';
      if (is_active !== undefined) filters.is_active = is_active === 'true';
      if (is_suspended !== undefined) filters.is_suspended = is_suspended === 'true';

      const users = await AdminUserService.getAllUsers(filters);
      return res.json({ users });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getUser(req: Request, res: Response) {
    try {
      const user_id = parseInt(req.params.id);
      const user = await AdminUserService.getUserById(user_id);
      return res.json({ user });
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }

  static async blockUnblockUser(req: Request, res: Response) {
    try {
      const user_id = parseInt(req.params.id);
      const { block } = req.body;
      const result = await AdminUserService.blockUnblockUser(user_id, block);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async suspendActivateUser(req: Request, res: Response) {
    try {
      const user_id = parseInt(req.params.id);
      const { suspend } = req.body;
      const result = await AdminUserService.suspendActivateUser(user_id, suspend);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      const user_id = parseInt(req.params.id);
      const result = await AdminUserService.deleteUser(user_id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
