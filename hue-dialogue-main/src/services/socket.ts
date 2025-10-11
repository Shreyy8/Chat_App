import { io, Socket } from 'socket.io-client';
import { Message, User } from './api';

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
  message_received: (message: Message) => void;
  message_updated: (message: Message) => void;
  message_deleted: (messageId: string) => void;
  user_typing: (data: { userId: string; userName: string; chatId: string }) => void;
  user_stopped_typing: (data: { userId: string; chatId: string }) => void;
  user_status_changed: (data: { userId: string; status: 'online' | 'away' | 'offline' }) => void;
  chat_updated: (chat: any) => void;
  user_joined_chat: (data: { userId: string; chatId: string }) => void;
  user_left_chat: (data: { userId: string; chatId: string }) => void;
  error: (error: { message: string; code?: string }) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io('http://localhost:5000', {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupEventListeners();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.handleReconnect();
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        if (this.socket && !this.socket.connected) {
          this.socket.connect();
        }
      }, 1000 * this.reconnectAttempts);
    }
  }

  // Event emitters
  joinChat(chatId: string): void {
    this.socket?.emit('join_chat', chatId);
  }

  leaveChat(chatId: string): void {
    this.socket?.emit('leave_chat', chatId);
  }

  sendMessage(data: {
    chatId: string;
    content: string;
    type: 'text' | 'image' | 'document';
    mediaUrl?: string;
    replyTo?: string;
  }): void {
    this.socket?.emit('send_message', data);
  }

  startTyping(chatId: string): void {
    this.socket?.emit('typing_start', chatId);
  }

  stopTyping(chatId: string): void {
    this.socket?.emit('typing_stop', chatId);
  }

  changeStatus(status: 'online' | 'away' | 'offline'): void {
    this.socket?.emit('user_status_change', status);
  }

  // Event listeners
  onMessageReceived(callback: (message: Message) => void): void {
    this.socket?.on('message_received', callback);
  }

  onMessageUpdated(callback: (message: Message) => void): void {
    this.socket?.on('message_updated', callback);
  }

  onMessageDeleted(callback: (messageId: string) => void): void {
    this.socket?.on('message_deleted', callback);
  }

  onUserTyping(callback: (data: { userId: string; userName: string; chatId: string }) => void): void {
    this.socket?.on('user_typing', callback);
  }

  onUserStoppedTyping(callback: (data: { userId: string; chatId: string }) => void): void {
    this.socket?.on('user_stopped_typing', callback);
  }

  onUserStatusChanged(callback: (data: { userId: string; status: 'online' | 'away' | 'offline' }) => void): void {
    this.socket?.on('user_status_changed', callback);
  }

  onChatUpdated(callback: (chat: any) => void): void {
    this.socket?.on('chat_updated', callback);
  }

  onUserJoinedChat(callback: (data: { userId: string; chatId: string }) => void): void {
    this.socket?.on('user_joined_chat', callback);
  }

  onUserLeftChat(callback: (data: { userId: string; chatId: string }) => void): void {
    this.socket?.on('user_left_chat', callback);
  }

  onError(callback: (error: { message: string; code?: string }) => void): void {
    this.socket?.on('error', callback);
  }

  // Remove event listeners
  offMessageReceived(callback: (message: Message) => void): void {
    this.socket?.off('message_received', callback);
  }

  offMessageUpdated(callback: (message: Message) => void): void {
    this.socket?.off('message_updated', callback);
  }

  offMessageDeleted(callback: (messageId: string) => void): void {
    this.socket?.off('message_deleted', callback);
  }

  offUserTyping(callback: (data: { userId: string; userName: string; chatId: string }) => void): void {
    this.socket?.off('user_typing', callback);
  }

  offUserStoppedTyping(callback: (data: { userId: string; chatId: string }) => void): void {
    this.socket?.off('user_stopped_typing', callback);
  }

  offUserStatusChanged(callback: (data: { userId: string; status: 'online' | 'away' | 'offline' }) => void): void {
    this.socket?.off('user_status_changed', callback);
  }

  offChatUpdated(callback: (chat: any) => void): void {
    this.socket?.off('chat_updated', callback);
  }

  offUserJoinedChat(callback: (data: { userId: string; chatId: string }) => void): void {
    this.socket?.off('user_joined_chat', callback);
  }

  offUserLeftChat(callback: (data: { userId: string; chatId: string }) => void): void {
    this.socket?.off('user_left_chat', callback);
  }

  offError(callback: (error: { message: string; code?: string }) => void): void {
    this.socket?.off('error', callback);
  }

  // Utility methods
  isConnectedToServer(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketService = new SocketService();




