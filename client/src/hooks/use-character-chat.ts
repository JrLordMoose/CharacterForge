import { useState, useEffect, useCallback, useRef } from 'react';
import { Character } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  sender: 'user' | 'character';
  content: string;
  timestamp: string;
}

interface UseCharacterChatOptions {
  characterId: string | number;
  onCharacterUpdate?: (character: Character) => void;
}

export function useCharacterChat({ characterId, onCharacterUpdate }: UseCharacterChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  // Connect to WebSocket
  useEffect(() => {
    if (!characterId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.addEventListener('open', () => {
      console.log('WebSocket connected');
      setConnected(true);
      
      // Join character session
      socket.send(JSON.stringify({
        type: 'join',
        characterId: characterId.toString()
      }));
    });

    socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chat-response') {
          setLoading(false);
          // Add both user message and AI response to chat
          setMessages(prev => [
            ...prev,
            {
              id: `user-${Date.now()}`,
              sender: 'user',
              content: data.originalMessage,
              timestamp: data.timestamp
            },
            {
              id: `character-${Date.now() + 1}`,
              sender: 'character',
              content: data.response,
              timestamp: data.timestamp
            }
          ]);
        } else if (data.type === 'character-updated' && onCharacterUpdate) {
          onCharacterUpdate(data.character);
          toast({
            title: "Character Updated",
            description: "Character details have been updated from conversation"
          });
        } else if (data.type === 'error') {
          setLoading(false);
          toast({
            title: "Error",
            description: data.message,
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    socket.addEventListener('close', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to chat service",
        variant: "destructive"
      });
      setConnected(false);
    });

    return () => {
      socket.close();
    };
  }, [characterId, toast, onCharacterUpdate]);

  // Send message to character
  const sendMessage = useCallback((message: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      toast({
        title: "Not Connected",
        description: "Unable to send message, not connected to server",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    socketRef.current.send(JSON.stringify({
      type: 'chat',
      characterId,
      message
    }));
  }, [characterId, toast]);

  // Update character from conversation
  const updateCharacterFromChat = useCallback((data: Partial<Character>) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      toast({
        title: "Not Connected",
        description: "Unable to update character, not connected to server",
        variant: "destructive"
      });
      return;
    }

    socketRef.current.send(JSON.stringify({
      type: 'update',
      characterId,
      characterData: data
    }));
  }, [characterId, toast]);

  return {
    messages,
    connected,
    loading,
    sendMessage,
    updateCharacterFromChat
  };
}