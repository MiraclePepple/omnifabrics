// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../../utils/jwt"

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = verifyToken(token);
    (req as any).user = decoded; // attach user to request
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
