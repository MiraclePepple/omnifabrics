import { User } from '../users/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import redis from '../../config/redis';


export const signup = async (data:any) => {
  const hashed = await bcrypt.hash(data.password, 10);
  const u = await User.create({ email: data.email, phone_number: data.phone_number, password: hashed,
    is_active: true, is_suspended: false, created_at: new Date() });
  // optionally send OTP/email to collect name/gender in second step
  return u;
};

export const login = async (email: string, password: string) => {
  const user = await User.findOne({ where: { email }});
  if (!user) throw new Error('Invalid credentials');

  // check suspension
  if ((user as any).is_suspended) {
    throw new Error('Your account is suspended. Contact support.');
  }

  // check active
  if (!(user as any).is_active) {
    throw new Error('Your account is not active. Please verify your email or contact support.');
  }

  const ok = await bcrypt.compare(password, (user as any).password);
  if (!ok) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { userId: (user as any).id, email: (user as any).email },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' }
  );

  return { user, token };
};


// OTP flows: store OTP and expiry in some store (redis or DB), send email
export const sendOtp = async (email:string) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // store OTP in Redis with 10 min expiry
  await redis.set(`otp:${email}`, otp, 'EX', 600); // 600 = 10 minutes

  // send email (or SMS) here
  console.log(`OTP for ${email}: ${otp}`);
  // send email via mailer
  return otp;  // for debugging / tests only
};


export const verifyOtp = async (email: string, otp: string) => {
  // get OTP from Redis
  const storedOtp = await redis.get(`otp:${email}`);

  if (!storedOtp) throw new Error('OTP expired or not found');
  if (storedOtp !== otp) throw new Error('Invalid OTP');

  // activate user
  await User.update({ is_active: true }, { where: { email } });

  // delete OTP after use
  await redis.del(`otp:${email}`);

  return { message: 'Account verified successfully' };
};


