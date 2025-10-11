import { MessageSquare, Users, Settings, Palette, LogOut } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Chat, User } from "@/pages/Index";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onShowThemeCustomizer: () => void;
  currentUser: User;
  onOpenUserProfile: () => void;
}

const Sidebar = ({ chats, selectedChat, onSelectChat, onShowThemeCustomizer, currentUser, onOpenUserProfile }: SidebarProps) => {
  const { logout } = useAuth();
  const directMessages = chats.filter(chat => chat.type === "dm");
  const groupChats = chats.filter(chat => chat.type === "group");

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!currentUser) {
    return <div className="w-80 glass-effect flex items-center justify-center border-r border-border">Loading...</div>;
  }

  return (
    <div className="w-80 glass-effect flex flex-col border-r border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
            ChatFlow
          </h1>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onShowThemeCustomizer}
            className="hover:bg-primary/10"
          >
            <Palette className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Direct Messages
              </h2>
            </div>
            <div className="space-y-1">
              {directMessages.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-secondary/50 ${
                    selectedChat?.id === chat.id ? "bg-secondary" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback>{chat.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{chat.name}</p>
                      {chat.unread && chat.unread > 0 && (
                        <Badge className="bg-primary text-primary-foreground ml-2">
                          {chat.unread}
                        </Badge>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Group Chats
              </h2>
            </div>
            <div className="space-y-1">
              {groupChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-secondary/50 ${
                    selectedChat?.id === chat.id ? "bg-secondary" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback>{chat.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium truncate">{chat.name}</p>
                    {chat.lastMessage && (
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Compact User Section */}
      <div className="border-t border-border">
        <div className="flex items-center">
          <button
            onClick={onOpenUserProfile}
            className="flex-1 p-3 flex items-center gap-3 hover:bg-secondary/50 transition-all group"
          >
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
              </Avatar>
              <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${getStatusColor(currentUser.status)} border-2 border-background`} />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium truncate text-sm">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity truncate">
                {currentUser.statusMessage || currentUser.status}
              </p>
            </div>
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
