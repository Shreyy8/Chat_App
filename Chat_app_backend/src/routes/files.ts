import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { upload, handleUploadError } from '../middleware/upload';
import path from 'path';
import { config } from '../config';
import { Response } from 'express';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Upload file
router.post('/upload', upload.single('file'), handleUploadError, (req: any, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
      return;
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: `/api/files/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Serve files
router.get('/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(config.UPLOAD_PATH, filename);
    
    res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }
    });
  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export { router as fileRoutes };
