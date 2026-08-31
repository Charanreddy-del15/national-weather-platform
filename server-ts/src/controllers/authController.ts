import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, run } from '../db/database';
import { JWT_SECRET, AuthRequest } from '../middleware/auth';
import { User } from '../types';

export class AuthController {
  public static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const users = await query<User>(`SELECT * FROM users WHERE email = ?`, [email]);
      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const user = users[0];
      const valid = await bcrypt.compare(password, user.password_hash || '');
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  public static async me(req: AuthRequest, res: Response) {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    return res.json({ user: req.user });
  }
}
