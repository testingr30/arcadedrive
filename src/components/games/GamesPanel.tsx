import { useState } from 'react';
import { Gamepad2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SnakeGame from './SnakeGame';
import PongGame from './PongGame';

interface GamesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const GamesPanel = ({ isOpen, onClose }: GamesPanelProps) => {
  const [activeGame, setActiveGame] = useState('snake');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative bg-card border-4 border-accent arcade-glow rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-accent neon-flicker" />
            <h2 className="font-pixel text-xs text-foreground">ARCADE GAMES</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-primary/20 hover:text-primary"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Game tabs */}
        <Tabs value={activeGame} onValueChange={setActiveGame} className="p-4">
          <TabsList className="grid grid-cols-2 gap-2 bg-muted/50 p-1">
            <TabsTrigger 
              value="snake" 
              className="font-pixel text-[8px] data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              🐍 SNAKE
            </TabsTrigger>
            <TabsTrigger 
              value="pong" 
              className="font-pixel text-[8px] data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
            >
              🏓 PONG
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="snake" className="mt-4">
            <SnakeGame />
          </TabsContent>
          
          <TabsContent value="pong" className="mt-4">
            <PongGame />
          </TabsContent>
        </Tabs>

        {/* Decorative corners */}
        <div className="absolute top-0 left-0 w-3 h-3 bg-secondary" />
        <div className="absolute top-0 right-0 w-3 h-3 bg-primary" />
        <div className="absolute bottom-0 left-0 w-3 h-3 bg-primary" />
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-secondary" />
      </div>
    </div>
  );
};

export default GamesPanel;
