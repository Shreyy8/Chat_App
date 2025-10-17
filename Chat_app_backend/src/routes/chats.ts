import { Router } from 'express';
import { chatController } from '../controllers/chatController';
import { authenticateToken } from '../middleware/auth';
import { 
  validateCreateChat, 
  validateUpdateChat, 
  validateChatId, 
  validateObjectId 
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's chats
router.get('/', chatController.getUserChats);

// Create new chat
router.post('/', validateCreateChat, chatController.createChat);

// Get chat by ID
router.get('/:chatId', validateChatId, chatController.getChatById);

// Update chat
router.put('/:chatId', validateChatId, validateUpdateChat, chatController.updateChat);

// Delete chat
router.delete('/:chatId', validateChatId, chatController.deleteChat);

// Add members to chat
router.post('/:chatId/members', validateChatId, chatController.addMembers);

// Remove member from chat
router.delete('/:chatId/members/:userId', validateChatId, validateObjectId, chatController.removeMember);

// Promote member to admin
router.post('/:chatId/members/:userId/promote', validateChatId, validateObjectId, chatController.promoteToAdmin);

// Demote admin to member
router.post('/:chatId/members/:userId/demote', validateChatId, validateObjectId, chatController.demoteFromAdmin);

export { router as chatRoutes };
