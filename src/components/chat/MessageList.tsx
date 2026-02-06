import { useEffect, useRef } from 'react';
import MessageBubble, { Message } from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import LeaderboardWidget from '@/components/LeaderboardWidget';
import { Folder, FileText, Table2, Trash2, Search, Shield, Gamepad2 } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage?: (message: string) => void;
  onOpenGames?: () => void;
}

const QUICK_ACTIONS = [
  { icon: Folder, label: 'List Files', message: 'List all my Google Drive files' },
  { icon: FileText, label: 'Create Doc', message: 'Create a new Google Docs document' },
  { icon: Table2, label: 'Create Sheet', message: 'Create a new Google Sheets spreadsheet' },
  { icon: Trash2, label: 'Organize', message: 'Help me organize my Google Drive files' },
  { icon: Search, label: 'Search', message: 'Search my Google Drive for files' },
  { icon: Gamepad2, label: 'Play Game', message: null }, // Special handler for games
];

const FIX_AUTH_MESSAGE = `You are an AI worker connected to Toolhouse AI. Your main task is to create and manage files in the user's Google Drive.

If an action fails with "Authentication required" or contains a structuredContent.url for integration (like Google Drive), follow this workflow:

1. Detect authentication needed:
   - If the API response includes structuredContent.integration or a message containing "Authentication required", extract the provided url.

2. Respond gracefully:
   - Instead of showing a raw error, show a friendly message:
   "I need permission to access your Google Drive. Please connect your account below."
   - Include a Connect Google Drive button that links to the extracted URL.

3. After the user connects:
   - Once the connection is established, automatically retry the original action (e.g., creating or modifying the file).
   - Confirm success with a message like:
   "✅ Your Google Drive is now connected. The file has been created successfully!"

4. Error handling:
   - If authentication still fails, prompt the user to reconnect.
   - Always display clean and human-friendly feedback, not raw JSON.

5. Example behavior:
   - If you receive:
   {
     "structuredContent": {
       "url": "https://api.toolhouse.ai/public/integrations/...&integration=googledrive",
       "integration": "googledrive"
     }
   }
   → Show a connect button and guide the user through linking their Google account.

6. General tone and design:
   - Keep the interface simple, friendly, and professional.
   - Use emojis or icons (🔗, ✅, ⚠️) sparingly for clarity.
   - Always retry seamlessly after authorization without requiring the user to repeat their command.`;

const MessageList = ({ messages, isLoading, onSendMessage, onOpenGames }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    if (action.message === null && onOpenGames) {
      onOpenGames();
    } else if (action.message && onSendMessage) {
      onSendMessage(action.message);
    }
  };

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto arcade-scrollbar"
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full px-4 py-8">
          <div className="text-center max-w-lg w-full">
            {/* Animated arcade logo */}
            <div className="relative mb-8">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-destructive rounded-lg arcade-glow-red flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <span className="font-pixel text-2xl text-primary-foreground">AI</span>
              </div>
              {/* Pixel corners */}
              <div className="absolute -top-2 -left-2 w-4 h-4 bg-secondary" />
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent" />
              <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-accent" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-secondary" />
            </div>
            
            <h2 className="font-pixel text-secondary text-xs md:text-sm mb-2 tracking-wider animate-pulse">
              INSERT COIN
            </h2>
            <h3 className="font-pixel text-accent text-[10px] md:text-xs mb-6">
              GOOGLE DRIVE ASSISTANT
            </h3>
            
            <p className="text-muted-foreground mb-8 text-sm">
              Press a button to begin your quest:
            </p>
            
            {/* Quick action buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAction(action)}
                  className={`group relative px-4 py-3 rounded-lg border-2 text-sm text-foreground transition-all duration-200 flex flex-col items-center gap-2 arcade-button-press ${
                    action.message === null 
                      ? 'bg-secondary/20 border-secondary hover:bg-secondary/30 hover:arcade-glow-yellow' 
                      : 'bg-muted/50 border-border hover:border-accent hover:bg-accent/10 hover:arcade-glow'
                  }`}
                >
                  <action.icon className={`w-5 h-5 group-hover:scale-110 transition-transform ${
                    action.message === null ? 'text-secondary neon-flicker' : 'text-accent'
                  }`} />
                  <span className="font-pixel text-[8px]">{action.label}</span>
                  {/* Pixel hover effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className={`absolute top-0 left-0 w-2 h-2 ${action.message === null ? 'bg-secondary' : 'bg-accent'}`} />
                    <div className={`absolute top-0 right-0 w-2 h-2 ${action.message === null ? 'bg-secondary' : 'bg-accent'}`} />
                    <div className={`absolute bottom-0 left-0 w-2 h-2 ${action.message === null ? 'bg-secondary' : 'bg-accent'}`} />
                    <div className={`absolute bottom-0 right-0 w-2 h-2 ${action.message === null ? 'bg-secondary' : 'bg-accent'}`} />
                  </div>
                </button>
              ))}
            </div>

            {/* Leaderboard Widget */}
            <LeaderboardWidget className="mb-6" />

            {/* Fix Authentication button */}
            <button
              onClick={() => onSendMessage && onSendMessage(FIX_AUTH_MESSAGE)}
              className="w-full group relative px-4 py-3 bg-primary/20 rounded-lg border-2 border-primary text-sm text-foreground hover:bg-primary/30 transition-all duration-200 hover:arcade-glow-red flex items-center justify-center gap-3 arcade-button-press"
            >
              <Shield className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-pixel text-[10px] text-primary">FIX AUTHENTICATION</span>
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
            </button>

            {/* Decorative elements */}
            <div className="mt-8 flex justify-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              <div className="w-3 h-3 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-3 h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="bg-chat-assistant">
              <LoadingIndicator />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageList;
