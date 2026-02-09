import { useEffect, useRef } from 'react';
import MessageBubble, { Message } from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';
import LeaderboardWidget from '@/components/LeaderboardWidget';
import { 
  Folder, FileText, Table2, Trash2, Search, Shield, Gamepad2, 
  Shuffle, Edit, Copy, FolderUp, FileArchive, Star, 
  FilePlus, Download, Share2, HardDrive, Cloud, Zap
} from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage?: (message: string) => void;
  onOpenGames?: () => void;
}

// Grouped actions for better organization
const ACTION_GROUPS = [
  {
    title: 'CREATE',
    actions: [
      { icon: Shuffle, label: 'Random File', message: 'Create a new file with random sample data entries for testing purposes', color: 'primary' },
      { icon: FileText, label: 'New Doc', message: 'Create a new Google Docs document', color: 'accent' },
      { icon: Table2, label: 'New Sheet', message: 'Create a new Google Sheets spreadsheet', color: 'accent' },
      { icon: FilePlus, label: 'New Folder', message: 'Create a new folder in my Google Drive', color: 'accent' },
    ]
  },
  {
    title: 'MANAGE',
    actions: [
      { icon: Edit, label: 'Edit File', message: 'I want to edit a file in my Google Drive. Show me my recent files so I can pick one.', color: 'accent' },
      { icon: Copy, label: 'Duplicate', message: 'Show me my files so I can duplicate one', color: 'accent' },
      { icon: FolderUp, label: 'Move', message: 'Help me move files between folders in my Google Drive', color: 'accent' },
      { icon: Share2, label: 'Share', message: 'Help me share a file from my Google Drive with someone', color: 'accent' },
    ]
  },
  {
    title: 'EXPLORE',
    actions: [
      { icon: Folder, label: 'All Files', message: 'List all my Google Drive files', color: 'accent' },
      { icon: Star, label: 'Starred', message: 'Show me my starred files in Google Drive', color: 'accent' },
      { icon: Search, label: 'Search', message: 'Search my Google Drive for files', color: 'accent' },
      { icon: Download, label: 'Recent', message: 'Show me my recently modified files in Google Drive', color: 'accent' },
    ]
  },
  {
    title: 'UTILITIES',
    actions: [
      { icon: FileArchive, label: 'Backup', message: 'Create a backup of my important Google Drive files', color: 'accent' },
      { icon: Trash2, label: 'Cleanup', message: 'Help me find and remove duplicate or old files in my Google Drive', color: 'accent' },
      { icon: HardDrive, label: 'Storage', message: 'Show me my Google Drive storage usage and largest files', color: 'accent' },
      { icon: Gamepad2, label: 'Games', message: null, color: 'secondary' },
    ]
  },
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

  const handleQuickAction = (action: { message: string | null }) => {
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
        <div className="flex flex-col items-center justify-center h-full px-4 py-6 relative">
          {/* Floating file decorations */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <FileText className="floating-file w-8 h-8 text-accent left-[5%] top-[20%]" style={{ animationDelay: '0s' }} />
            <Table2 className="floating-file w-6 h-6 text-secondary left-[85%] top-[15%]" style={{ animationDelay: '2s' }} />
            <Folder className="floating-file w-10 h-10 text-primary left-[90%] top-[60%]" style={{ animationDelay: '4s' }} />
            <Cloud className="floating-file w-12 h-12 text-secondary/50 left-[8%] top-[70%]" style={{ animationDelay: '6s' }} />
          </div>

          <div className="text-center max-w-2xl w-full relative z-10">
            {/* Drive-themed header */}
            <div className="relative mb-6">
              <div className="w-24 h-24 mx-auto relative">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-2 border-secondary/30 animate-spin" style={{ animationDuration: '20s' }} />
                {/* Inner container */}
                <div className="absolute inset-2 bg-gradient-to-br from-card to-background rounded-xl arcade-glow flex items-center justify-center upload-pulse">
                  <HardDrive className="w-10 h-10 text-secondary drive-icon-glow" />
                </div>
                {/* Orbiting icons */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                  <FileText className="w-4 h-4 text-accent" />
                </div>
                <div className="absolute top-1/2 -right-1 -translate-y-1/2">
                  <Table2 className="w-4 h-4 text-primary" />
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                  <Folder className="w-4 h-4 text-secondary" />
                </div>
              </div>
            </div>
            
            <h2 className="font-pixel text-secondary text-sm md:text-base mb-1 tracking-wider">
              ARCADE DRIVE
            </h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-primary animate-pulse" />
              <h3 className="font-pixel text-accent text-[10px] md:text-xs">
                AI-POWERED FILE MANAGER
              </h3>
              <Zap className="w-4 h-4 text-primary animate-pulse" />
            </div>
            
            <p className="text-muted-foreground mb-6 text-sm">
              Select an action to manage your Google Drive:
            </p>
            
            {/* Grouped action buttons */}
            <div className="space-y-4 mb-6">
              {ACTION_GROUPS.map((group, groupIndex) => (
                <div key={group.title} className="stagger-item" style={{ animationDelay: `${groupIndex * 0.1}s` }}>
                  {/* Group title */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                    <span className="font-pixel text-[8px] text-muted-foreground tracking-widest">{group.title}</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                  </div>
                  
                  {/* Action buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {group.actions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickAction(action)}
                        className={`group relative px-2 py-2.5 rounded-lg border text-sm text-foreground transition-all duration-200 flex flex-col items-center gap-1.5 arcade-button-press data-stream ${
                          action.color === 'secondary' 
                            ? 'bg-secondary/10 border-secondary/50 hover:bg-secondary/20 hover:border-secondary hover:arcade-glow-yellow' 
                            : action.color === 'primary'
                            ? 'bg-primary/10 border-primary/50 hover:bg-primary/20 hover:border-primary hover:arcade-glow-red'
                            : 'bg-card/50 border-border/50 hover:border-accent hover:bg-accent/10 hover:arcade-glow'
                        }`}
                      >
                        <action.icon className={`w-5 h-5 group-hover:scale-110 transition-all duration-200 ${
                          action.color === 'secondary' ? 'text-secondary group-hover:drop-shadow-[0_0_8px_hsl(var(--secondary))]' 
                          : action.color === 'primary' ? 'text-primary group-hover:drop-shadow-[0_0_8px_hsl(var(--primary))]' 
                          : 'text-accent group-hover:drop-shadow-[0_0_8px_hsl(var(--accent))]'
                        }`} />
                        <span className="font-pixel text-[7px] text-center leading-tight">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Leaderboard Widget */}
            <LeaderboardWidget className="mb-4" />

            {/* Fix Authentication button */}
            <button
              onClick={() => onSendMessage && onSendMessage(FIX_AUTH_MESSAGE)}
              className="w-full group relative px-4 py-3 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-lg border border-primary/50 text-sm text-foreground hover:border-primary transition-all duration-200 hover:arcade-glow-red flex items-center justify-center gap-3 arcade-button-press overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Shield className="w-5 h-5 text-primary group-hover:scale-110 transition-transform relative z-10" />
              <span className="font-pixel text-[10px] text-primary relative z-10">CONNECT GOOGLE DRIVE</span>
            </button>

            {/* Status bar */}
            <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="font-pixel">SYSTEM ONLINE</span>
              </div>
              <div className="w-px h-3 bg-border" />
              <div className="flex items-center gap-1">
                <Cloud className="w-3 h-3 text-secondary" />
                <span className="font-pixel">CLOUD READY</span>
              </div>
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
