const API_BASE_URL = 'http://localhost:5000/api';

// Types matching backend
export interface User {
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
  lastSeen: string;
}

export interface Chat {
  _id: string;
  name: string;
  type: 'dm' | 'group';
  avatar?: string;
  description?: string;
  members: User[];
  admins: string[];
  customBackground?: string;
  lastMessage?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
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
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

class ApiService {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.accessToken = localStorage.getItem('accessToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Authentication methods
  async register(userData: {
    username: string;
    email: string;
    password: string;
    name: string;
  }): Promise<AuthResponse> {
    const response = await this.request<{ success: boolean; data: AuthResponse }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );
    
    if (response.success) {
      this.setAccessToken(response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data;
  }

  async login(identifier: string, password: string): Promise<AuthResponse> {
    const response = await this.request<{ success: boolean; data: AuthResponse }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      }
    );
    
    if (response.success) {
      this.setAccessToken(response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<{ success: boolean; data: User }>('/auth/me');
    return response.data;
  }

  // User methods
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    exclude?: string;
  }): Promise<{ users: User[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.exclude) queryParams.append('exclude', params.exclude);

    const response = await this.request<{ success: boolean; data: any }>(
      `/users?${queryParams.toString()}`
    );
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await this.request<{ success: boolean; data: User }>(`/users/${id}`);
    return response.data;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await this.request<{ success: boolean; data: User }>(
      `/users/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(userData),
      }
    );
    return response.data;
  }

  async updateUserStatus(id: string, status: 'online' | 'away' | 'offline', statusMessage?: string): Promise<any> {
    const response = await this.request<{ success: boolean; data: any }>(
      `/users/${id}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ status, statusMessage }),
      }
    );
    return response.data;
  }

  // Chat methods
  async getChats(): Promise<Chat[]> {
    const response = await this.request<{ success: boolean; data: Chat[] }>('/chats');
    return response.data;
  }

  async createChat(chatData: {
    type: 'dm' | 'group';
    name?: string;
    members: string[];
    description?: string;
  }): Promise<Chat> {
    const response = await this.request<{ success: boolean; data: Chat }>(
      '/chats',
      {
        method: 'POST',
        body: JSON.stringify(chatData),
      }
    );
    return response.data;
  }

  async getChatById(id: string): Promise<Chat> {
    const response = await this.request<{ success: boolean; data: Chat }>(`/chats/${id}`);
    return response.data;
  }

  async updateChat(id: string, chatData: Partial<Chat>): Promise<Chat> {
    const response = await this.request<{ success: boolean; data: Chat }>(
      `/chats/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(chatData),
      }
    );
    return response.data;
  }

  async deleteChat(id: string): Promise<void> {
    await this.request(`/chats/${id}`, { method: 'DELETE' });
  }

  async addMembers(chatId: string, members: string[]): Promise<Chat> {
    const response = await this.request<{ success: boolean; data: Chat }>(
      `/chats/${chatId}/members`,
      {
        method: 'POST',
        body: JSON.stringify({ members }),
      }
    );
    return response.data;
  }

  async removeMember(chatId: string, userId: string): Promise<Chat> {
    const response = await this.request<{ success: boolean; data: Chat }>(
      `/chats/${chatId}/members/${userId}`,
      { method: 'DELETE' }
    );
    return response.data;
  }

  // Message methods
  async getChatMessages(chatId: string, page: number = 1, limit: number = 50): Promise<{
    messages: Message[];
    pagination: any;
  }> {
    const response = await this.request<{ success: boolean; data: any }>(
      `/messages/chats/${chatId}?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  async sendMessage(chatId: string, messageData: {
    content: string;
    type?: 'text' | 'image' | 'document';
    mediaUrl?: string;
    replyTo?: string;
  }): Promise<Message> {
    const response = await this.request<{ success: boolean; data: Message }>(
      `/messages/chats/${chatId}`,
      {
        method: 'POST',
        body: JSON.stringify(messageData),
      }
    );
    return response.data;
  }

  async editMessage(messageId: string, content: string): Promise<Message> {
    const response = await this.request<{ success: boolean; data: Message }>(
      `/messages/${messageId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ content }),
      }
    );
    return response.data;
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.request(`/messages/${messageId}`, { method: 'DELETE' });
  }

  async reactToMessage(messageId: string, emoji: string): Promise<Message> {
    const response = await this.request<{ success: boolean; data: Message }>(
      `/messages/${messageId}/react`,
      {
        method: 'POST',
        body: JSON.stringify({ emoji }),
      }
    );
    return response.data;
  }

  // File upload
  async uploadFile(file: File): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/files/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    const result = await response.json();
    return result.data;
  }

  // Token management
  setAccessToken(token: string): void {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
  }

  clearTokens(): void {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

export const apiService = new ApiService();




