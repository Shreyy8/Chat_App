import { Router } from 'express';
import { messageController } from '../controllers/messageController';
import { authenticateToken } from '../middleware/auth';
import { 
  validateSendMessage, 
  validateUpdateMessage, 
  validateChatId, 
  validateMessageId,
  validatePagination 
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get chat messages
router.get('/chats/:chatId', validateChatId, validatePagination, messageController.getChatMessages);

// Send message
router.post('/chats/:chatId', validateChatId, validateSendMessage, messageController.sendMessage);

// Search messages in chat
router.get('/chats/:chatId/search', validateChatId, validatePagination, messageController.searchMessages);

// Edit message
router.put('/:messageId', validateMessageId, validateUpdateMessage, messageController.editMessage);

// Delete message
router.delete('/:messageId', validateMessageId, messageController.deleteMessage);

// React to message
router.post('/:messageId/react', validateMessageId, messageController.reactToMessage);

// Remove reaction from message
router.delete('/:messageId/react', validateMessageId, messageController.removeReaction);

export { router as messageRoutes };
