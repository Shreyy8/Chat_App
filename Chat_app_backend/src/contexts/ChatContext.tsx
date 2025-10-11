import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, Chat, Message, User } from '../services/api';
import { socketService } from '../services/socket';
import { useAuth } from './AuthContext';

interface ChatContextType {
  chats: Chat[];
  selectedChat: Chat | null;
  messages: Message[];
  isLoading: boolean;
  setSelectedChat: (chat: Chat | null) => void;
  loadChats: () => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  sendMessage: (content: string, type?: 'text' | 'image' | 'document', mediaUrl?: string, replyTo?: string) => Promise<void>;
  createChat: (type: 'dm' | 'group', members: string[], name?: string, description?: string) => Promise<Chat>;
  updateChat: (chatId: string, updates: Partial<Chat>) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  addMembers: (chatId: string, members: string[]) => Promise<void>;
  removeMember: (chatId: string, userId: string) => Promise<void>;
  typingUsers: { [chatId: string]: string[] };
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ [chatId: string]: string[] }>({});

  // Load chats when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadChats();
    }
  }, [isAuthenticated]);

  // Setup socket listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleMessageReceived = (message: Message) => {
      setMessages(prev => [...prev, message]);
      
      // Update chat's last message
      setChats(prev => prev.map(chat => 
        chat._id === message.chatId 
          ? { ...chat, lastMessage: message }
          : chat
      ));
    };

    const handleMessageUpdated = (message: Message) => {
      setMessages(prev => prev.map(msg => 
        msg._id === message._id ? message : msg
      ));
    };

    const handleMessageDeleted = (messageId: string) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    };

    const handleUserTyping = (data: { userId: string; userName: string; chatId: string }) => {
      setTypingUsers(prev => ({
        ...prev,
        [data.chatId]: [...(prev[data.chatId] || []).filter(id => id !== data.userId), data.userId]
      }));
    };

    const handleUserStoppedTyping = (data: { userId: string; chatId: string }) => {
      setTypingUsers(prev => ({
        ...prev,
        [data.chatId]: (prev[data.chatId] || []).filter(id => id !== data.userId)
      }));
    };

    const handleChatUpdated = (chat: Chat) => {
      setChats(prev => prev.map(c => c._id === chat._id ? chat : c));
    };

    const handleUserJoinedChat = (data: { userId: string; chatId: string }) => {
      // Reload chat to get updated member list
      loadChats();
    };

    const handleUserLeftChat = (data: { userId: string; chatId: string }) => {
      // Reload chat to get updated member list
      loadChats();
    };

    // Register socket listeners
    socketService.onMessageReceived(handleMessageReceived);
    socketService.onMessageUpdated(handleMessageUpdated);
    socketService.onMessageDeleted(handleMessageDeleted);
    socketService.onUserTyping(handleUserTyping);
    socketService.onUserStoppedTyping(handleUserStoppedTyping);
    socketService.onChatUpdated(handleChatUpdated);
    socketService.onUserJoinedChat(handleUserJoinedChat);
    socketService.onUserLeftChat(handleUserLeftChat);

    // Cleanup listeners on unmount
    return () => {
      socketService.offMessageReceived(handleMessageReceived);
      socketService.offMessageUpdated(handleMessageUpdated);
      socketService.offMessageDeleted(handleMessageDeleted);
      socketService.offUserTyping(handleUserTyping);
      socketService.offUserStoppedTyping(handleUserStoppedTyping);
      socketService.offChatUpdated(handleChatUpdated);
      socketService.offUserJoinedChat(handleUserJoinedChat);
      socketService.offUserLeftChat(handleUserLeftChat);
    };
  }, [isAuthenticated]);

  // Join/leave chat when selection changes
  useEffect(() => {
    if (selectedChat) {
      socketService.joinChat(selectedChat._id);
      loadMessages(selectedChat._id);
    }

    return () => {
      if (selectedChat) {
        socketService.leaveChat(selectedChat._id);
      }
    };
  }, [selectedChat]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const chatsData = await apiService.getChats();
      setChats(chatsData);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      setIsLoading(true);
      const { messages: messagesData } = await apiService.getChatMessages(chatId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (
    content: string, 
    type: 'text' | 'image' | 'document' = 'text', 
    mediaUrl?: string, 
    replyTo?: string
  ) => {
    if (!selectedChat) throw new Error('No chat selected');

    try {
      // Send via socket for real-time delivery
      socketService.sendMessage({
        chatId: selectedChat._id,
        content,
        type,
        mediaUrl,
        replyTo,
      });

      // Also send via API for persistence
      await apiService.sendMessage(selectedChat._id, {
        content,
        type,
        mediaUrl,
        replyTo,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const createChat = async (
    type: 'dm' | 'group', 
    members: string[], 
    name?: string, 
    description?: string
  ): Promise<Chat> => {
    try {
      const newChat = await apiService.createChat({
        type,
        members,
        name,
        description,
      });
      
      setChats(prev => [newChat, ...prev]);
      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  };

  const updateChat = async (chatId: string, updates: Partial<Chat>) => {
    try {
      const updatedChat = await apiService.updateChat(chatId, updates);
      setChats(prev => prev.map(chat => 
        chat._id === chatId ? updatedChat : chat
      ));
      
      if (selectedChat?._id === chatId) {
        setSelectedChat(updatedChat);
      }
    } catch (error) {
      console.error('Error updating chat:', error);
      throw error;
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      await apiService.deleteChat(chatId);
      setChats(prev => prev.filter(chat => chat._id !== chatId));
      
      if (selectedChat?._id === chatId) {
        setSelectedChat(null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  };

  const addMembers = async (chatId: string, members: string[]) => {
    try {
      await apiService.addMembers(chatId, members);
      // Reload chats to get updated member list
      await loadChats();
    } catch (error) {
      console.error('Error adding members:', error);
      throw error;
    }
  };

  const removeMember = async (chatId: string, userId: string) => {
    try {
      await apiService.removeMember(chatId, userId);
      // Reload chats to get updated member list
      await loadChats();
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  };

  const value: ChatContextType = {
    chats,
    selectedChat,
    messages,
    isLoading,
    setSelectedChat,
    loadChats,
    loadMessages,
    sendMessage,
    createChat,
    updateChat,
    deleteChat,
    addMembers,
    removeMember,
    typingUsers,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};




