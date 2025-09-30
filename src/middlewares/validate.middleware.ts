import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { User } from '../modules/users/user.model';
import { Admin } from '../modules/admin/admin.model';
import { verifyToken } from '../utils/jwt';
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
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    const adm = await Admin.findByPk(payload.id);

    if (!adm) return res.status(401).json({ message: 'Invalid token' });

    req.admin = adm;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

//Require Super Admin
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.admin) return res.status(401).json({ message: 'Not authenticated' });
  if (!req.admin.is_super_admin) return res.status(403).json({ message: 'Super admin only' });
  next();
}

//Require Admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.admin) return res.status(401).json({ message: 'Not authenticated' });
  if (req.admin.is_blocked) return res.status(403).json({ message: 'Account blocked' });
  next();
}
