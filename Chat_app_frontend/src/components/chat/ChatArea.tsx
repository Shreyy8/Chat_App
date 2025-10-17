import { useState } from "react";
import { Phone, Video, Info, MoreVertical, Send, Paperclip, Smile, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Chat, User, Message } from "@/pages/Index";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import MessageBubble from "./MessageBubble";

interface ChatAreaProps {
  chat: Chat | null;
  currentUser: User;
  onToggleChatInfo: () => void;
  onViewProfile: (user: User) => void;
}

const ChatArea = ({ chat, currentUser, onToggleChatInfo, onViewProfile }: ChatAreaProps) => {
  const [messageInput, setMessageInput] = useState("");
  const { messages, sendMessage, isLoading } = useChat();

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 rounded-full gradient-primary mx-auto flex items-center justify-center">
            <MessageSquare className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Welcome to ChatFlow</h2>
          <p className="text-muted-foreground">Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (messageInput.trim() && chat) {
      try {
        await sendMessage(messageInput.trim());
        setMessageInput("");
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="glass-effect border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={() => {
                if (chat.type === "dm") {
                  const dmUser: User = {
                    id: "other-user",
                    name: chat.name,
                    username: `@${chat.name.toLowerCase().replace(" ", "")}`,
                    avatar: chat.avatar,
                    status: "online",
                    statusMessage: "Available",
                    description: "User description goes here",
                  };
                  onViewProfile(dmUser);
                }
              }}
            >
              <AvatarImage src={chat.avatar} />
              <AvatarFallback>{chat.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{chat.name}</h3>
              {chat.type === "group" && chat.members && (
                <p className="text-sm text-muted-foreground">
                  {chat.members.length} members
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <Video className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onToggleChatInfo}
              className="hover:bg-primary/10"
            >
              <Info className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-effect">
                {chat.type === "dm" && (
                  <DropdownMenuItem>Close Direct Message</DropdownMenuItem>
                )}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Mute Messages</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="glass-effect">
                    <DropdownMenuItem>For 15 minutes</DropdownMenuItem>
                    <DropdownMenuItem>For 1 hour</DropdownMenuItem>
                    <DropdownMenuItem>For 8 hours</DropdownMenuItem>
                    <DropdownMenuItem>For 24 hours</DropdownMenuItem>
                    <DropdownMenuItem>Until I turn it back on</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea 
        className="flex-1 p-4" 
        style={{
          background: chat.customBackground || 'transparent'
        }}
      >
        <div className="space-y-4 max-w-4xl mx-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading messages...</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={{
                  id: message._id,
                  userId: message.senderId,
                  userName: message.senderName,
                  userAvatar: message.senderAvatar || "",
                  content: message.content,
                  timestamp: new Date(message.createdAt),
                  type: message.type,
                  mediaUrl: message.mediaUrl,
                }}
                isOwn={message.senderId === currentUser._id}
                showName={chat.type === "group"}
                onAvatarClick={() => {
                  if (message.senderId !== currentUser._id) {
                    const user: User = {
                      id: message.senderId,
                      name: message.senderName,
                      username: `@${message.senderName.toLowerCase().replace(" ", "")}`,
                      avatar: message.senderAvatar || "",
                      status: "online",
                    };
                    onViewProfile(user);
                  }
                }}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="glass-effect border-t border-border p-4">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" className="hover:bg-primary/10">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 glass-effect border-border"
          />
          <Button variant="ghost" size="icon" className="hover:bg-primary/10">
            <Smile className="h-5 w-5" />
          </Button>
          <Button 
            onClick={handleSendMessage}
            className="gradient-primary"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
