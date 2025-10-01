import { Request, Response } from 'express';
import { AdminService } from './admin.service';

export const AdminController = {
  async createAdminBySuper(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const createdBy = (req as any).admin?.adminId ?? (req as any).user?.adminId;
      const admin = await AdminService.createAdminBySuperAdmin(email, createdBy);
      return res.status(201).json({ admin });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AdminService.login(email, password);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  },

  async firstTimeSetup(req: Request, res: Response) {
    try {
      const adminId = (req as any).admin?.adminId ?? (req as any).user?.adminId;
      if (!adminId) return res.status(401).json({ message: 'Unauthorized' });

      const { firstName, lastName, newPassword, email } = req.body;
      if (!firstName || !lastName || !newPassword)
        return res.status(400).json({ message: 'Missing fields' });

      const result = await AdminService.completeFirstTimeSetup(adminId, { firstName, lastName, newPassword, email });
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await AdminService.forgotPassword(email);
      return res.json({ message: 'OTP sent to email' });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  },

  async verifyOTP(req: Request, res: Response) {
    try {
      const { email, code } = req.body;
      const result = await AdminService.verifyOTP(email, code);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { resetToken, newPassword } = req.body;
      await AdminService.resetPasswordWithToken(resetToken, newPassword);
      return res.json({ message: 'Password updated' });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  },

  async getProfile(req: Request, res: Response) {
    try {
      const adminId = (req as any).admin?.adminId ?? (req as any).user?.adminId;
      if (!adminId) return res.status(401).json({ message: 'Unauthorized' });

      const profile = await AdminService.getProfile(adminId);
      return res.json({ profile });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const adminId = (req as any).admin?.adminId ?? (req as any).user?.adminId;
      if (!adminId) return res.status(401).json({ message: 'Unauthorized' });

      const payload = req.body;
      const updated = await AdminService.updateProfile(adminId, payload);
      return res.json({ admin: updated });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  },

  async changePassword(req: Request, res: Response) {
    try {
      const adminId = (req as any).admin?.adminId ?? (req as any).user?.adminId;
      if (!adminId) return res.status(401).json({ message: 'Unauthorized' });

      const { oldPassword, newPassword } = req.body;
      await AdminService.changePassword(adminId, oldPassword, newPassword);
      return res.json({ message: 'Password changed' });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  },

  async blockAdmin(req: Request, res: Response) {
    try {
      const targetId = Number(req.params.id);
      const result = await AdminService.blockAdmin(targetId);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  },

  async unblockAdmin(req: Request, res: Response) {
    try {
      const targetId = Number(req.params.id);
      const result = await AdminService.unblockAdmin(targetId);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  },

  async listAdmins(req: Request, res: Response) {
    try {
      const admins = await AdminService.listAdmins();
      return res.json({ admins });
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  },

  async deleteAdmin(req: Request, res: Response) {
    try {
      const targetId = Number(req.params.id);
      const performedBy = (req as any).admin?.adminId ?? (req as any).user?.adminId;
      const result = await AdminService.deleteAdmin(targetId, performedBy);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  },

  async assignPermissions(req: Request, res: Response) {
    try {
      const targetId = Number(req.params.id);
      const permissions: Record<string, boolean> = req.body.permissions ?? req.body;
      const result = await AdminService.assignPermissionsByName(targetId, permissions);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  },

  async replacePermissions(req: Request, res: Response) {
    try {
      const targetId = Number(req.params.id);
      const permissions: Record<string, boolean> = req.body.permissions ?? req.body;
      const result = await AdminService.replacePermissionsByName(targetId, permissions);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  },

  async removePermissions(req: Request, res: Response) {
    try {
      const targetId = Number(req.params.id);
      const keys: string[] = req.body.keys ?? [];
      if (!Array.isArray(keys) || keys.length === 0)
        return res.status(400).json({ message: 'Provide keys: string[] in body' });

      const result = await AdminService.removePermissionsByName(targetId, keys);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  },

  async getPermissions(req: Request, res: Response) {
    try {
      const targetId = Number(req.params.id);
      const result = await AdminService.getPermissions(targetId);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  },

  async setSuperAdmin(req: Request, res: Response) {
    try {
      const targetId = Number(req.params.id);
      const { makeSuper } = req.body;
      if (typeof makeSuper !== 'boolean')
        return res.status(400).json({ message: 'makeSuper must be boolean' });

      const result = await AdminService.setSuperAdminStatus(targetId, makeSuper);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ message: err.message });
    }
  },
};
