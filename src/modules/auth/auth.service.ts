import { User } from '../users/user.model';
import bcrypt from 'bcryptjs';
import { UniqueConstraintError } from 'sequelize';
import { generateToken } from '../../utils/jwt';

// In-memory OTP store (email → { otp, expiresAt })
const otpStore: Record<string, { otp: string; expiresAt: number }> = {};

// === SIGNUP ===
export const signup = async (data: any) => {
  const hashed = await bcrypt.hash(data.password, 10);

  // user is active by default 
  try{ 
    const u = await User.create({
    email: data.email,
    phone_number: data.phone_number,
    password: hashed,
    is_active: true,   
    is_suspended: false,  
    created_at: new Date()
  });

  return u;
} catch (err: any) {
  console.error('Signup error:', err); // will show the real message
    if (err instanceof UniqueConstraintError) {
      throw new Error('A user with this email already exists');
    }
    throw err;
  }
};

// === LOGIN ===
export const login = async (email: string, password: string) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {const err: any = new Error('Invalid email or password');
    err.status = 401;
    throw err;}

  const ok = await bcrypt.compare(password, (user as any).password);
  if (!ok) {const err: any = new Error('Invalid email or password');
    err.status = 401;
    throw err;}

  // check suspension and active user
  if ((user as any).is_suspended) {
    const err: any = new Error('Account is suspended. Please contact support.');
    err.status = 403;
    err.contact_admin = process.env.SUPPORT_EMAIL || 'support@example.com';
    throw err;
  }

  if (!user.is_active) {
    const err: any = new Error('Account is inactive. Please contact support.');
    err.status = 403;
    err.contact_admin = process.env.SUPPORT_EMAIL || 'support@example.com';
    throw err;
  }

  const token = generateToken({ user_id: user.user_id });

  return { user, token };
};

//SEND OTP (for forgot password)
export const sendOtp = async (email: string) => {
  // check user exists
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('No account found with this email');

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // store OTP in memory with 10 min expiry
  otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

  // send email (or SMS) here
  console.log(`OTP for password reset ${email}: ${otp}`);

  return otp; // return for debugging / tests only
};

// === VERIFY OTP (for forgot password) ===
export const verifyOtp = async (email: string, otp: string) => {
  const entry = otpStore[email];
  if (!entry) throw new Error('OTP expired or not found');
  if (entry.expiresAt < Date.now()) {
    delete otpStore[email];
    throw new Error('OTP expired');
  }
  if (entry.otp !== otp) throw new Error('Invalid OTP');

  // delete OTP after use
  delete otpStore[email];

  return { message: 'OTP verified successfully. You can now reset your password.' };
};

// === RESET PASSWORD AFTER OTP ===
export const resetPassword = async (email: string, newPassword: string) => {
  const hashed = await bcrypt.hash(newPassword, 10);
  await User.update({ password: hashed }, { where: { email } });
  return { message: 'Password reset successfully' };
};
