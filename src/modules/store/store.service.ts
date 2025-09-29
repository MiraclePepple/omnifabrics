import { Store } from './store.model';
import { User } from '../users/user.model';
import { sendOTPEmail } from '../../utils/email'; // implement email sending
import { randomInt } from 'crypto';
import { Op } from 'sequelize';
import { Otp } from '../auth/otp.model';

export class StoreService {
  // Step 1: request OTP for store creation
  static async requestStoreOTP(email: string) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('User not found');

    // Check if user already has a store
    const existingStore = await Store.findOne({ where: { user_id: user.user_id } });
    if (existingStore) throw new Error('User already has a store');

    const OTP_EXPIRY_MINUTES = 10;

    const code = randomInt(100000, 999999).toString(); // 6-digit OTP
    const expires_at = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // save to otps table
    await Otp.create({ user_id: user.user_id, code, type: 'store_verification', expires_at, used: false });

    // send email
    await sendOTPEmail(email, code);

    return { message: 'OTP sent to email' };
  }

  // Step 2: verify OTP
  static async verifyStoreOTP(user_id: number, code: string) {
  const otp = await Otp.findOne({
    where: {
      user_id,
      code,
      type: 'store_verification',
      used: false,
      expires_at: { [Op.gt]: new Date() } // still valid
    }
  });

  if (!otp) throw new Error('Invalid OTP');

  await otp.update({ used: true }); // mark as used
  return { message: 'OTP verified' };
}

  // Step 3: create store
  static async createStore(user_id: number, storeData: any) {
    const user = await User.findByPk(user_id);
    if (!user) throw new Error('User not found');

    const existingStore = await Store.findOne({ where: { name: storeData.name } });
    if (existingStore) throw new Error('Store name already exists');

    const store = await Store.create({
      user_id,
      name: storeData.name,
      phone_number: storeData.phone_number,
      description: storeData.description,
      is_active: true,
      available_product: 0,
      number_of_sales: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Mark user as seller
    user.is_seller = true;
    await user.save();

    return store;
  }

  // Switch user mode (buyer/seller)
  static async switchMode(user_id: number, mode: 'buyer' | 'seller') {
    const user = await User.findByPk(user_id);
    if (!user) throw new Error('User not found');

    if (mode === 'seller' && !user.is_seller) {
      throw new Error('User is not a seller yet');
    }

    return { message: `Switched to ${mode} mode` };
  }
}
