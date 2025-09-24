import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  // after authMiddleware, req.user is guaranteed
  user: string | JwtPayload;
}
