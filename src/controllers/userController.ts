import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt';
import { User } from '../models/userModel';

const allUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const signUp = async (req: Request, res: Response) => {
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















export { allUsers, signUp, login, completeProfile, updateAddress };
