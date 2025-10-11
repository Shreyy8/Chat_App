import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }
  next();
};

// Auth validation rules
export const validateRegister = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .trim(),
  handleValidationErrors
];

export const validateLogin = [
  body('identifier')
    .notEmpty()
    .withMessage('Username or email is required')
    .trim(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// User validation rules
export const validateUpdateUser = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .trim(),
  body('status')
    .optional()
    .isIn(['online', 'away', 'offline'])
    .withMessage('Status must be online, away, or offline'),
  body('statusMessage')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Status message must be less than 200 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
    .trim(),
  body('socialLinks')
    .optional()
    .isArray()
    .withMessage('Social links must be an array'),
  body('socialLinks.*.platform')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Platform name must be between 1 and 50 characters'),
  body('socialLinks.*.url')
    .optional()
    .isURL()
    .withMessage('Social link must be a valid URL'),
  handleValidationErrors
];

// Chat validation rules
export const validateCreateChat = [
  body('type')
    .isIn(['dm', 'group'])
    .withMessage('Chat type must be dm or group'),
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Chat name must be between 1 and 100 characters')
    .trim(),
  body('members')
    .isArray({ min: 1 })
    .withMessage('At least one member is required'),
  body('members.*')
    .isMongoId()
    .withMessage('Each member must be a valid user ID'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
    .trim(),
  handleValidationErrors
];

export const validateUpdateChat = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Chat name must be between 1 and 100 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
    .trim(),
  body('customBackground')
    .optional()
    .isURL()
    .withMessage('Custom background must be a valid URL'),
  handleValidationErrors
];

// Message validation rules
export const validateSendMessage = [
  body('content')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content must be between 1 and 2000 characters')
    .trim(),
  body('type')
    .optional()
    .isIn(['text', 'image', 'document'])
    .withMessage('Message type must be text, image, or document'),
  body('mediaUrl')
    .optional()
    .isURL()
    .withMessage('Media URL must be a valid URL'),
  body('replyTo')
    .optional()
    .isMongoId()
    .withMessage('Reply to must be a valid message ID'),
  handleValidationErrors
];

export const validateUpdateMessage = [
  body('content')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content must be between 1 and 2000 characters')
    .trim(),
  handleValidationErrors
];

// Parameter validation rules
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

export const validateChatId = [
  param('chatId')
    .isMongoId()
    .withMessage('Invalid chat ID format'),
  handleValidationErrors
];

export const validateMessageId = [
  param('messageId')
    .isMongoId()
    .withMessage('Invalid message ID format'),
  handleValidationErrors
];

// Query validation rules
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'name'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  handleValidationErrors
];
