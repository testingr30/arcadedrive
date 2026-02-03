import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'message-appear flex gap-3 px-4 py-4 md:px-6',
        isUser ? 'bg-chat-user' : 'bg-chat-assistant'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
          isUser
            ? 'bg-primary arcade-glow-red'
            : 'bg-accent arcade-glow'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-accent-foreground" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-pixel text-[10px] text-secondary">
            {isUser ? 'YOU' : 'ARCADE AI'}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="mb-2 last:mb-0 text-foreground leading-relaxed">
                  {children}
                </p>
              ),
              h1: ({ children }) => (
                <h1 className="font-pixel text-lg text-secondary mb-3 mt-4">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="font-pixel text-sm text-secondary mb-2 mt-3">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="font-pixel text-xs text-secondary mb-2 mt-3">
                  {children}
                </h3>
              ),
              code: ({ className, children, ...props }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="px-1.5 py-0.5 bg-muted rounded text-accent font-mono text-sm">
                    {children}
                  </code>
                ) : (
                  <code
                    className={cn(
                      'block p-3 bg-muted rounded-lg overflow-x-auto font-mono text-sm',
                      className
                    )}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              pre: ({ children }) => (
                <pre className="my-2 bg-muted rounded-lg overflow-hidden">
                  {children}
                </pre>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-2 space-y-1">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-2 space-y-1">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-foreground">{children}</li>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent/80 underline underline-offset-2"
                >
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-accent pl-4 italic text-muted-foreground my-2">
                  {children}
                </blockquote>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-secondary">{children}</strong>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
