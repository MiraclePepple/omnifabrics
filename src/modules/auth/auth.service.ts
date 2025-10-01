import { User } from '../users/user.model';
import { Otp } from './otp.model';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Admin } from '../admin/admin.model';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const OTP_EXPIRY_MINUTES = 10;

export class AuthService {
  // Signup a new user
  static async signup(email: string, phone_number: string, password: string) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) throw new Error('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      phone_number,
      password: hashedPassword,
      is_active: true,
      is_suspended: false,
      is_seller: false, // default
    });

    return user;
  }

  // Complete user profile
  static async completeProfile(user_id: number, data: any) {
    const user = await User.findByPk(user_id);
    if (!user) throw new Error('User not found');

    await user.update({
      first_name: data.first_name,
      last_name: data.last_name,
      gender: data.gender,
      state: data.state,
      city: data.city,
      country: data.country,
      address: data.address
    });

    return user;
  }

  // Login (buyers and sellers use the same route)
  static async login(email: string, password: string) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('Invalid credentials');
    if (!user.is_active || user.is_suspended) throw new Error('Account suspended/disabled');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Invalid credentials');

    // Include is_seller in token so front-end knows user type
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, is_seller: user.is_seller },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await user.update({ last_login_at: new Date() });

    return { user, token };
  }

  // Send OTP (password recovery, store verification)
  static async sendOtp(user_id: number, type: 'password_recovery' | 'store_verification') {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    const otp = await Otp.create({ user_id, code, type, expires_at });
    return otp;
  }

  static async verifyOtp(user_id: number, code: string, type: 'password_recovery' | 'store_verification') {
    const otp = await Otp.findOne({
      where: { user_id, code, type, used: false, expires_at: { [Op.gt]: new Date() } }
    });
    if (!otp) throw new Error('Invalid or expired OTP');

    await otp.update({ used: true });
    return true;
  }

  static async resetPassword(user_id: number, newPassword: string) {
    const user = await User.findByPk(user_id);
    if (!user) throw new Error('User not found');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    return user;
  }
}