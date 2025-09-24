import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../utils/jwt';
import { User } from './user.model';
//import { PasswordReset } from '../../models/passwordReset';
import { sendEmail } from '../../utils/email';

const allUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const completeProfile = async (req: Request, res: Response) => {
  const { user_id, first_name, last_name, gender } = req.body;

  try {
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.first_name = first_name;
    user.last_name = last_name;
    user.gender = gender;
    await user.save();

    res.json({ message: 'Profile completed successfully', user });
  } catch (error) {
    console.error('Error completing profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateAddress = async (req: Request, res: Response) => {
  const { user_id, state, city, country, address } = req.body;

  try {
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.state = state;
    user.city = city;
    user.country = country;
    user.address = address;
    await user.save();

    res.json({ message: 'Address updated successfully', user });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ 
        error: 'Account is inactive. Please contact support.',
        contact_admin: 'support@example.com'
      });
    }
    if (user.is_suspended) {
      return res.status(403).json({ 
        error: 'Account is suspended. Please contact support.',
        contact_admin: 'support@example.com'
      });
    }

    const token = generateToken({ userId: user.user_id, email: user.email });
    return res.json({ message: "Login successful", token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getProfile = async (req: Request, res: Response) => {
 try {
  const user = (req as any).user; 
  const { id, first_name, last_name, email, phone_number, is_active, is_suspended, createdAt } = user;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "Profile fetched successfully",
      user: {
        id,
        first_name,
        last_name,
        email,
        phone_number,
        is_active,
        is_suspended,
        createdAt
      },
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "No user found with this email" });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await PasswordReset.create({
      user_id: user.user_id,
      otp_code: otp,
      otp_expires: otpExpires,
    });

    //const hashedOTP = await bcrypt.hash(otp, 10);

    // Save hashed OTP in DB
    //await PasswordReset.create({
      //user_id: user.user_id,
      //otp_code: hashedOTP,
      //otp_expires: otpExpires,
    //});

    // Send plain OTP via email
    //await sendEmail(
      //user.email,
      //"Your Password Reset OTP",
      //`Your OTP code is: ${otp}. It will expire in 10 minutes.`
    //);


    
    // TODO: send OTP via email
    // For now, returning OTP in response for testing
    return res.json({
      message: "OTP sent to your email",
      otp, // remove in production
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


const verifyOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "No user found with this email" });
    }

    // Find latest OTP record for this user
    const record = await PasswordReset.findOne({
      where: { user_id: user.user_id, otp_code: otp, used: false },
      order: [["otp_expires", "DESC"]],
    });

    if (!record) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (record.otp_expires < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    //const isValid = await bcrypt.compare(otp, record.otp_code);
    //if (!isValid) {
     // return res.status(400).json({ message: "Invalid OTP" });
    //}

    return res.json({ message: "OTP verified successfully. You may reset your password." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "No user found with this email" });
    }

    // Find latest OTP record
    const record = await PasswordReset.findOne({
      where: { user_id: user.user_id, otp_code: otp, used: false },
      order: [["otp_expires", "DESC"]],
    });

    if (!record) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (record.otp_expires < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    //const isValid = await bcrypt.compare(otp, record.otp_code);
    //if (!isValid) return res.status(400).json({ message: "Invalid OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Mark OTP as used
    record.used = true;
    await record.save();

    return res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};










export { allUsers, signUp, login, 
  completeProfile, updateAddress, getProfile, 
  forgotPassword, verifyOTP, resetPassword };
