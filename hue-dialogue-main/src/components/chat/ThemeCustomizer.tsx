import { useState } from "react";
import { Chat } from "@/pages/Index";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ThemeCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedChat: Chat | null;
}

const ThemeCustomizer = ({ open, onOpenChange, selectedChat }: ThemeCustomizerProps) => {
  const [selectedTheme, setSelectedTheme] = useState("default");

  const backgroundPresets = [
    { id: "default", name: "Default", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { id: "ocean", name: "Ocean", gradient: "linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)" },
    { id: "sunset", name: "Sunset", gradient: "linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 50%, #2BFF88 100%)" },
    { id: "forest", name: "Forest", gradient: "linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)" },
    { id: "fire", name: "Fire", gradient: "linear-gradient(135deg, #FFE000 0%, #799F0C 100%)" },
    { id: "candy", name: "Candy", gradient: "linear-gradient(135deg, #FC466B 0%, #3F5EFB 100%)" },
  ];

  const chatBackgrounds = [
    { id: "none", name: "None", style: "" },
    { id: "subtle", name: "Subtle Dots", style: "radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.03) 1px, transparent 1px), radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.03) 1px, transparent 1px)" },
    { id: "grid", name: "Grid", style: "linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)" },
    { id: "waves", name: "Waves", style: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.02) 10px, rgba(255, 255, 255, 0.02) 20px)" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-effect max-w-2xl">
        <DialogHeader>
          <DialogTitle>Customize Appearance</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="app">
          <TabsList className="grid w-full grid-cols-2 glass-effect">
            <TabsTrigger value="app">App Theme</TabsTrigger>
            <TabsTrigger value="chat" disabled={!selectedChat}>
              Chat Background
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] mt-4">
            <TabsContent value="app" className="space-y-4">
              <Label>Background Gradient</Label>
              <div className="grid grid-cols-3 gap-4">
                {backgroundPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedTheme(preset.id)}
                    className={`relative h-24 rounded-lg overflow-hidden transition-all ${
                      selectedTheme === preset.id ? "ring-2 ring-primary scale-105" : "hover:scale-105"
                    }`}
                  >
                    <div
                      style={{ background: preset.gradient }}
                      className="w-full h-full"
                    />
                    <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/50 to-transparent">
                      <span className="text-xs font-medium text-white">{preset.name}</span>
                    </div>
                  </button>
                ))}
              </div>
              <Button className="w-full gradient-primary">Apply Theme</Button>
            </TabsContent>

            <TabsContent value="chat" className="space-y-4">
              <Label>Chat Background Pattern</Label>
              <div className="grid grid-cols-2 gap-4">
                {chatBackgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    className="relative h-32 rounded-lg overflow-hidden glass-effect hover:ring-2 hover:ring-primary transition-all"
                  >
                    <div
                      style={{ background: bg.style }}
                      className="w-full h-full"
                    />
                    <div className="absolute inset-0 flex items-end p-3 bg-gradient-to-t from-black/50 to-transparent">
                      <span className="text-sm font-medium text-white">{bg.name}</span>
                    </div>
                  </button>
                ))}
              </div>
              <Button className="w-full gradient-primary">
                Apply to {selectedChat?.name}
              </Button>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeCustomizer;
