import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import { Admin } from './admin.model';
import PasswordReset from '../auth/passwordReset.model';
import { emailService } from '../../utils/email';
import { generateAdminToken } from '../../utils/jwt';
import { AdminPermission } from '../admin_permission/admin_permission.model';
import Permission from '../permissions/permission.model';

function generateTempPassword(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$';
  let s = '';
  for (let i = 0; i < length; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const AdminService = {
  // ------------------- CREATE ADMIN -------------------
  async createAdminBySuperAdmin(email: string, createdByAdminId?: number) {
    const existing = await Admin.findOne({ where: { email } });
    if (existing) throw new Error('Admin with that email already exists');

    const tempPassword = generateTempPassword();
    const hashed = await bcrypt.hash(tempPassword, 10);

    const admin = await Admin.create({ email, password: hashed });

    // Send temporary password via email
    const html = `
      <p>You've been invited as an admin on Omnifabrics.</p>
      <p>Your temporary password is: <b>${tempPassword}</b></p>
      <p>Please log in and complete your profile (you will be required to change this password).</p>
    `;
    await emailService.send(email, 'You have been added as an Admin', html);

    const { password, ...sanitized } = (admin as any).get({ plain: true });
    return sanitized;
  },

  // ------------------- LOGIN -------------------
  async login(email: string, password: string) {
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) throw new Error('Invalid credentials');

    const blocked = (admin as any).isBlocked ?? (admin as any).is_blocked;
    if (blocked) throw new Error('Account is blocked. Please contact super admin.');

    const isMatch = await bcrypt.compare(password, (admin as any).password);
    if (!isMatch) throw new Error('Invalid credentials');

    const needsProfileCompletion = !(admin as any).firstName && !(admin as any).lastName;

    const { permissions, isSuperAdmin } = await this.getPermissions((admin as any).adminId);

    const payload = {
      admin_id: (admin as any).adminId,
      isSuperAdmin,
      first_time: needsProfileCompletion,
      permissions,
    };

    const token = generateAdminToken(payload);

    return {
      token,
      needsProfileCompletion,
      admin: {
        adminId: (admin as any).adminId,
        firstName: (admin as any).firstName ?? (admin as any).first_name ?? null,
        lastName: (admin as any).lastName ?? (admin as any).last_name ?? null,
        email: (admin as any).email,
        isSuperAdmin,
        permissions,
      },
    };
  },

  // ------------------- FIRST-TIME SETUP -------------------
  async completeFirstTimeSetup(adminId: number, data: { firstName: string; lastName: string; newPassword: string; email?: string }) {
    const admin = await Admin.findByPk(adminId);
    if (!admin) throw new Error('Admin not found');

    const hashed = await bcrypt.hash(data.newPassword, 10);
    (admin as any).firstName = data.firstName;
    (admin as any).lastName = data.lastName;
    if (data.email) (admin as any).email = data.email;
    (admin as any).password = hashed;

    await admin.save();

    const { permissions, isSuperAdmin } = await this.getPermissions(adminId);
    const token = generateAdminToken({ admin_id: adminId, isSuperAdmin, first_time: false, permissions });

    const { password, ...san } = (admin as any).get({ plain: true });
    return { token, admin: san };
  },

  // ------------------- PASSWORD RESET -------------------
  async forgotPassword(email: string) {
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) throw new Error('No admin with that email');

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await PasswordReset.create({
      user_id: admin.adminId,
      otp_code: code,
      otp_expires: expiresAt,
      used: false,
    });

    await emailService.sendOTP(email, code);
    return { message: 'OTP sent' };
  },

  async verifyOTP(email: string, code: string) {
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) throw new Error('No admin with that email');

    const pr = await PasswordReset.findOne({
      where: {
        user_id: admin.adminId,
        otp_code: code,
        used: false,
        otp_expires: { [Op.gt]: new Date() },
      },
      order: [['id', 'DESC']],
    });
    if (!pr) throw new Error('Invalid or expired OTP');

    const resetToken = generateAdminToken({ admin_id: admin.adminId, prId: pr.id }, '15m');
    return { resetToken };
  },

  async resetPasswordWithToken(resetToken: string, newPassword: string) {
    let data: any;
    try {
      data = jwt.verify(resetToken, process.env.JWT_SECRET as string);
    } catch {
      throw new Error('Invalid or expired reset token');
    }

    const adminId = data?.admin_id;
    const prId = data?.prId;
    if (!adminId || !prId) throw new Error('Invalid reset token payload');

    const pr = await PasswordReset.findByPk(prId);
    if (!pr || pr.used) throw new Error('Invalid or already used reset request');
    if (new Date(pr.otp_expires) < new Date()) throw new Error('Reset request expired');

    const admin = await Admin.findByPk(adminId);
    if (!admin) throw new Error('Admin not found');

    (admin as any).password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    pr.used = true;
    await pr.save();

    return { message: 'Password updated' };
  },

  // ------------------- PROFILE -------------------
  async getProfile(adminId: number) {
    const admin = await Admin.findByPk(adminId, {
      attributes: ['adminId', 'firstName', 'lastName', 'email', 'isSuperadmin', 'createdAt', 'updatedAt'],
    });
    if (!admin) throw new Error('Admin not found');
    return admin;
  },

  async updateProfile(adminId: number, payload: { firstName?: string; lastName?: string; email?: string }) {
    const admin = await Admin.findByPk(adminId);
    if (!admin) throw new Error('Admin not found');

    if (payload.firstName !== undefined) (admin as any).firstName = payload.firstName;
    if (payload.lastName !== undefined) (admin as any).lastName = payload.lastName;
    if (payload.email !== undefined) (admin as any).email = payload.email;

    await admin.save();
    const { password, ...san } = (admin as any).get({ plain: true });
    return san;
  },

  async changePassword(adminId: number, oldPassword: string, newPassword: string) {
    const admin = await Admin.findByPk(adminId);
    if (!admin) throw new Error('Admin not found');

    const match = await bcrypt.compare(oldPassword, (admin as any).password);
    if (!match) throw new Error('Old password incorrect');

    (admin as any).password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    return { message: 'Password changed' };
  },

  // ------------------- ADMIN LIST & BLOCK -------------------
  async blockAdmin(targetAdminId: number) {
    const admin = await Admin.findByPk(targetAdminId);
    if (!admin) throw new Error('Admin not found');

    (admin as any).isBlocked = true;
    await admin.save();
    return { message: 'Admin blocked' };
  },

  async unblockAdmin(targetAdminId: number) {
    const admin = await Admin.findByPk(targetAdminId);
    if (!admin) throw new Error('Admin not found');

    (admin as any).isBlocked = false;
    await admin.save();
    return { message: 'Admin unblocked' };
  },

  async listAdmins() {
    return await Admin.findAll({
      attributes: ['adminId', 'firstName', 'lastName', 'email', 'isSuperadmin', 'createdAt', 'updatedAt'],
    });
  },

  async deleteAdmin(targetAdminId: number, performedBy?: number) {
    const target = await Admin.findByPk(targetAdminId);
    if (!target) throw new Error('Admin not found');

    if (target.isSuperadmin) {
      const superCount = await Admin.count({ where: { isSuperadmin: true } });
      if (superCount <= 1) throw new Error('Cannot delete the only super admin');
    }

    if (performedBy) {
      console.log(`Admin ${performedBy} deleted admin ${targetAdminId}`);
    }

    await target.destroy();
    return { message: 'Admin deleted' };
  },

  // ------------------- PERMISSIONS -------------------
  async getPermissions(adminId: number) {
    const admin = await Admin.findByPk(adminId);
    if (!admin) throw new Error('Admin not found');

    if (admin.isSuperadmin) return { isSuperAdmin: true, permissions: 'ALL' };

    const perms = await AdminPermission.findAll({
      where: { admin_id: adminId },
      include: [{ model: Permission, as: 'Permission', attributes: ['name'] }], // use alias
    });

    const permissions: Record<string, boolean> = {};
    perms.forEach((p: any) => {
      const permName = p.Permission?.name;
      if (permName) permissions[permName] = !!p.granted;
    });

    return { isSuperAdmin: false, permissions };
  },

  async assignPermissionsByName(adminId: number, permissions: Record<string, boolean>) {
    const admin = await Admin.findByPk(adminId);
    if (!admin) throw new Error('Admin not found');

    const permRecords = await Permission.findAll({ where: { name: Object.keys(permissions) } });
    for (const perm of permRecords) {
      const granted = permissions[perm.name] ? 1 : 0;
      await AdminPermission.upsert({ admin_id: adminId, permission_id: perm.permission_id, granted });
    }

    return this.getPermissions(adminId);
  },

  async replacePermissionsByName(adminId: number, permissions: Record<string, boolean>) {
    const admin = await Admin.findByPk(adminId);
    if (!admin) throw new Error('Admin not found');

    await AdminPermission.destroy({ where: { admin_id: adminId } });

    const permRecords = await Permission.findAll({ where: { name: Object.keys(permissions) } });
    for (const perm of permRecords) {
      const granted = permissions[perm.name] ? 1 : 0;
      await AdminPermission.create({ admin_id: adminId, permission_id: perm.permission_id, granted });
    }

    return this.getPermissions(adminId);
  },

  async removePermissionsByName(adminId: number, permissionNames: string[]) {
    const admin = await Admin.findByPk(adminId);
    if (!admin) throw new Error('Admin not found');

    const permRecords = await Permission.findAll({ where: { name: permissionNames } });
    const permIds = permRecords.map((p) => p.permission_id);

    if (permIds.length > 0) {
      await AdminPermission.destroy({ where: { admin_id: adminId, permission_id: permIds } });
    }

    return this.getPermissions(adminId);
  },

  // ------------------- SUPER ADMIN -------------------
  async setSuperAdminStatus(targetAdminId: number, makeSuper: boolean) {
    const target = await Admin.findByPk(targetAdminId);
    if (!target) throw new Error('Admin not found');

    if (makeSuper) {
      const currentSuperCount = await Admin.count({ where: { isSuperadmin: true } });
      if (currentSuperCount >= 1) throw new Error('A super admin already exists. Demote the current one first.');
    }

    target.isSuperadmin = makeSuper;
    await target.save();

    return { message: `Admin ${makeSuper ? 'promoted to' : 'demoted from'} super admin` };
  },
};
