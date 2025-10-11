import { useState } from "react";
import { Chat, User } from "@/pages/Index";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Image, FileText, User as UserIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatInfoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chat: Chat | null;
  onViewProfile: (user: User) => void;
}

const ChatInfoDrawer = ({ open, onOpenChange, chat, onViewProfile }: ChatInfoDrawerProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  if (!chat) return null;

  // Mock data
  const mockMedia = [
    { id: "1", url: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=200&h=200&fit=crop", type: "image" },
    { id: "2", url: "https://images.unsplash.com/photo-1614729939124-032da77bafb5?w=200&h=200&fit=crop", type: "image" },
    { id: "3", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop", type: "image" },
  ];

  const mockDocuments = [
    { id: "1", name: "Project_Proposal.pdf", size: "2.5 MB", date: "2024-01-15" },
    { id: "2", name: "Design_Specs.docx", size: "1.2 MB", date: "2024-01-14" },
    { id: "3", name: "Meeting_Notes.txt", size: "45 KB", date: "2024-01-13" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-96 glass-effect p-0">
        <SheetHeader className="p-6 border-b border-border">
          <SheetTitle>Chat Information</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="media" className="h-[calc(100vh-5rem)]">
          <TabsList className="w-full grid grid-cols-3 glass-effect m-4">
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100%-8rem)]">
            <TabsContent value="media" className="p-4 space-y-4">
              {chat.type === "group" && chat.members && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Members</h3>
                  {chat.members.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => onViewProfile(member)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg glass-effect hover:bg-primary/10 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {chat.type === "dm" && (
                <Button 
                  className="w-full gradient-primary"
                  onClick={() => {
                    const dmUser: User = {
                      id: "other-user",
                      name: chat.name,
                      username: `@${chat.name.toLowerCase().replace(" ", "")}`,
                      avatar: chat.avatar,
                      status: "online",
                    };
                    onViewProfile(dmUser);
                  }}
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              )}

              <div>
                <h3 className="text-sm font-medium mb-3">Shared Media</h3>
                <div className="grid grid-cols-3 gap-2">
                  {mockMedia.map((item) => (
                    <div
                      key={item.id}
                      className="aspect-square rounded-lg overflow-hidden glass-effect hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                    >
                      <img
                        src={item.url}
                        alt="Shared media"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="p-4 space-y-3">
              {mockDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 rounded-lg glass-effect hover:bg-primary/10 transition-colors cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.size} • {doc.date}
                    </p>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="search" className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="pl-10 glass-effect"
                />
              </div>
              
              {searchQuery && (
                <div className="space-y-2">
                  <div className="p-3 rounded-lg glass-effect">
                    <p className="text-sm font-medium mb-1">Sarah Chen</p>
                    <p className="text-sm text-muted-foreground">
                      That sounds great! Let's do it 😊
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Yesterday at 14:23</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default ChatInfoDrawer;
