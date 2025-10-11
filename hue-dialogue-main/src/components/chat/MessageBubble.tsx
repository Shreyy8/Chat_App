import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message } from "@/pages/Index";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showName: boolean;
  onAvatarClick: () => void;
}

const MessageBubble = ({ message, isOwn, showName, onAvatarClick }: MessageBubbleProps) => {
  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      <Avatar 
        className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
        onClick={onAvatarClick}
      >
        <AvatarImage src={message.userAvatar} />
        <AvatarFallback>{message.userName[0]}</AvatarFallback>
      </Avatar>
      
      <div className={`flex flex-col gap-1 max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
        {showName && !isOwn && (
          <span className="text-sm font-medium text-muted-foreground px-3">
            {message.userName}
          </span>
        )}
        
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "glass-effect rounded-bl-sm"
          }`}
        >
          <p className="text-sm break-words">{message.content}</p>
        </div>
        
        <span className="text-xs text-muted-foreground px-3">
          {format(message.timestamp, "HH:mm")}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
