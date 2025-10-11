import { User } from "@/pages/Index";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone, Video, Settings, Edit2, Camera, Link as LinkIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface ProfileModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCurrentUser?: boolean;
}

const ProfileModal = ({ user, open, onOpenChange, isCurrentUser = false }: ProfileModalProps) => {
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  if (!user) return null;

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

  const handleSave = () => {
    // Save logic here
    setEditMode(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect max-w-2xl p-0 gap-0 max-h-[90vh]">
        <div className="relative">
          {/* Banner */}
          <div
            className="h-32 gradient-primary animate-gradient rounded-t-lg relative group"
            style={{
              backgroundImage: user.banner ? `url(${user.banner})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {isCurrentUser && editMode && (
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="h-4 w-4 mr-2" />
                Change Banner
              </Button>
            )}
          </div>
          
          {/* Profile Picture */}
          <div className="px-6 -mt-12 flex justify-between items-end">
            <div className="relative inline-block group">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className={`absolute bottom-2 right-2 h-5 w-5 rounded-full ${getStatusColor(user.status)} border-2 border-background`} />
              {isCurrentUser && editMode && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute inset-0 m-auto w-fit h-fit opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            {isCurrentUser && !editMode && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditMode(true)}
                className="mb-2"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
            {isCurrentUser && editMode && (
              <div className="flex gap-2 mb-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditMode(false);
                    setEditedUser(user);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="gradient-primary"
                >
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-[60vh]">
          {isCurrentUser ? (
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b px-6">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="p-6 space-y-4">
                {!editMode ? (
                  <>
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
                            <div key={index} className="flex items-center gap-3 p-3 rounded-lg glass-effect">
                              <LinkIcon className="h-4 w-4" />
                              <span className="text-sm">{link.platform}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        value={editedUser?.name}
                        onChange={(e) => setEditedUser({ ...editedUser!, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={editedUser?.username}
                        onChange={(e) => setEditedUser({ ...editedUser!, username: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="statusMessage">Status Message</Label>
                      <Input
                        id="statusMessage"
                        value={editedUser?.statusMessage || ""}
                        onChange={(e) => setEditedUser({ ...editedUser!, statusMessage: e.target.value })}
                        placeholder="What's on your mind?"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">About</Label>
                      <Textarea
                        id="description"
                        value={editedUser?.description || ""}
                        onChange={(e) => setEditedUser({ ...editedUser!, description: e.target.value })}
                        placeholder="Tell us about yourself"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Social Links</Label>
                      <Button variant="outline" size="sm" className="w-full">
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Add Social Link
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select defaultValue={user.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500" />
                            Online
                          </div>
                        </SelectItem>
                        <SelectItem value="away">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-yellow-500" />
                            Away
                          </div>
                        </SelectItem>
                        <SelectItem value="offline">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-gray-500" />
                            Offline
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="glass-effect rounded-lg p-4 space-y-3">
                    <h3 className="font-medium">Privacy</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Show online status</span>
                      <Button variant="outline" size="sm">Toggle</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Allow direct messages</span>
                      <Button variant="outline" size="sm">Toggle</Button>
                    </div>
                  </div>

                  <div className="glass-effect rounded-lg p-4 space-y-3">
                    <h3 className="font-medium">Notifications</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Message notifications</span>
                      <Button variant="outline" size="sm">Toggle</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Call notifications</span>
                      <Button variant="outline" size="sm">Toggle</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
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

              <div className="flex gap-2 pt-4">
                <Button className="flex-1 gradient-primary">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button variant="secondary" size="icon" className="glass-effect">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" className="glass-effect">
                  <Video className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
