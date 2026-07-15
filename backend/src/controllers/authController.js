import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dynamoDb } from '../config/aws.js';
import dotenv from 'dotenv';

dotenv.config();

const USERS_TABLE = process.env.AWS_DYNAMODB_USERS_TABLE || 'PlacementPortal_Users';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me_in_production';

export const register = async (req, res) => {
  const { userId, password, name, email, role } = req.body;

  if (!userId || !password || !name || !email) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const assignedRole = role === 'admin' ? 'admin' : 'student';

  try {
    // Check if user already exists
    const getParams = {
      TableName: USERS_TABLE,
      Key: { userId },
    };
    
    let userExists = false;
    try {
      const { Item } = await dynamoDb.send(new GetCommand(getParams));
      if (Item) userExists = true;
    } catch (e) {
      console.warn("User fetch check failed, assuming non-existent.", e.message);
    }

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this ID.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
      userId,
      passwordHash,
      role: assignedRole,
      name,
      email,
      phone: '',
      profileCompleted: false,
      createdAt: new Date().toISOString(),
    };

    if (assignedRole === 'student') {
      newUser.branch = '';
      newUser.cgpa = 0;
      newUser.backlogs = 0;
      newUser.resumeUrl = '';
      newUser.offerLetterUrl = '';
    }

    const putParams = {
      TableName: USERS_TABLE,
      Item: newUser,
    };

    await dynamoDb.send(new PutCommand(putParams));

    res.status(201).json({ message: 'Registration successful!' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Error registering user.', error: err.message });
  }
};

export const login = async (req, res) => {
  const { userId, password } = req.body;

  if (!userId || !password) {
    return res.status(400).json({ message: 'ID and password are required.' });
  }

  try {
    const getParams = {
      TableName: USERS_TABLE,
      Key: { userId },
    };

    let Item;
    try {
      const result = await dynamoDb.send(new GetCommand(getParams));
      Item = result.Item;
    } catch (e) {
      console.warn("Table fetch failed, attempting automatic provisioning or check.", e.message);
    }

    if (!Item) {
      // If table is empty or admin account is needed immediately:
      // If the ID is 'admin' and password is 'admin', let's auto-register to bypass initial setup friction
      if (userId === 'admin' && password === 'admin') {
        const passwordHash = await bcrypt.hash('admin', 10);
        const adminItem = {
          userId: 'admin',
          passwordHash,
          role: 'admin',
          name: 'System Admin',
          email: 'admin@college.edu',
          profileCompleted: true,
          createdAt: new Date().toISOString(),
        };
        
        try {
          await dynamoDb.send(new PutCommand({ TableName: USERS_TABLE, Item: adminItem }));
        } catch (dbErr) {
          console.error("Auto-provisioning admin failed (Table might not exist yet):", dbErr.message);
        }
        
        const token = jwt.sign({ userId: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
        return res.status(200).json({
          token,
          user: { userId: 'admin', role: 'admin', name: 'System Admin', email: 'admin@college.edu' }
        });
      }
      
      return res.status(400).json({ message: 'Invalid credentials or DynamoDB table not found. (Tip: Use admin/admin to seed)' });
    }

    const isMatch = await bcrypt.compare(password, Item.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid ID or password.' });
    }

    const token = jwt.sign(
      { userId: Item.userId, role: Item.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Don't send password hash back
    const { passwordHash, ...userResponse } = Item;

    res.status(200).json({
      token,
      user: userResponse,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error during login.', error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const getParams = {
      TableName: USERS_TABLE,
      Key: { userId: req.user.userId },
    };

    const { Item } = await dynamoDb.send(new GetCommand(getParams));

    if (!Item) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { passwordHash, ...userResponse } = Item;
    res.status(200).json(userResponse);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Error retrieving profile.', error: err.message });
  }
};
