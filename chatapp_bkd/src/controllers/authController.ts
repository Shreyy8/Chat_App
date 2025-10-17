import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuthRequest, AuthResponse, AuthenticatedRequest } from '../types';

export const authController = {
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, email, password, name }: AuthRequest = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { username: username },
          { email: email }
        ]
      });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'User with this username or email already exists'
        });
        return;
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
        name,
        status: 'offline'
      });

      await user.save();

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user._id.toString(),
        username: user.username
      });

      const refreshToken = generateRefreshToken({
        userId: user._id.toString(),
        username: user.username
      });

      const response: AuthResponse = {
        user: user.toJSON(),
        accessToken,
        refreshToken
      };

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: response
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { identifier, password }: { identifier: string; password: string } = req.body;

      // Find user by username or email
      const user = await User.findOne({
        $or: [
          { username: identifier },
          { email: identifier }
        ]
      });
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      // Update user status to online
      user.status = 'online';
      user.lastSeen = new Date();
      await user.save();

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user._id.toString(),
        username: user.username
      });

      const refreshToken = generateRefreshToken({
        userId: user._id.toString(),
        username: user.username
      });

      const response: AuthResponse = {
        user: user.toJSON(),
        accessToken,
        refreshToken
      };

      res.json({
        success: true,
        message: 'Login successful',
        data: response
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  refreshToken: async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken: token } = req.body;

      if (!token) {
        res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
        return;
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(token);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Generate new tokens
      const accessToken = generateAccessToken({
        userId: user._id.toString(),
        username: user.username
      });

      const newRefreshToken = generateRefreshToken({
        userId: user._id.toString(),
        username: user.username
      });

      const response: AuthResponse = {
        user: user.toJSON(),
        accessToken,
        refreshToken: newRefreshToken
      };

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: response
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
  },

  logout: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (req.user) {
        // Update user status to offline
        req.user.status = 'offline';
        req.user.lastSeen = new Date();
        await req.user.save();
      }

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  getMe: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      res.json({
        success: true,
        data: req.user.toJSON()
      });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};