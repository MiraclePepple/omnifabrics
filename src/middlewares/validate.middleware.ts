import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { User } from '../modules/users/user.model';
import { Admin } from '../modules/admin/admin.model';
import { verifyAdminToken, verifyToken } from '../utils/jwt';

// Extend Express Request to include user/admin
declare global {
  namespace Express {
    interface Request {
      user?: any;
      admin?: any;
    }
  }
}

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@omnifabrics.example';

// Validation middleware
export const validate = (
  schema: ObjectSchema,
  property: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false });
    if (error) {
      return res.status(400).json({
        errors: error.details.map((detail) => detail.message),
      });
    }
    (req as any)[property] = value;
    next();
  };
};

// User authentication middleware
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = verifyToken(token);
    const user = await User.findByPk(decoded.user_id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Enforce suspended/disabled behavior for SRS:
    if ((user as any).is_suspended || (user as any).is_active === false) {
      return res.status(403).json({
        error: 'Account suspended or disabled. Please contact support.',
        support_email: SUPPORT_EMAIL,
      });
    }

    req.user = (user as any).get ? (user as any).get({ plain: true }) : user;
    next();
  } catch (err: any) {
    console.error('JWT verification error:', err?.message ?? err);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Admin authentication middleware
export async function adminAuthRequired(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = verifyAdminToken(token);
    const adminId = decoded.admin_id;
    const adm = await Admin.findByPk(adminId);
    if (!adm) return res.status(401).json({ message: 'Invalid token (admin not found)' });

    const plain = (adm as any).get ? (adm as any).get({ plain: true }) : adm;

    const normalized = {
      ...plain,
      adminId: plain.adminId ?? plain.admin_id ?? plain.id ?? adminId,
      admin_id: plain.admin_id ?? plain.adminId ?? plain.id ?? adminId,
      isSuperadmin: (plain as any).isSuperadmin ?? (plain as any).is_superadmin ?? false,
      is_super_admin: (plain as any).is_superadmin ?? (plain as any).isSuperadmin ?? false,
      isBlocked: (plain as any).isBlocked ?? (plain as any).is_blocked ?? false,
      is_blocked: (plain as any).is_blocked ?? (plain as any).isBlocked ?? false,
      permissions: (plain as any).permissions ?? {},
    };

    // Blocked admin check
    if (normalized.isBlocked || normalized.is_blocked) {
      return res.status(403).json({ message: 'Admin account blocked' });
    }

    req.admin = normalized;
    next();
  } catch (err: any) {
    console.error('JWT verification error (admin):', err?.message ?? err);
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Quick guard: ensure admin is not blocked
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.admin) return res.status(401).json({ message: 'Not authenticated' });

  const blocked = Boolean((req.admin as any).is_blocked) || Boolean((req.admin as any).isBlocked);
  if (blocked) return res.status(403).json({ message: 'Account blocked' });
  next();
}

// Require exact super admin
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.admin) return res.status(401).json({ message: 'Not authenticated' });

  const isSuper =
    Boolean((req.admin as any).is_super_admin) ||
    Boolean((req.admin as any).isSuperadmin) ||
    Boolean((req.admin as any).isSuperadmin === true);

  if (!isSuper) return res.status(403).json({ message: 'Super admin only' });
  next();
}

/**
 * requirePermission(permissionName)
 * Checks the admin's permissions object (populated by AdminService.getPermissions)
 * Super admin bypasses.
 */
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) return res.status(401).json({ message: 'Not authenticated' });

    const admin = req.admin as any;
    const isSuper = Boolean(admin.isSuperadmin) || Boolean(admin.is_super_admin) || admin.isSuperAdmin;
    if (isSuper) return next();

    const perms = admin.permissions;
    if (!perms) return res.status(403).json({ message: 'Permission denied' });

    // If permissions were stored as 'ALL' or true for super-like access
    if (perms === 'ALL' || perms === true) return next();

    // perms is expected to be object { permission_name: true/false }
    if (typeof perms === 'object' && perms[permission]) return next();

    return res.status(403).json({ message: 'Permission denied' });
  };
}

/**
 * requireSeller
 * Lightweight middleware to ensure the requester is a seller.
 * Useful for seller-only routes (create product, update product).
 */
export function requireSeller(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  const isSeller = Boolean((req.user as any).is_seller);
  if (!isSeller) return res.status(403).json({ message: 'Seller only' });
  next();
}

export default {
  validate,
  authenticate,
  adminAuthRequired,
  requireSuperAdmin,
  requireAdmin,
  requirePermission,
  requireSeller,
};
