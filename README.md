# ChatFlow - Modern Real-Time Chat Application

A modern, feature-rich real-time chat application built with Node.js, Express, TypeScript, Socket.IO, React, and MongoDB. ChatFlow provides seamless instant messaging with support for direct messages, group chats, file sharing, and real-time user presence.

## 🚀 Features

- **Real-time Messaging**: Instant message delivery powered by WebSocket (Socket.IO)
- **User Authentication**: Secure JWT-based authentication with refresh tokens
- **Direct & Group Chats**: Support for one-on-one conversations and group discussions
- **User Profiles**: Customizable profiles with avatars, status messages, and social links
- **File Sharing**: Upload and share images and documents
- **Message Features**: Message reactions, replies, editing, and deletion
- **Typing Indicators**: Real-time typing status
- **User Presence**: Online, away, and offline status tracking
- **Theme Customization**: Custom backgrounds and chat themes
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Secure authentication
- **Multer** - File upload handling
- **Sharp** - Image processing

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn-ui** - UI component library
- **Context API** - State management

## 📋 Prerequisites

Before running this application, make sure you have:
- Node.js (v18 or higher)
- MongoDB (v5 or higher) or Docker
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Shreyy8/Chat_App.git
cd Chat_App
```

### 2. Setup MongoDB

**Using Docker (Recommended):**
```bash
docker run -d --name mongodb -p 27017:27017 mongo:latest
```

**Or install MongoDB locally** from [mongodb.com](https://www.mongodb.com/try/download/community)

### 3. Backend Setup
```bash
cd Chat_app_backend
npm install
npm run setup  # Creates .env file
npm run dev    # Starts backend on http://localhost:5000
```

### 4. Frontend Setup
```bash
cd Chat_app_frontend
npm install
npm run dev    # Starts frontend on http://localhost:3000
```

### 5. Access the Application
Open your browser and navigate to `http://localhost:3000`

## 📚 Documentation

- **[Setup Guide](SETUP_GUIDE.md)** - Complete setup and configuration guide
- **[Backend API](Chat_app_backend/README.md)** - Backend API documentation
- **[Frontend](Chat_app_frontend/README.md)** - Frontend documentation
- **[API Reference](Chat_app_backend/API.md)** - Detailed API endpoints and WebSocket events

## 🏗️ Project Structure

```
Chat_App/
├── Chat_app_backend/       # Backend Node.js/Express server
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── server.ts       # Main server file
│   └── README.md
├── Chat_app_frontend/      # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   └── README.md
└── SETUP_GUIDE.md          # Complete setup guide
```

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- CORS configuration
- Helmet for security headers
- Input validation and sanitization
- File upload restrictions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Created by [Shreyy8](https://github.com/Shreyy8)

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev) for rapid development
- UI components from [shadcn-ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)