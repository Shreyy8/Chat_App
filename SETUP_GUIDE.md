# ChatFlow - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher) OR Docker
- Git

### 1. Database Setup

#### Option A: Using Docker (Recommended)
```bash
# Start MongoDB with Docker
docker run -d --name mongodb -p 27017:27017 mongo:latest

# To stop MongoDB later
docker stop mongodb
```

#### Option B: Install MongoDB Locally
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install and start the MongoDB service
3. MongoDB will run on `mongodb://localhost:27017`

### 2. Backend Setup

```bash
# Navigate to backend directory
cd chatapp_bkd


Install dependencies
npm install

# Set up environment (creates .env file)
npm run setup

# Start the backend server
npm run dev
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd hue-dialogue-main

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

The frontend will start on `http://localhost:3000`

### 4. Access the Application

1. Open your browser and go to `http://localhost:3000`
2. Register a new account or login
3. Start chatting!

## 🔧 Configuration

### Backend Environment Variables
Edit `chatapp_bkd/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/chatapp

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Frontend API Configuration
The frontend is configured to connect to `http://localhost:5000/api` by default.

## 🧪 Testing

### Backend Tests
```bash
cd chatapp_bkd
npm test
```

### Manual Testing
1. Register multiple users
2. Create direct messages and group chats
3. Send messages and verify real-time updates
4. Test file uploads
5. Test user status changes

## 🐛 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running on port 27017

#### 2. CORS Error
```
Access to fetch at 'http://localhost:5000' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solution:** Check that `CORS_ORIGIN=http://localhost:3000` in backend `.env`

#### 3. JWT Token Error
```
Error: Invalid or expired token
```
**Solution:** Clear browser localStorage and login again

#### 4. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Kill the process using port 5000 or change the PORT in `.env`

### Reset Everything
```bash
# Stop all services
# Kill Node.js processes
# Stop MongoDB/Docker

# Clear database (if needed)
docker rm mongodb
docker run -d --name mongodb -p 27017:27017 mongo:latest

# Restart both servers
cd chatapp_bkd && npm run dev
cd hue-dialogue-main && npm run dev
```

## 📱 Features

### ✅ Implemented Features
- User authentication (register/login)
- Real-time messaging with WebSocket
- Direct messages and group chats
- User profiles with avatars and status
- Message reactions and replies
- File uploads (images, documents)
- Typing indicators
- Online/offline status
- Responsive design

### 🔄 Real-time Features
- Instant message delivery
- Typing indicators
- User status updates
- Chat member join/leave notifications
- Message read receipts (basic)

## 🏗️ Architecture

### Backend (Node.js + Express + Socket.IO)
- REST API for CRUD operations
- WebSocket for real-time communication
- JWT authentication
- MongoDB with Mongoose
- File upload handling
- Rate limiting and security

### Frontend (React + TypeScript + Vite)
- Modern React with hooks
- Context API for state management
- Real-time WebSocket integration
- Responsive UI with Tailwind CSS
- Type-safe API calls

## 📚 API Documentation

See `chatapp_bkd/API.md` for complete API documentation.

## 🚀 Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Set secure JWT secrets
4. Configure proper CORS origins
5. Use a process manager like PM2

### Frontend
1. Build the application: `npm run build`
2. Serve static files with a web server
3. Configure environment variables for production API URL

## 📞 Support

If you encounter any issues:
1. Check the console logs for errors
2. Verify all services are running
3. Check the troubleshooting section above
4. Ensure all dependencies are installed correctly

## 🎉 Enjoy ChatFlow!

Your modern, real-time chat application is now ready to 