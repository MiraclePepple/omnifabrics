import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../users/user.model';

export const signupController = async (req: Request, res: Response) => {
  try {
    const { email, phone_number, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      phone_number,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Signup successful. Please complete your profile.",
      user_id: user.user_id,
      email: user.email,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


















export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  // Your login logic here
  res.status(200).json({ message: 'Login successful', token: 'fakeToken123' });
};
