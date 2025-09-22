import { Request, Response, NextFunction } from "express";
import { User } from "../models/userModel";
import { verifyToken } from "../utils/jwt";

export const signUpAuth = async (req: Request, res: Response, next: NextFunction) => {
  const { email, phone_number, password } = req.body;

  if (!email || !phone_number || !password) {
        return res.status(400).json({ message: "Email, phone number, and password are required" });
      }
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }
  next();
};

export const auth = (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    try {
      const decoded = verifyToken(token) as { userId: number };
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      if (user.is_suspended) {
        return res.status(403).json({
          error: "Your account has been suspended. Please contact the admin.",
          contact_admin: "mailto:admin@example.com",
        });
      }

      if (!user.is_active) {
        return res.status(403).json({
          error: "Your account is inactive. Please contact the admin.",
          contact_admin: "mailto:admin@example.com",
        });
      }

      (req as any).user = user;
      next();
    } catch (err) {
      console.error(err);
      return res.status(403).json({ error: "Invalid token" });
    }
  })().catch(next); // catch any top-level async errors
};


