import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { useToolhouseAgent } from '@/hooks/useToolhouseAgent';

const ChatInterface = () => {
  const { messages, isLoading, sendMessage } = useToolhouseAgent();

  return (
    <div className="flex flex-col h-screen relative overflow-hidden">
      {/* Animated stars background */}
      <div className="absolute inset-0 stars-bg pointer-events-none" />
      
      {/* Grid overlay for extra arcade feel */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      
      {/* Scanline effect overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none" />

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-full">
        <ChatHeader />
        <MessageList messages={messages} isLoading={isLoading} onSendMessage={sendMessage} />
        <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatInterface;
