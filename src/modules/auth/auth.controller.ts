import { Request, Response } from 'express';
import * as svc from './auth.service';

export const signup = async (req:Request, res:Response) => {
  const u = await svc.signup(req.body);
  res.status(201).json(u);
};

export const login = async (req:Request, res:Response) => {
  try {
    const r = await svc.login(req.body.email, req.body.password);
    res.json(r);
  } catch (err:any) {
    res.status(400).json({ error: err.message });
  }
};

export const sendOtp = async (req:Request, res:Response) => {
  try{
    const { email } = req.body;
    const otp = await svc.sendOtp(email);
    res.json({ otp: process.env.NODE_ENV === 'development' ? otp : 'sent' });
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
