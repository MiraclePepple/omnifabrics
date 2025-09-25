import { Request, Response } from 'express';
import Jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from './user.model';
import { UserService } from './user.service';
import { completeProfileSchema } from './user.validation';

export class UserController {
  static async completeProfile(req: Request, res: Response) {
    const { error } = completeProfileSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      // extract user id from token
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'No token provided' });

      const token = authHeader.split(' ')[1];
      const decoded = Jwt.verify(token, process.env.JWT_SECRET as string) as any;

      const updatedUser = await UserService.completeProfile(decoded.id, req.body);

      return res.status(200).json({
        message: 'Profile completed successfully.',
        user: updatedUser
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}

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
  }
}


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









export { login, updateAddress, getProfile};
