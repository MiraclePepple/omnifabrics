import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { User } from '../modules/users/user.model';
import { verifyToken } from '../utils/jwt';


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


export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token received:', token); // 👈 see the token

  try {
    const decoded = verifyToken(token);
    console.log('Decoded token:', decoded); // 👈 see decoded payload

    const user = await User.findByPk(decoded.user_id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    (req as any).user = user.toJSON();
    next();
  } catch (err: any) {
    console.error('JWT verification error:', err.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
