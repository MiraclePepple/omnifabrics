declare namespace Express {
  export interface Request {
    user?: {
      user_id: number;
      email?: string;
    };
  }
}
