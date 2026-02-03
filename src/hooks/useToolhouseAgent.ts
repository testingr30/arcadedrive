import { useState, useCallback, useRef } from 'react';
import { Message } from '@/components/chat/MessageBubble';

const AGENT_URL = 'https://agents.toolhouse.ai/4bf3221e-da92-42c9-89cd-ffc336220428';

export const useToolhouseAgent = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const runIdRef = useRef<string | null>(null);

  const sendMessage = useCallback(async (userMessage: string) => {
    // Add user message
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Create placeholder for assistant message
    const assistantMsgId = crypto.randomUUID();
    let assistantContent = '';

    try {
      // Determine endpoint based on whether we have a runId
      const url = runIdRef.current
        ? `${AGENT_URL}/${runIdRef.current}`
        : AGENT_URL;

      const method = runIdRef.current ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Save the run ID from headers
      const newRunId = response.headers.get('X-Toolhouse-Run-ID');
      if (newRunId) {
        runIdRef.current = newRunId;
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      // Add initial assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantContent += chunk;

        // Update the assistant message with new content
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: assistantContent }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: `❌ **Error**: Failed to communicate with the AI agent. Please try again.\n\n\`${error instanceof Error ? error.message : 'Unknown error'}\``,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    runIdRef.current = null;
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    hasRunId: !!runIdRef.current,
  };
};
