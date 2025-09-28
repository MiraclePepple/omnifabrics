import { UserAttributes } from '../../modules/user/user.types';

declare global {
  namespace Express {
    interface Request {
      user?: UserAttributes; // typed req.user
    }
  }
}
