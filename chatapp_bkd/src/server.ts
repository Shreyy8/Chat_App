import { createServer } from 'http';
import { config, validateConfig } from './config';
import { connectDatabase } from './config/database';
import { SocketService } from './services/socketService';
import { app } from './app';

// Validate configuration
validateConfig();

const server = createServer(app);

// Initialize Socket.IO service
const socketService = new SocketService(server);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(async () => {
    console.log('HTTP server closed');
    
    try {
      // Close database connection
      const { disconnectDatabase } = await import('./config/database');
      await disconnectDatabase();
      console.log('Database connection closed');
      
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start HTTP server
    server.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT}`);
      console.log(`📱 Environment: ${config.NODE_ENV}`);
      console.log(`🔗 API URL: http://localhost:${config.PORT}/api`);
      console.log(`💬 WebSocket: ws://localhost:${config.PORT}`);
      console.log(`📁 Uploads: http://localhost:${config.PORT}/api/files`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Export socket service for use in other modules
export { socketService };

// Start the server
startServer();
