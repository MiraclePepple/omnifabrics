import express from 'express';
import { User } from '../models/userModel';

const router = express.Router();

router.get('/getUsers', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/createUser', async (req, res) => {
  try {
    const newUser = await User.create(req.body);    
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
