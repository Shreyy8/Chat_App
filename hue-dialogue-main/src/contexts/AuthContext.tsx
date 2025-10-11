import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User } from '../services/api';
import { socketService } from '../services/socket';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    name: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updateStatus: (status: 'online' | 'away' | 'offline', statusMessage?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (apiService.isAuthenticated()) {
          const currentUser = await apiService.getCurrentUser();
          setUser(currentUser);
          
          // Connect to socket with current token
          const token = localStorage.getItem('accessToken');
          if (token) {
            socketService.connect(token);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        apiService.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const authResponse = await apiService.login(identifier, password);
      setUser(authResponse.user);
      
      // Connect to socket
      socketService.connect(authResponse.accessToken);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    name: string;
  }) => {
    try {
      const authResponse = await apiService.register(userData);
      setUser(authResponse.user);
      
      // Connect to socket
      socketService.connect(authResponse.accessToken);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      socketService.disconnect();
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const updatedUser = await apiService.updateUser(user._id, userData);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const updateStatus = async (status: 'online' | 'away' | 'offline', statusMessage?: string) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      await apiService.updateUserStatus(user._id, status, statusMessage);
      setUser(prev => prev ? { ...prev, status, statusMessage } : null);
      
      // Emit status change via socket
      socketService.changeStatus(status);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    updateStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};




