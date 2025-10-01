import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { User } from '../modules/users/user.model';
import { Admin } from '../modules/admin/admin.model';
import { verifyAdminToken, verifyToken } from '../utils/jwt';

// ---- Strongly typed request extensions ----
declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
      admin?: RequestAdmin;
    }
  }
}

interface RequestUser {
  user_id: number;
  email: string;
  is_seller: boolean;
  [key: string]: any;
}

interface RequestAdmin {
  adminId: number;
  isSuperadmin: boolean;
  isBlocked: boolean;
  permissions: Record<string, any>;
  [key: string]: any;
}

// ---- Validation middleware ----
export const validate = (
  schema: ObjectSchema,
  property: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        errors: error.details.map((detail) => detail.message),
      });
    }
    req[property] = value;
    next();
  };
};

// ---- User authentication middleware ----
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = verifyToken(token);
    if (!decoded?.user_id) throw new Error('Invalid token payload');

    const user = await User.findByPk(decoded.user_id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    req.user = user.toJSON() as RequestUser;
    next();
  } catch (err: any) {
    console.error('JWT verification error (user):', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ---- Admin authentication middleware ----
export async function adminAuthRequired(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = verifyAdminToken(token);
    if (!decoded?.admin_id) throw new Error('Invalid token payload');

    const adminRecord = await Admin.findByPk(decoded.admin_id);
    if (!adminRecord) return res.status(401).json({ message: 'Admin not found' });

    const plain = (adminRecord as any).get?.({ plain: true }) ?? adminRecord;

    // Normalize admin object
    req.admin = {
      ...plain,
      adminId: plain.adminId ?? plain.admin_id ?? plain.id ?? decoded.admin_id,
      isSuperadmin: Boolean(plain.isSuperadmin ?? plain.is_super_admin),
      isBlocked: Boolean(plain.isBlocked ?? plain.is_blocked),
      permissions: plain.permissions ?? {},
    } as RequestAdmin;

    next();
  } catch (err: any) {
    console.error('JWT verification error (admin):', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// ---- Require super admin middleware ----
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.admin) return res.status(401).json({ message: 'Not authenticated' });
  if (!req.admin.isSuperadmin) return res.status(403).json({ message: 'Super admin only' });
  next();
}

// ---- Require active admin (not blocked) middleware ----
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.admin) return res.status(401).json({ message: 'Not authenticated' });
  if (req.admin.isBlocked) return res.status(403).json({ message: 'Account blocked' });
  next();
}
