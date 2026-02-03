import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [input]);

  return (
    <div className="border-t border-border bg-card/80 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div
          className={cn(
            'relative flex items-end gap-2 bg-input rounded-xl border-2 border-border transition-all duration-200',
            'focus-within:border-accent focus-within:arcade-glow'
          )}
        >
          {/* Attachment button (visual only for now) */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute left-2 bottom-2 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your Google Drive files..."
            className={cn(
              'flex-1 min-h-[48px] max-h-[200px] resize-none border-0 bg-transparent',
              'pl-12 pr-14 py-3 text-foreground placeholder:text-muted-foreground',
              'focus-visible:ring-0 focus-visible:ring-offset-0'
            )}
            disabled={isLoading}
            rows={1}
          />

          {/* Send button */}
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className={cn(
              'absolute right-2 bottom-2 h-8 w-8 rounded-lg',
              'bg-primary hover:bg-primary/90 text-primary-foreground',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200',
              input.trim() && !isLoading && 'arcade-glow-red'
            )}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-2 font-pixel">
          CONNECTED TO GOOGLE DRIVE • PRESS ENTER TO SEND
        </p>
      </form>
    </div>
  );
};

export default ChatInput;
