import { Response } from 'express';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';
import { UpdateUserRequest } from '../types';

export const userController = {
  // Get all users (with pagination and search)
  getAllUsers: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 20, search, exclude } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      let query: any = {};
      
      // Exclude current user and specified users
      const excludeIds = [req.user?._id.toString()];
      if (exclude) {
        excludeIds.push(...String(exclude).split(','));
      }
      query._id = { $nin: excludeIds };

      // Search functionality
      if (search) {
        const searchRegex = new RegExp(String(search), 'i');
        query.$or = [
          { name: searchRegex },
          { username: searchRegex }
        ];
      }

      const users = await User.find(query)
        .select('-password -__v')
        .sort({ name: 1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await User.countDocuments(query);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
            hasNext: skip + Number(limit) < total,
            hasPrev: Number(page) > 1
          }
        }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get user by ID
  getUserById: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await User.findById(id).select('-password -__v');
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update user profile
  updateUser: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateUserRequest = req.body;

      // Check if user is updating their own profile
      if (req.user?._id.toString() !== id) {
        res.status(403).json({
          success: false,
          message: 'You can only update your own profile'
        });
        return;
      }

      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Update user fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateUserRequest] !== undefined) {
          (user as any)[key] = updateData[key as keyof UpdateUserRequest];
        }
      });

      await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user.toPublicJSON()
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Upload user avatar
  uploadAvatar: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Check if user is updating their own avatar
      if (req.user?._id.toString() !== id) {
        res.status(403).json({
          success: false,
          message: 'You can only update your own avatar'
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
        return;
      }

      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Update avatar URL
      user.avatar = `/api/files/${req.file.filename}`;
      await user.save();

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          avatar: user.avatar
        }
      });
    } catch (error) {
      console.error('Upload avatar error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update user status
  updateStatus: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, statusMessage } = req.body;

      // Check if user is updating their own status
      if (req.user?._id.toString() !== id) {
        res.status(403).json({
          success: false,
          message: 'You can only update your own status'
        });
        return;
      }

      const user = await User.findById(id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      if (status) {
        user.status = status;
        if (status === 'online') {
          user.lastSeen = new Date();
        }
      }

      if (statusMessage !== undefined) {
        user.statusMessage = statusMessage;
      }

      await user.save();

      res.json({
        success: true,
        message: 'Status updated successfully',
        data: {
          status: user.status,
          statusMessage: user.statusMessage,
          lastSeen: user.lastSeen
        }
      });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Search users
  searchUsers: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { q, limit = 10 } = req.query;

      if (!q || String(q).trim().length < 2) {
        res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters'
        });
        return;
      }

      const users = await User.searchUsers(
        String(q),
        [req.user?._id.toString()]
      );

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get online users
  getOnlineUsers: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const users = await User.getOnlineUsers();

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Get online users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};
