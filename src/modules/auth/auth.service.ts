import { User } from '../users/user.model';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const signup = async (data:any) => {
  const hashed = await bcrypt.hash(data.password, 10);
  const u = await User.create({ email: data.email, phone_number: data.phone_number, password: hashed, created_at: new Date() });
  // optionally send OTP/email to collect name/gender in second step
  return u;
};

export const login = async (email:string, password:string) => {
  const user = await User.findOne({ where: { email }});
  if (!user) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, (user as any).password);
  if (!ok) throw new Error('Invalid credentials');
  // build token (JWT) — stubbed
  const token = crypto.randomBytes(16).toString('hex');
  return { user, token };
};

// OTP flows: store OTP and expiry in some store (redis or DB), send email
export const sendOtp = async (email:string) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // send email via mailer
  return otp;
};
