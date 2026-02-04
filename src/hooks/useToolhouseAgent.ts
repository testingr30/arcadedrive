import { useState, useCallback, useRef } from 'react';
import { Message } from '@/components/chat/MessageBubble';

const AGENT_URL = 'https://agents.toolhouse.ai/4bf3221e-da92-42c9-89cd-ffc336220428';

export interface StructuredContent {
  url?: string;
  integration?: string;
}

// Parse response to detect structured content (auth URLs, etc.)
const parseStructuredContent = (content: string): { text: string; structured?: StructuredContent } => {
  // Try to find JSON with structuredContent
  const jsonMatch = content.match(/\{[\s\S]*"structuredContent"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.structuredContent?.url && parsed.structuredContent?.integration) {
        // Remove the JSON from the display text
        const text = content.replace(jsonMatch[0], '').trim();
        return {
          text: text || 'Authentication required to continue.',
          structured: parsed.structuredContent,
        };
      }
    } catch {
      // Not valid JSON, continue
    }
  }

  // Check for authentication patterns in text
  const authPatterns = [
    /Authentication required/i,
    /need.*permission.*access/i,
    /connect.*Google.*Drive/i,
    /authorize.*access/i,
  ];

  const needsAuth = authPatterns.some((pattern) => pattern.test(content));
  
  // Look for URL patterns that might be auth links
  const urlMatch = content.match(/https:\/\/api\.toolhouse\.ai\/public\/integrations[^\s"')]+/);
  if (needsAuth && urlMatch) {
    return {
      text: content.replace(urlMatch[0], '').trim(),
      structured: {
        url: urlMatch[0],
        integration: 'googledrive',
      },
    };
  }

  return { text: content };
};

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

        // Parse for structured content
        const parsed = parseStructuredContent(assistantContent);

        // Update the assistant message with new content
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { 
                  ...msg, 
                  content: parsed.text,
                  structuredContent: parsed.structured,
                }
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
          content: `⚠️ **Connection Error**: Failed to communicate with the AI agent. Please try again.\n\n\`${error instanceof Error ? error.message : 'Unknown error'}\``,
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
