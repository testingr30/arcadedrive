import { useState, useEffect } from 'react';
import { X, History, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAudioContext } from '@/contexts/AudioContext';

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  preview: string;
}

interface ChatHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
}

const HISTORY_KEY = 'arcade-chat-history';

export const saveChatSession = (messages: { role: string; content: string }[]) => {
  if (messages.length < 2) return;
  
  const sessions = getChatSessions();
  const firstUserMessage = messages.find(m => m.role === 'user')?.content || 'New Chat';
  const title = firstUserMessage.slice(0, 40) + (firstUserMessage.length > 40 ? '...' : '');
  
  const newSession: ChatSession = {
    id: Date.now().toString(),
    title,
    timestamp: new Date().toISOString(),
    preview: messages[messages.length - 1]?.content?.slice(0, 60) || ''
  };
  
  sessions.unshift(newSession);
  // Keep only last 20 sessions
  localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions.slice(0, 20)));
  localStorage.setItem(`chat-session-${newSession.id}`, JSON.stringify(messages));
};

export const getChatSessions = (): ChatSession[] => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getSessionMessages = (sessionId: string) => {
  try {
    const data = localStorage.getItem(`chat-session-${sessionId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const deleteSession = (sessionId: string) => {
  const sessions = getChatSessions().filter(s => s.id !== sessionId);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions));
  localStorage.removeItem(`chat-session-${sessionId}`);
};

const ChatHistoryPanel = ({ isOpen, onClose, onSelectSession }: ChatHistoryPanelProps) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const { playSound } = useAudioContext();

  useEffect(() => {
    if (isOpen) {
      setSessions(getChatSessions());
    }
  }, [isOpen]);

  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    playSound('blip');
    deleteSession(sessionId);
    setSessions(getChatSessions());
  };

  const handleSelect = (sessionId: string) => {
    playSound('click');
    onSelectSession(sessionId);
    onClose();
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-background/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-card border-l-4 border-accent z-50 
          transform transition-all duration-300 ease-out arcade-glow
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-accent animate-pulse" />
            <span className="font-pixel text-xs text-accent">CHAT HISTORY</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              playSound('click');
              onClose();
            }}
            className="hover:bg-primary/20 transition-colors"
          >
            <X className="w-5 h-5 text-primary" />
          </Button>
        </div>

        {/* Sessions List */}
        <ScrollArea className="h-[calc(100%-60px)] arcade-scrollbar">
          <div className="p-2 space-y-2">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-pixel text-[8px] text-center">NO HISTORY YET</p>
                <p className="text-xs mt-2 text-center">Start chatting to save sessions</p>
              </div>
            ) : (
              sessions.map((session, index) => (
                <div
                  key={session.id}
                  onClick={() => handleSelect(session.id)}
                  className="group p-3 rounded-lg bg-muted/30 hover:bg-accent/20 
                    border border-transparent hover:border-accent/50
                    cursor-pointer transition-all duration-200
                    hover:arcade-glow animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-pixel text-[8px] text-secondary truncate">
                        {session.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {session.preview}
                      </p>
                      <p className="text-[10px] text-accent/70 mt-2">
                        {formatDate(session.timestamp)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(e, session.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity 
                        hover:bg-destructive/20 hover:text-destructive w-8 h-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
};

export default ChatHistoryPanel;
