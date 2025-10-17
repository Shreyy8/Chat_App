# ChatFlow Backend API

A modern, real-time chat application backend built with Node.js, Express, TypeScript, and Socket.IO.

## Features

- 🔐 **Authentication & Authorization**: JWT-based authentication with refresh tokens
- 💬 **Real-time Messaging**: WebSocket support for instant message delivery
- 👥 **User Management**: Complete user profiles with avatars, status, and social links
- 🏠 **Chat Rooms**: Support for both direct messages and group chats
- 📁 **File Uploads**: Image and document sharing capabilities
- 🎨 **Theme Customization**: Custom backgrounds and chat themes
- 📱 **Status System**: Online, away, and offline status indicators
- 🔒 **Security**: Rate limiting, CORS, helmet, and input validation
- 📊 **Scalable**: MongoDB with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **File Upload**: Multer
- **Image Processing**: Sharp
- **Validation**: Express Validator

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chatapp_bkd
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your-super-secret-jwt-key-here
# ... other variables
```

5. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/:id/avatar` - Upload user avatar
- `PUT /api/users/:id/status` - Update user status

### Chats
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/:id` - Get chat details
- `PUT /api/chats/:id` - Update chat
- `DELETE /api/chats/:id` - Delete chat
- `POST /api/chats/:id/members` - Add members to chat
- `DELETE /api/chats/:id/members/:userId` - Remove member from chat

### Messages
- `GET /api/chats/:id/messages` - Get chat messages
- `POST /api/chats/:id/messages` - Send message
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message
- `POST /api/messages/:id/react` - React to message

### File Upload
- `POST /api/upload` - Upload file
- `GET /api/files/:filename` - Get file

## WebSocket Events

### Client to Server
- `join_chat` - Join a chat room
- `leave_chat` - Leave a chat room
- `send_message` - Send a message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `user_status_change` - Update user status

### Server to Client
- `message_received` - New message received
- `message_updated` - Message was updated
- `message_deleted` - Message was deleted
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing
- `user_status_changed` - User status changed
- `chat_updated` - Chat was updated
- `user_joined_chat` - User joined chat
- `user_left_chat` - User left chat

## Database Schema

### User
```typescript
{
  _id: ObjectId,
  username: string,
  email: string,
  password: string,
  name: string,
  avatar?: string,
  status: 'online' | 'away' | 'offline',
  statusMessage?: string,
  description?: string,
  banner?: string,
  socialLinks: Array<{platform: string, url: string}>,
  lastSeen: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Chat
```typescript
{
  _id: ObjectId,
  name: string,
  type: 'dm' | 'group',
  avatar?: string,
  description?: string,
  members: Array<ObjectId>,
  admins: Array<ObjectId>,
  customBackground?: string,
  lastMessage?: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```typescript
{
  _id: ObjectId,
  chatId: ObjectId,
  senderId: ObjectId,
  content: string,
  type: 'text' | 'image' | 'document',
  mediaUrl?: string,
  edited: boolean,
  reactions: Array<{userId: ObjectId, emoji: string}>,
  replyTo?: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

## Development

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

### Project Structure
```
src/
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── config/         # Configuration files
└── server.ts       # Main server file
```

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- CORS configuration
- Helmet for security headers
- Input validation and sanitization
- File upload restrictions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
