import { useEffect, useRef } from 'react';
import MessageBubble, { Message } from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageList = ({ messages, isLoading }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto arcade-scrollbar"
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full px-4">
          <div className="text-center max-w-md">
            {/* Pixel hearts */}
            <div className="flex justify-center gap-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 bg-primary arcade-glow-red"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 35%, 100% 70%, 50% 100%, 0% 70%, 0% 35%)',
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
            
            <h2 className="font-pixel text-secondary text-sm md:text-base mb-4">
              ARCADE AI ASSISTANT
            </h2>
            
            <p className="text-muted-foreground mb-6 leading-relaxed">
              I can help you manage your Google Drive files. Ask me to:
            </p>
            
            <div className="grid gap-3 text-left">
              {[
                '📁 List and browse your files',
                '📝 Create and edit documents',
                '📊 Read and modify spreadsheets',
                '🗑️ Delete or organize files',
                '🔍 Search for specific content',
              ].map((item, i) => (
                <div
                  key={i}
                  className="px-4 py-2 bg-muted/50 rounded-lg border border-border text-sm text-foreground hover:border-accent hover:bg-muted transition-colors cursor-default"
                >
                  {item}
                </div>
              ))}
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
