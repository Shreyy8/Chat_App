import { Document, Model } from 'mongoose';
import { Socket } from 'socket.io';
import { Request } from 'express';

// User Types
export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  statusMessage?: string;
  description?: string;
  banner?: string;
  socialLinks: Array<{
    platform: string;
    url: string;
  }>;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  toPublicJSON?(): IUserPublic;
}

// User Model static methods
export interface IUserModel extends Model<IUser> {
  searchUsers(query: string, excludeIds?: string[]): Promise<IUser[]>;
  getOnlineUsers(): Promise<IUser[]>;
  findByUsernameOrEmail(identifier: string): Promise<IUser | null>;
}

export interface IUserPublic {
  _id: string;
  username: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  statusMessage?: string;
  description?: string;
  banner?: string;
  socialLinks: Array<{
    platform: string;
    url: string;
  }>;
  lastSeen: Date;
}

// Chat Types
export interface IChat extends Document {
  _id: string;
  name: string;
  type: 'dm' | 'group';
  avatar?: string;
  description?: string;
  members: any[];
  admins: any[];
  customBackground?: string;
  lastMessage?: any;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  isMember(userId: string): boolean;
  isAdmin(userId: string): boolean;
  addMember(userId: string): boolean;
  removeMember(userId: string): boolean;
  promoteToAdmin(userId: string): boolean;
  demoteFromAdmin(userId: string): boolean;
}

export interface IChatModel extends Model<IChat> {
  findUserChats(userId: string): Promise<IChat[]>;
  findOrCreateDM(userId1: string, userId2: string): Promise<IChat>;
  createGroupChat(name: string, creatorId: string, memberIds: string[]): Promise<IChat>;
}

export interface IChatPublic {
  _id: string;
  name: string;
  type: 'dm' | 'group';
  avatar?: string;
  description?: string;
  members: IUserPublic[];
  admins: string[];
  customBackground?: string;
  lastMessage?: string;
  unread?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Message Types
export interface IMessage extends Document {
  _id: string;
  chatId: any;
  senderId: any;
  content: string;
  type: 'text' | 'image' | 'document';
  mediaUrl?: string;
  edited: boolean;
  reactions: Array<{
    userId: any;
    emoji: string;
  }>;
  replyTo?: any;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  addReaction(userId: string, emoji: string): boolean;
  removeReaction(userId: string, emoji?: string): boolean;
  hasReacted(userId: string, emoji?: string): boolean;
}

export interface IMessageModel extends Model<IMessage> {
  getChatMessages(chatId: string, page?: number, limit?: number): Promise<IMessage[]>;
  getChatMessageCount(chatId: string): Promise<number>;
  searchMessages(chatId: string, query: string, page?: number, limit?: number): Promise<IMessage[]>;
  getRecentMessages(chatIds: string[], limit?: number): Promise<any[]>;
}

export interface IMessagePublic {
  _id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'document';
  mediaUrl?: string;
  edited: boolean;
  reactions: Array<{
    userId: string;
    emoji: string;
  }>;
  replyTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response Types
export interface AuthRequest {
  username?: string;
  email?: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: IUserPublic;
  accessToken: string;
  refreshToken: string;
}

export interface CreateChatRequest {
  name?: string;
  type: 'dm' | 'group';
  members: string[];
  description?: string;
}

export interface SendMessageRequest {
  content: string;
  type: 'text' | 'image' | 'document';
  mediaUrl?: string;
  replyTo?: string;
}

export interface UpdateUserRequest {
  name?: string;
  status?: 'online' | 'away' | 'offline';
  statusMessage?: string;
  description?: string;
  banner?: string;
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
}

// Socket.IO Event Types
export interface SocketEvents {
  // Client to Server
  join_chat: (chatId: string) => void;
  leave_chat: (chatId: string) => void;
  send_message: (data: {
    chatId: string;
    content: string;
    type: 'text' | 'image' | 'document';
    mediaUrl?: string;
    replyTo?: string;
  }) => void;
  typing_start: (chatId: string) => void;
  typing_stop: (chatId: string) => void;
  user_status_change: (status: 'online' | 'away' | 'offline') => void;

  // Server to Client
  message_received: (message: IMessagePublic) => void;
  message_updated: (message: IMessagePublic) => void;
  message_deleted: (messageId: string) => void;
  user_typing: (data: { userId: string; userName: string; chatId: string }) => void;
  user_stopped_typing: (data: { userId: string; chatId: string }) => void;
  user_status_changed: (data: { userId: string; status: 'online' | 'away' | 'offline' }) => void;
  chat_updated: (chat: IChatPublic) => void;
  user_joined_chat: (data: { userId: string; chatId: string }) => void;
  user_left_chat: (data: { userId: string; chatId: string }) => void;
  error: (error: { message: string; code?: string }) => void;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  username: string;
  iat?: number;
  exp?: number;
}

// Express Request with User
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// Socket.IO Types
export interface AuthenticatedSocket extends Socket {
  user: IUser;
}

// File Upload Types
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// Pagination Types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error Types
export interface APIError {
  message: string;
  code?: string;
  statusCode: number;
  details?: any;
}
