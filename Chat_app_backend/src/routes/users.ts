import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { 
  validateUpdateUser, 
  validateObjectId, 
  validatePagination 
} from '../middleware/validation';
import { upload } from '../middleware/upload';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all users with pagination and search
router.get('/', validatePagination, userController.getAllUsers);

// Search users
router.get('/search', userController.searchUsers);

// Get online users
router.get('/online', userController.getOnlineUsers);

// Get user by ID
router.get('/:id', validateObjectId, userController.getUserById);

// Update user profile
router.put('/:id', validateObjectId, validateUpdateUser, userController.updateUser);

// Upload user avatar
router.post('/:id/avatar', validateObjectId, upload.single('avatar'), userController.uploadAvatar);

// Update user status
router.put('/:id/status', validateObjectId, userController.updateStatus);

export { router as userRoutes };
