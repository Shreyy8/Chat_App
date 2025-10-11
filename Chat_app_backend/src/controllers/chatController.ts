import { Response } from 'express';
import { Chat } from '../models/Chat';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';
import { CreateChatRequest } from '../types';

export const chatController = {
  // Get user's chats
  getUserChats: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const chats = await Chat.findUserChats(userId);

      res.json({
        success: true,
        data: chats
      });
    } catch (error) {
      console.error('Get user chats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Create new chat
  createChat: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const { type, name, members, description }: CreateChatRequest = req.body;

      let chat;

      if (type === 'dm') {
        // For DM, ensure only 2 members (current user + one other)
        if (members.length !== 1) {
          res.status(400).json({
            success: false,
            message: 'Direct message must have exactly one other member'
          });
          return;
        }

        const otherUserId = members[0];
        if (otherUserId === userId) {
          res.status(400).json({
            success: false,
            message: 'Cannot create DM with yourself'
          });
          return;
        }

        // Check if DM already exists
        chat = await Chat.findOrCreateDM(userId, otherUserId);
      } else {
        // For group chat
        if (members.length < 1) {
          res.status(400).json({
            success: false,
            message: 'Group chat must have at least one other member'
          });
          return;
        }

        if (!name) {
          res.status(400).json({
            success: false,
            message: 'Group chat name is required'
          });
          return;
        }

        // Remove current user from members if they're included
        const filteredMembers = members.filter(memberId => memberId !== userId);
        
        chat = await Chat.createGroupChat(name, userId, filteredMembers);
        
        if (description) {
          chat.description = description;
          await chat.save();
        }
      }

      res.status(201).json({
        success: true,
        message: 'Chat created successfully',
        data: chat
      });
    } catch (error) {
      console.error('Create chat error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get chat by ID
  getChatById: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { chatId } = req.params;
      const userId = req.user?._id.toString();

      const chat = await Chat.findById(chatId)
        .populate('members', 'name username avatar status')
        .populate('admins', 'name username avatar')
        .populate('lastMessage');

      if (!chat) {
        res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
        return;
      }

      // Check if user is a member
      if (!chat.isMember(userId)) {
        res.status(403).json({
          success: false,
          message: 'You are not a member of this chat'
        });
        return;
      }

      res.json({
        success: true,
        data: chat
      });
    } catch (error) {
      console.error('Get chat by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update chat
  updateChat: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { chatId } = req.params;
      const userId = req.user?._id.toString();
      const { name, description, customBackground } = req.body;

      const chat = await Chat.findById(chatId);
      if (!chat) {
        res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
        return;
      }

      // Check if user is a member
      if (!chat.isMember(userId)) {
        res.status(403).json({
          success: false,
          message: 'You are not a member of this chat'
        });
        return;
      }

      // For group chats, only admins can update
      if (chat.type === 'group' && !chat.isAdmin(userId)) {
        res.status(403).json({
          success: false,
          message: 'Only admins can update group chat details'
        });
        return;
      }

      // Update fields
      if (name !== undefined) chat.name = name;
      if (description !== undefined) chat.description = description;
      if (customBackground !== undefined) chat.customBackground = customBackground;

      await chat.save();
      await chat.populate('members', 'name username avatar status');
      await chat.populate('admins', 'name username avatar');

      res.json({
        success: true,
        message: 'Chat updated successfully',
        data: chat
      });
    } catch (error) {
      console.error('Update chat error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Delete chat
  deleteChat: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { chatId } = req.params;
      const userId = req.user?._id.toString();

      const chat = await Chat.findById(chatId);
      if (!chat) {
        res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
        return;
      }

      // Check if user is a member
      if (!chat.isMember(userId)) {
        res.status(403).json({
          success: false,
          message: 'You are not a member of this chat'
        });
        return;
      }

      // For group chats, only admins can delete
      if (chat.type === 'group' && !chat.isAdmin(userId)) {
        res.status(403).json({
          success: false,
          message: 'Only admins can delete group chats'
        });
        return;
      }

      await Chat.findByIdAndDelete(chatId);

      res.json({
        success: true,
        message: 'Chat deleted successfully'
      });
    } catch (error) {
      console.error('Delete chat error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Add members to chat
  addMembers: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { chatId } = req.params;
      const userId = req.user?._id.toString();
      const { members } = req.body;

      if (!Array.isArray(members) || members.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Members array is required'
        });
        return;
      }

      const chat = await Chat.findById(chatId);
      if (!chat) {
        res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
        return;
      }

      // Check if user is a member
      if (!chat.isMember(userId)) {
        res.status(403).json({
          success: false,
          message: 'You are not a member of this chat'
        });
        return;
      }

      // For group chats, only admins can add members
      if (chat.type === 'group' && !chat.isAdmin(userId)) {
        res.status(403).json({
          success: false,
          message: 'Only admins can add members to group chats'
        });
        return;
      }

      // Validate that all members exist
      const users = await User.find({ _id: { $in: members } });
      if (users.length !== members.length) {
        res.status(400).json({
          success: false,
          message: 'One or more users not found'
        });
        return;
      }

      // Add members
      let addedCount = 0;
      members.forEach((memberId: string) => {
        if (chat.addMember(memberId)) {
          addedCount++;
        }
      });

      await chat.save();
      await chat.populate('members', 'name username avatar status');

      res.json({
        success: true,
        message: `${addedCount} members added successfully`,
        data: chat
      });
    } catch (error) {
      console.error('Add members error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Remove member from chat
  removeMember: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { chatId, userId: memberId } = req.params;
      const currentUserId = req.user?._id.toString();

      const chat = await Chat.findById(chatId);
      if (!chat) {
        res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
        return;
      }

      // Check if current user is a member
      if (!chat.isMember(currentUserId)) {
        res.status(403).json({
          success: false,
          message: 'You are not a member of this chat'
        });
        return;
      }

      // Users can remove themselves, or admins can remove others
      const canRemove = currentUserId === memberId || 
        (chat.type === 'group' && chat.isAdmin(currentUserId));

      if (!canRemove) {
        res.status(403).json({
          success: false,
          message: 'You can only remove yourself or be an admin to remove others'
        });
        return;
      }

      // Cannot remove the last admin
      if (chat.type === 'group' && chat.isAdmin(memberId) && chat.admins.length === 1) {
        res.status(400).json({
          success: false,
          message: 'Cannot remove the last admin from the group'
        });
        return;
      }

      const removed = chat.removeMember(memberId);
      if (!removed) {
        res.status(400).json({
          success: false,
          message: 'User is not a member of this chat'
        });
        return;
      }

      await chat.save();
      await chat.populate('members', 'name username avatar status');

      res.json({
        success: true,
        message: 'Member removed successfully',
        data: chat
      });
    } catch (error) {
      console.error('Remove member error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Promote member to admin
  promoteToAdmin: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { chatId, userId: memberId } = req.params;
      const currentUserId = req.user?._id.toString();

      const chat = await Chat.findById(chatId);
      if (!chat) {
        res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
        return;
      }

      // Check if current user is admin
      if (!chat.isAdmin(currentUserId)) {
        res.status(403).json({
          success: false,
          message: 'Only admins can promote members'
        });
        return;
      }

      // Check if target user is a member
      if (!chat.isMember(memberId)) {
        res.status(400).json({
          success: false,
          message: 'User is not a member of this chat'
        });
        return;
      }

      const promoted = chat.promoteToAdmin(memberId);
      if (!promoted) {
        res.status(400).json({
          success: false,
          message: 'User is already an admin'
        });
        return;
      }

      await chat.save();
      await chat.populate('members', 'name username avatar status');
      await chat.populate('admins', 'name username avatar');

      res.json({
        success: true,
        message: 'Member promoted to admin successfully',
        data: chat
      });
    } catch (error) {
      console.error('Promote to admin error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Demote admin to member
  demoteFromAdmin: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { chatId, userId: memberId } = req.params;
      const currentUserId = req.user?._id.toString();

      const chat = await Chat.findById(chatId);
      if (!chat) {
        res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
        return;
      }

      // Check if current user is admin
      if (!chat.isAdmin(currentUserId)) {
        res.status(403).json({
          success: false,
          message: 'Only admins can demote other admins'
        });
        return;
      }

      // Cannot demote yourself
      if (currentUserId === memberId) {
        res.status(400).json({
          success: false,
          message: 'You cannot demote yourself'
        });
        return;
      }

      // Cannot demote the last admin
      if (chat.admins.length === 1) {
        res.status(400).json({
          success: false,
          message: 'Cannot demote the last admin'
        });
        return;
      }

      const demoted = chat.demoteFromAdmin(memberId);
      if (!demoted) {
        res.status(400).json({
          success: false,
          message: 'User is not an admin'
        });
        return;
      }

      await chat.save();
      await chat.populate('members', 'name username avatar status');
      await chat.populate('admins', 'name username avatar');

      res.json({
        success: true,
        message: 'Admin demoted to member successfully',
        data: chat
      });
    } catch (error) {
      console.error('Demote from admin error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};
