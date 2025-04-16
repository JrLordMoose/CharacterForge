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
  onCharacterUpdate?: (field: string, value: any) => void;
}

export function useCharacterChat({ characterId, onCharacterUpdate }: UseCharacterChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  // Connect to WebSocket
  const setupConnection = useCallback(() => {
    // Clean up existing connection if any
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    if (!characterId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
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
            // Handle individual field updates from the updated character
            const updatedChar = data.character;
            if (updatedChar) {
              // Update each changed field individually
              Object.entries(updatedChar).forEach(([field, value]) => {
                if (field !== 'id' && value !== undefined) {
                  onCharacterUpdate(field, value);
                }
              });
            }
            
            // Just show a console message instead of a toast to reduce UI spam
            console.log("Character details updated from conversation");
          } else if (data.type === 'error') {
            setLoading(false);
            // We'll only show serious errors as toasts
            console.error("Chat error:", data.message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      socket.addEventListener('close', (event) => {
        console.log('WebSocket disconnected, code:', event.code);
        setConnected(false);
        
        // Only show toast for abnormal closures, not intentional ones
        if (event.code !== 1000 && event.code !== 1001) {
          console.warn("Connection closed unexpectedly");
        }
      });

      socket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
      });
    } catch (e) {
      console.error("Failed to create WebSocket:", e);
    }
  }, [characterId, onCharacterUpdate]);

  // Connect to WebSocket when component mounts or characterId changes
  useEffect(() => {
    setupConnection();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [characterId, setupConnection]);

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