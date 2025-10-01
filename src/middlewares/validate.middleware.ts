import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { User } from '../modules/users/user.model';
import { Admin } from '../modules/admin/admin.model';
import { verifyAdminToken, verifyToken } from '../utils/jwt';
import jwt from 'jsonwebtoken';

// Extend Express Request to include user/admin
declare global {
  namespace Express {
    interface Request {
      user?: any;   // you can make this strongly typed if you have a UserAttributes interface
      admin?: any;  // same for Admin model
    }
  }
}

//Validation middleware
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

    // Replace incoming data with validated + sanitized values
    (req as any)[property] = value;
    next();
  };
};

//User authentication middleware
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token received:', token);

  try {
    const decoded: any = verifyToken(token);
    console.log('Decoded token:', decoded);

    const user = await User.findByPk(decoded.user_id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    req.user = user.toJSON();
    next();
  } catch (err: any) {
    console.error('JWT verification error:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'replace_me';

//Admin authentication middleware
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

    // normalize admin instance -> plain object with both naming conventions
    const plain = (adm as any).get ? (adm as any).get({ plain: true }) : adm;

    const normalized = {
      ...plain,
      // ensure id fields are available as adminId and admin_id
      adminId: plain.adminId ?? plain.admin_id ?? plain.id ?? adminId,
      admin_id: plain.admin_id ?? plain.adminId ?? plain.id ?? adminId,
      // ensure super/admin blocked flags are accessible both ways
      isSuperadmin: (plain as any).isSuperadmin ?? (plain as any).is_super_admin ?? false,
      is_super_admin: (plain as any).is_super_admin ?? (plain as any).isSuperadmin ?? false,
      isBlocked: (plain as any).isBlocked ?? (plain as any).is_blocked ?? false,
      is_blocked: (plain as any).is_blocked ?? (plain as any).isBlocked ?? false,
      permissions: (plain as any).permissions ?? {},
    };

    req.admin = normalized;
    next();
  } catch (err: any) {
    console.error('JWT verification error (admin):', err.message ?? err);
    return res.status(401).json({ message: 'Invalid token' });
  }
}


//Require super admin (flexible checks)

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.admin) return res.status(401).json({ message: 'Not authenticated' });

  const isSuper =
    Boolean((req.admin as any).is_super_admin) ||
    Boolean((req.admin as any).isSuperadmin) ||
    Boolean((req.admin as any).is_super_admin === true);

  if (!isSuper) return res.status(403).json({ message: 'Super admin only' });
  next();
}

/**
 * Require active admin (not blocked)
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.admin) return res.status(401).json({ message: 'Not authenticated' });

  const blocked =
    Boolean((req.admin as any).is_blocked) ||
    Boolean((req.admin as any).isBlocked) ||
    Boolean((req.admin as any).is_blocked === true);

  if (blocked) return res.status(403).json({ message: 'Account blocked' });
  next();
}
