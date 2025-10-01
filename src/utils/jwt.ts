import jwt, { Secret, SignOptions, JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as Secret;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in your .env file');
}

// Define a type for our JWT payload
export interface TokenPayload {
  user_id: number; // must match your User primary key
  // you can add other fields if needed, e.g., role?: string
}

// Admin token payload
export interface AdminTokenPayload {
  admin_id: number;
  is_super_admin?: boolean;
  first_time?: boolean;
  [k: string]: any;
}

// Generate a JWT token
export const generateToken = (
  payload: TokenPayload,
  expiresIn: SignOptions['expiresIn'] = '1h'
): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

// Verify a JWT token and return the decoded payload
export const verifyToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

  if (!decoded || typeof decoded === 'string' || !('user_id' in decoded)) {
    throw new Error('Invalid token payload');
  }

  return decoded as TokenPayload;
};

export const generateAdminToken = (
  payload: AdminTokenPayload,
  expiresIn: SignOptions['expiresIn'] = '7d'
): string => {
  return jwt.sign(payload as JwtPayload, JWT_SECRET, { expiresIn });
};

export const verifyAdminToken = (token: string): AdminTokenPayload => {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
  if (!decoded || typeof decoded === 'string') {
    throw new Error('Invalid token');
  }

  const anyDecoded = decoded as any;
  const adminId = anyDecoded.admin_id ?? anyDecoded.adminId ?? anyDecoded.id;
  if (!adminId) {
    throw new Error('Invalid admin token payload: missing admin id');
  }

  // return decoded + normalized admin_id
  return { ...(decoded as any), admin_id: adminId } as AdminTokenPayload;
};