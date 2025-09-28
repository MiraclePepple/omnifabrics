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
