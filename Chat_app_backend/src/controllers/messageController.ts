import { Response } from 'express';
import { Message } from '../models/Message';
import { Chat } from '../models/Chat';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';
import { SendMessageRequest } from '../types';
import { getSocketService } from '../services/socketService';

export const messageController = {
  // Get chat messages
  getChatMessages: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { chatId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const userId = req.user?._id.toString();

      // Check if user is a member of the chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
        return;
      }

      if (!userId || !chat.isMember(userId)) {
        res.status(403).json({
          success: false,
          message: 'You are not a member of this chat'
        });
        return;
      }

      const messages = await Message.getChatMessages(
        chatId,
        Number(page),
        Number(limit)
      );

  const total = await Message.getChatMessageCount(chatId);

      res.json({
        success: true,
        data: {
          messages: messages.reverse(), // Reverse to show oldest first
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
            hasNext: Number(page) * Number(limit) < total,
            hasPrev: Number(page) > 1
          }
        }
      });
    } catch (error) {
      console.error('Get chat messages error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Send message
  sendMessage: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { chatId } = req.params;
      const userId = req.user?._id.toString();
      const { content, type = 'text', mediaUrl, replyTo }: SendMessageRequest = req.body;

      // Check if user is a member of the chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
        return;
      }

      if (!userId || !chat.isMember(userId)) {
        res.status(403).json({
          success: false,
          message: 'You are not a member of this chat'
        });
        return;
      }

      // Validate replyTo message if provided
      if (replyTo) {
        const replyMessage = await Message.findById(replyTo);
        if (!replyMessage || replyMessage.chatId.toString() !== chatId) {
          res.status(400).json({
            success: false,
            message: 'Invalid reply message'
          });
          return;
        }
      }

      // Create new message
      const message = new Message({
        chatId,
        senderId: userId,
        content,
        type,
        mediaUrl,
        replyTo
      });

      await message.save();
      await message.populate('senderId', 'name username avatar');
      await message.populate('replyTo', 'content senderId');
      await message.populate('replyTo.senderId', 'name username avatar');

      // Emit realtime event
      const socketService = getSocketService();
      socketService?.emitToChat(chatId, 'message_received', {
        _id: message._id,
        chatId: message.chatId,
        senderId: message.senderId,
        senderName: (message.senderId as any).name,
        senderAvatar: (message.senderId as any).avatar,
        content: message.content,
        type: message.type,
        mediaUrl: message.mediaUrl,
        edited: message.edited,
        reactions: message.reactions,
        replyTo: message.replyTo,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt
      });

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Edit message
  editMessage: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { messageId } = req.params;
      const userId = req.user?._id.toString();
      const { content } = req.body;

      const message = await Message.findById(messageId);
      if (!message) {
        res.status(404).json({
          success: false,
          message: 'Message not found'
        });
        return;
      }

      // Check if user is the sender
      if (message.senderId.toString() !== userId) {
        res.status(403).json({
          success: false,
          message: 'You can only edit your own messages'
        });
        return;
      }

      // Update message
      message.content = content;
      message.edited = true;
      await message.save();

      await message.populate('senderId', 'name username avatar');
      await message.populate('replyTo', 'content senderId');
      await message.populate('replyTo.senderId', 'name username avatar');

  // Emit realtime update
  const socketService = getSocketService();
  socketService?.emitToChat(message.chatId.toString(), 'message_updated', message);

      res.json({
        success: true,
        message: 'Message updated successfully',
        data: message
      });
    } catch (error) {
      console.error('Edit message error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Delete message
  deleteMessage: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { messageId } = req.params;
      const userId = req.user?._id.toString();

      const message = await Message.findById(messageId);
      if (!message) {
        res.status(404).json({
          success: false,
          message: 'Message not found'
        });
        return;
      }

      // Check if user is the sender or an admin of the chat
      const chat = await Chat.findById(message.chatId);
      const isSender = message.senderId.toString() === userId;
  const isAdmin = chat && userId && chat.isAdmin(userId);

      if (!isSender && !isAdmin) {
        res.status(403).json({
          success: false,
          message: 'You can only delete your own messages or be an admin'
        });
        return;
      }

      await Message.findByIdAndDelete(messageId);

      // Emit realtime deletion
      const socketService = getSocketService();
      if (chat) {
        socketService?.emitToChat(chat._id.toString(), 'message_deleted', messageId);
      }

      res.json({
        success: true,
        message: 'Message deleted successfully'
      });
    } catch (error) {
      console.error('Delete message error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // React to message
  reactToMessage: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { messageId } = req.params;
      const userId = req.user?._id.toString();
      const { emoji } = req.body;

      if (!emoji) {
        res.status(400).json({
          success: false,
          message: 'Emoji is required'
        });
        return;
      }

      const message = await Message.findById(messageId);
      if (!message) {
        res.status(404).json({
          success: false,
          message: 'Message not found'
        });
        return;
      }

      // Check if user is a member of the chat
      const chat = await Chat.findById(message.chatId);
      if (!chat || !userId || !chat.isMember(userId)) {
        res.status(403).json({
          success: false,
          message: 'You are not a member of this chat'
        });
        return;
      }

      // Add reaction
  if (userId) message.addReaction(userId, emoji);
      await message.save();

      await message.populate('senderId', 'name username avatar');
      await message.populate('replyTo', 'content senderId');
      await message.populate('replyTo.senderId', 'name username avatar');

  // Emit realtime update
  const socketService = getSocketService();
  socketService?.emitToChat(message.chatId.toString(), 'message_updated', message);
      res.json({
        success: true,
        message: 'Reaction added successfully',
        data: message
      });
    } catch (error) {
      console.error('React to message error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Remove reaction from message
  removeReaction: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { messageId } = req.params;
      const userId = req.user?._id.toString();
      const { emoji } = req.body;

      const message = await Message.findById(messageId);
      if (!message) {
        res.status(404).json({
          success: false,
          message: 'Message not found'
        });
        return;
      }

      // Check if user is a member of the chat
      const chat = await Chat.findById(message.chatId);
      if (!chat || !userId || !chat.isMember(userId)) {
        res.status(403).json({
          success: false,
          message: 'You are not a member of this chat'
        });
        return;
      }

      // Remove reaction
  if (userId) message.removeReaction(userId, emoji);
      await message.save();

      await message.populate('senderId', 'name username avatar');
      await message.populate('replyTo', 'content senderId');
      await message.populate('replyTo.senderId', 'name username avatar');

  // Emit realtime update
  const socketService = getSocketService();
  socketService?.emitToChat(message.chatId.toString(), 'message_updated', message);
      res.json({
        success: true,
        message: 'Reaction removed successfully',
        data: message
      });
    } catch (error) {
      console.error('Remove reaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Search messages in chat
  searchMessages: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { chatId } = req.params;
      const { q, page = 1, limit = 20 } = req.query;
      const userId = req.user?._id.toString();

      if (!q || String(q).trim().length < 2) {
        res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters'
        });
        return;
      }

      // Check if user is a member of the chat
      const chat = await Chat.findById(chatId);
      if (!chat) {
        res.status(404).json({
          success: false,
          message: 'Chat not found'
        });
        return;
      }

      if (!userId || !chat.isMember(userId)) {
        res.status(403).json({
          success: false,
          message: 'You are not a member of this chat'
        });
        return;
      }

      const messages = await Message.searchMessages(
        chatId,
        String(q),
        Number(page),
        Number(limit)
      );

      res.json({
        success: true,
        data: {
          messages,
          query: q,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            hasNext: messages.length === Number(limit),
            hasPrev: Number(page) > 1
          }
        }
      });
    } catch (error) {
      console.error('Search messages error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};
