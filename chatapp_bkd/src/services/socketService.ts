import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '../models/User';
import { Chat } from '../models/Chat';
import { Message } from '../models/Message';
import { SocketEvents, AuthenticatedSocket } from '../types';
import { config } from '../config';

// Singleton handle for controllers to emit events without importing server.ts
let socketServiceInstance: SocketService | null = null;
export const getSocketService = () => socketServiceInstance;

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private typingUsers: Map<string, Set<string>> = new Map(); // chatId -> Set of userIds

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: config.SOCKET_CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    // Register singleton instance
    socketServiceInstance = this;
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
          return next(new Error('User not found'));
        }

        (socket as AuthenticatedSocket).user = user;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      const authenticatedSocket = socket as AuthenticatedSocket;
      const user = authenticatedSocket.user;
      console.log(`User ${user.name} connected with socket ${authenticatedSocket.id}`);

      // Track user connection
      this.connectedUsers.set(authenticatedSocket.id, user._id.toString());
      if (!this.userSockets.has(user._id.toString())) {
        this.userSockets.set(user._id.toString(), new Set());
      }
      this.userSockets.get(user._id.toString())!.add(authenticatedSocket.id);

      // Update user status to online
      this.updateUserStatus(user._id.toString(), 'online');

      // Join user to their chat rooms
      this.joinUserChats(authenticatedSocket, user._id.toString());

      // Handle join chat
      authenticatedSocket.on('join_chat', async (chatId: string) => {
        await this.handleJoinChat(authenticatedSocket, chatId);
      });

      // Handle leave chat
      authenticatedSocket.on('leave_chat', (chatId: string) => {
        this.handleLeaveChat(authenticatedSocket, chatId);
      });

      // Handle send message
      authenticatedSocket.on('send_message', async (data) => {
        await this.handleSendMessage(authenticatedSocket, data);
      });

      // Handle typing start
      authenticatedSocket.on('typing_start', (chatId: string) => {
        this.handleTypingStart(authenticatedSocket, chatId);
      });

      // Handle typing stop
      authenticatedSocket.on('typing_stop', (chatId: string) => {
        this.handleTypingStop(authenticatedSocket, chatId);
      });

      // Handle user status change
      authenticatedSocket.on('user_status_change', async (status: 'online' | 'away' | 'offline') => {
        await this.handleUserStatusChange(authenticatedSocket, status);
      });

      // Handle disconnect
      authenticatedSocket.on('disconnect', () => {
        this.handleDisconnect(authenticatedSocket);
      });
    });
  }

  private async joinUserChats(socket: AuthenticatedSocket, userId: string): Promise<void> {
    try {
      const chats = await Chat.find({ members: userId });
      chats.forEach(chat => {
        socket.join(chat._id.toString());
      });
    } catch (error) {
      console.error('Error joining user chats:', error);
    }
  }

  private async handleJoinChat(socket: AuthenticatedSocket, chatId: string): Promise<void> {
    try {
      const user = socket.user;
      const chat = await Chat.findById(chatId);

      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }

      if (!(chat as any).isMember(user._id.toString())) {
        socket.emit('error', { message: 'You are not a member of this chat' });
        return;
      }

      socket.join(chatId);
      socket.to(chatId).emit('user_joined_chat', {
        userId: user._id.toString(),
        chatId
      });

      console.log(`User ${user.name} joined chat ${chatId}`);
    } catch (error) {
      console.error('Error handling join chat:', error);
      socket.emit('error', { message: 'Failed to join chat' });
    }
  }

  private handleLeaveChat(socket: AuthenticatedSocket, chatId: string): void {
    const user = socket.user;
    socket.leave(chatId);
    socket.to(chatId).emit('user_left_chat', {
      userId: user._id.toString(),
      chatId
    });

    // Remove from typing users
    const typingUsers = this.typingUsers.get(chatId);
    if (typingUsers) {
      typingUsers.delete(user._id.toString());
      if (typingUsers.size === 0) {
        this.typingUsers.delete(chatId);
      }
    }

    console.log(`User ${user.name} left chat ${chatId}`);
  }

  private async handleSendMessage(socket: AuthenticatedSocket, data: any): Promise<void> {
    try {
      const user = socket.user;
      const { chatId, content, type = 'text', mediaUrl, replyTo } = data;

      // Validate chat membership
      const chat = await Chat.findById(chatId);
      if (!chat || !(chat as any).isMember(user._id.toString())) {
        socket.emit('error', { message: 'You are not a member of this chat' });
        return;
      }

      // Create message
      const message = new Message({
        chatId,
        senderId: user._id.toString(),
        content,
        type,
        mediaUrl,
        replyTo
      });

      await message.save();
      await message.populate('senderId', 'name username avatar');
      await message.populate('replyTo', 'content senderId');
      await message.populate('replyTo.senderId', 'name username avatar');

      // Broadcast message to all chat members
      this.io.to(chatId).emit('message_received', {
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

      console.log(`Message sent in chat ${chatId} by ${user.name}`);
    } catch (error) {
      console.error('Error handling send message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private handleTypingStart(socket: AuthenticatedSocket, chatId: string): void {
    const user = socket.user;
    
    if (!this.typingUsers.has(chatId)) {
      this.typingUsers.set(chatId, new Set());
    }
    
    this.typingUsers.get(chatId)!.add(user._id.toString());
    
    socket.to(chatId).emit('user_typing', {
      userId: user._id.toString(),
      userName: user.name,
      chatId
    });
  }

  private handleTypingStop(socket: AuthenticatedSocket, chatId: string): void {
    const user = socket.user;
    
    const typingUsers = this.typingUsers.get(chatId);
    if (typingUsers) {
      typingUsers.delete(user._id.toString());
      if (typingUsers.size === 0) {
        this.typingUsers.delete(chatId);
      }
    }
    
    socket.to(chatId).emit('user_stopped_typing', {
      userId: user._id.toString(),
      chatId
    });
  }

  private async handleUserStatusChange(socket: AuthenticatedSocket, status: 'online' | 'away' | 'offline'): Promise<void> {
    try {
      const user = socket.user;
      
      // Update user status in database
      user.status = status;
      if (status === 'online') {
        user.lastSeen = new Date();
      }
      await user.save();

      // Broadcast status change to all connected users
      this.io.emit('user_status_changed', {
        userId: user._id.toString(),
        status
      });

      console.log(`User ${user.name} status changed to ${status}`);
    } catch (error) {
      console.error('Error handling user status change:', error);
      socket.emit('error', { message: 'Failed to update status' });
    }
  }

  private handleDisconnect(socket: AuthenticatedSocket): void {
    const user = socket.user;
    const userId = user._id.toString();

    // Remove from connected users
    this.connectedUsers.delete(socket.id);
    
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.delete(socket.id);
      if (userSocketSet.size === 0) {
        this.userSockets.delete(userId);
        // User is completely disconnected, update status to offline
        this.updateUserStatus(userId, 'offline');
      }
    }

    // Remove from all typing lists
    this.typingUsers.forEach((typingSet, chatId) => {
      if (typingSet.has(userId)) {
        typingSet.delete(userId);
        if (typingSet.size === 0) {
          this.typingUsers.delete(chatId);
        }
        // Notify others that user stopped typing
        socket.to(chatId).emit('user_stopped_typing', {
          userId,
          chatId
        });
      }
    });

    console.log(`User ${user.name} disconnected`);
  }

  private async updateUserStatus(userId: string, status: 'online' | 'away' | 'offline'): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, { 
        status,
        lastSeen: new Date()
      });

      // Broadcast status change
      this.io.emit('user_status_changed', {
        userId,
        status
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }

  // Public methods for external use
  public emitToUser(userId: string, event: string, data: any): void {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.forEach(socketId => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }

  public emitToChat(chatId: string, event: string, data: any): void {
    this.io.to(chatId).emit(event, data);
  }

  public emitToAll(event: string, data: any): void {
    this.io.emit(event, data);
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  public isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}
