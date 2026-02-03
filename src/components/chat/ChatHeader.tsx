import { HardDrive, Sparkles } from 'lucide-react';

const ChatHeader = () => {
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

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-muted-foreground font-pixel">
            ONLINE
          </span>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
