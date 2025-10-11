import { useState } from "react";
import Sidebar from "@/components/chat/Sidebar";
import ChatArea from "@/components/chat/ChatArea";
import UserProfile from "@/components/chat/UserProfile";
import ChatInfoDrawer from "@/components/chat/ChatInfoDrawer";
import ProfileModal from "@/components/chat/ProfileModal";
import ThemeCustomizer from "@/components/chat/ThemeCustomizer";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: "online" | "away" | "offline";
  statusMessage?: string;
  description?: string;
  banner?: string;
  socialLinks?: { platform: string; url: string }[];
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
  type: "text" | "image" | "document";
  mediaUrl?: string;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  type: "dm" | "group";
  lastMessage?: string;
  unread?: number;
  members?: User[];
  customBackground?: string;
}

const Index = () => {
  const { user: currentUser } = useAuth();
  const { chats, selectedChat, setSelectedChat } = useChat();
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<User | null>(null);
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        onShowThemeCustomizer={() => setShowThemeCustomizer(true)}
        currentUser={currentUser}
        onOpenUserProfile={() => setShowUserProfile(true)}
      />
      
      <div className="flex-1 flex flex-col">
        <ChatArea
          chat={selectedChat}
          currentUser={currentUser}
          onToggleChatInfo={() => setShowChatInfo(!showChatInfo)}
          onViewProfile={setSelectedProfile}
        />
      </div>

      <ChatInfoDrawer
        open={showChatInfo}
        onOpenChange={setShowChatInfo}
        chat={selectedChat}
        onViewProfile={setSelectedProfile}
      />

      <ProfileModal
        user={selectedProfile}
        open={!!selectedProfile}
        onOpenChange={() => setSelectedProfile(null)}
      />

      <ProfileModal
        user={currentUser}
        open={showUserProfile}
        onOpenChange={setShowUserProfile}
        isCurrentUser={true}
      />

      <ThemeCustomizer
        open={showThemeCustomizer}
        onOpenChange={setShowThemeCustomizer}
        selectedChat={selectedChat}
      />
    </div>
  );
};

export default Index;
