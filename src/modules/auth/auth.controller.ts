import { Request, Response } from 'express';
import * as svc from './auth.service';

export const signup = async (req:Request, res:Response) => {
  const u = await svc.signup(req.body);
  res.status(201).json({message: 'User registered successfully', u});
};

export const login = async (req:Request, res:Response) => {
  try {
    const r = await svc.login(req.body.email, req.body.password);
    res.json({ message: 'Login successful', r});
  } catch (err:any) {
    res.status(400).json({ error: err.message });
  }
};

export const sendOtp = async (req:Request, res:Response) => {
  try{
    const { email } = req.body;
    const otp = await svc.sendOtp(email);
    res.json({ message: 'OTP sent to your email', otp: process.env.NODE_ENV === 'development' ? otp : 'sent' });
} catch (err:any) {
    res.status(500).json({ error: err.message });
  }
}

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const result = await svc.verifyOtp(email, otp);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    const result = await svc.resetPassword(email, newPassword);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};