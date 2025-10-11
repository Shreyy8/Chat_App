import { User } from "@/pages/Index";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Twitter, Github, Linkedin, Link as LinkIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserProfileProps {
  user: User;
}

const UserProfile = ({ user }: UserProfileProps) => {
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

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "twitter":
        return <Twitter className="h-4 w-4" />;
      case "github":
        return <Github className="h-4 w-4" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4" />;
      default:
        return <LinkIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-80 glass-effect border-l border-border">
      <ScrollArea className="h-full">
        <div className="relative">
          {/* Banner */}
          <div
            className="h-32 gradient-primary animate-gradient"
            style={{
              backgroundImage: user.banner ? `url(${user.banner})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          
          {/* Profile Picture */}
          <div className="px-6 -mt-12">
            <div className="relative inline-block">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className={`absolute bottom-2 right-2 h-5 w-5 rounded-full ${getStatusColor(user.status)} border-2 border-background`} />
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">{user.username}</p>
            </div>

            {user.statusMessage && (
              <div className="glass-effect rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Status</p>
                <p className="text-sm text-muted-foreground">{user.statusMessage}</p>
              </div>
            )}

            {user.description && (
              <div>
                <p className="text-sm font-medium mb-2">About</p>
                <p className="text-sm text-muted-foreground">{user.description}</p>
              </div>
            )}

            {user.socialLinks && user.socialLinks.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-3">Social Links</p>
                <div className="space-y-2">
                  {user.socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg glass-effect hover:bg-primary/10 transition-colors"
                    >
                      {getSocialIcon(link.platform)}
                      <span className="text-sm">{link.platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default UserProfile;
