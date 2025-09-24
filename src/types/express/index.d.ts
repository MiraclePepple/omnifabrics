import { UserAttributes } from '../../modules/user/user.model'; // or your user interface

declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: number; // adjust to your real user fields
        email?: string;
        // ...any other properties you attach
      };
    }
  }
}
