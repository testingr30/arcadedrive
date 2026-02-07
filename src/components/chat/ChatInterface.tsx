import { useState, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import GamesPanel from '../games/GamesPanel';
import ChatHistoryPanel, { saveChatSession, getSessionMessages } from './ChatHistoryPanel';
import { useToolhouseAgent } from '@/hooks/useToolhouseAgent';
import { useGlobalClickSound } from '@/hooks/useGlobalClickSound';

const ChatInterface = () => {
  const { messages, isLoading, sendMessage, clearMessages, setMessages } = useToolhouseAgent();
  const [isGamesOpen, setIsGamesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Enable global click sounds
  useGlobalClickSound();

  // Auto-save chat sessions when conversation changes
  useEffect(() => {
    if (messages.length >= 2) {
      saveChatSession(messages);
    }
  }, [messages]);

  const handleGoHome = () => {
    clearMessages();
  };

  const handleSelectSession = (sessionId: string) => {
    const sessionMessages = getSessionMessages(sessionId);
    if (sessionMessages.length > 0 && setMessages) {
      setMessages(sessionMessages);
    }
  };

  return (
    <div className="flex flex-col h-screen relative overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0 stars-bg pointer-events-none" />

      {/* NEW: Retro Sun */}
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full retro-sun opacity-50 pointer-events-none blur-sm" />

      {/* NEW: 3D Grid Floor */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 perspective-grid pointer-events-none overflow-hidden">
        <div className="absolute -inset-[100%] moving-grid" />
      </div>

      {/* NEW: Floating Shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-shape w-12 h-12 left-[10%] top-[80%]" style={{ animationDelay: '0s' }} />
        <div className="floating-shape w-8 h-8 left-[80%] top-[70%] border-primary text-primary" style={{ animationDelay: '2s', borderRadius: '50%' }} />
        <div className="floating-shape w-16 h-16 left-[20%] top-[60%] border-accent text-accent" style={{ animationDelay: '4s', transform: 'rotate(45deg)' }} />
      </div>

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-full">
        <ChatHeader
          onOpenGames={() => setIsGamesOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onGoHome={handleGoHome}
          showHomeButton={messages.length > 0}
          onSendMessage={sendMessage}
        />
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          onOpenGames={() => setIsGamesOpen(true)}
        />
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>

      {/* Games panel */}
      <GamesPanel isOpen={isGamesOpen} onClose={() => setIsGamesOpen(false)} />

      {/* History panel */}
      <ChatHistoryPanel 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)}
        onSelectSession={handleSelectSession}
      />
    </div>
  );
};

export default ChatInterface;
