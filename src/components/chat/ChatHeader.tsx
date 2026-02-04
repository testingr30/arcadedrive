import { HardDrive, Sparkles, Gamepad2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onOpenGames?: () => void;
  onGoHome?: () => void;
  showHomeButton?: boolean;
}

const ChatHeader = ({ onOpenGames, onGoHome, showHomeButton = false }: ChatHeaderProps) => {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center arcade-glow-red">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            {/* Pixel decoration */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary" />
          </div>
          
          <div>
            <h1 className="font-pixel text-xs md:text-sm text-foreground">
              ARCADE AI
            </h1>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              Google Drive Assistant
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {showHomeButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onGoHome}
              className="font-pixel text-[8px] hover:bg-accent/20 hover:text-accent gap-1"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">HOME</span>
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenGames}
            className="font-pixel text-[8px] hover:bg-secondary/20 hover:text-secondary gap-1 pulse-ring"
          >
            <Gamepad2 className="w-4 h-4 neon-flicker" />
            <span className="hidden sm:inline">GAMES</span>
          </Button>

          {/* Status indicator */}
          <div className="flex items-center gap-2 ml-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] text-muted-foreground font-pixel hidden sm:inline">
              ONLINE
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
