import { useState, useRef, useEffect } from 'react';
import { useCharacterChat } from '@/hooks/use-character-chat';
import { Character } from '@shared/schema';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Lightbulb, Save, Loader2 } from 'lucide-react';

interface CharacterChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  onCharacterUpdate: (character: Partial<Character>) => void;
}

interface Suggestion {
  id: number;
  text: string;
  applied: boolean;
}

export function CharacterChatDialog({
  open,
  onOpenChange,
  character,
  onCharacterUpdate
}: CharacterChatDialogProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState<Suggestion | null>(null);
  
  const { 
    messages, 
    connected, 
    loading, 
    sendMessage,
    updateCharacterFromChat
  } = useCharacterChat({ 
    characterId: character.id,
    onCharacterUpdate
  });
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Close suggestions when dialog closes
  useEffect(() => {
    if (!open) {
      setSuggestions([]);
      setActiveSuggestion(null);
    }
  }, [open]);
  
  // Generate initial help suggestions
  useEffect(() => {
    if (open && connected) {
      const initialSuggestions: Suggestion[] = [
        { 
          id: 1, 
          text: `Tell me about your past, ${character.name}`, 
          applied: false 
        },
        { 
          id: 2, 
          text: `What motivates you the most?`, 
          applied: false 
        },
        { 
          id: 3, 
          text: `How would you handle a situation where...`, 
          applied: false 
        },
      ];
      
      setSuggestions(initialSuggestions);
    }
  }, [open, connected, character.name]);
  
  // Handle sending messages
  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    sendMessage(inputValue);
    setInputValue('');
    
    // Generate new suggestions based on the conversation
    // In a real implementation, these would be AI-generated
    const newSuggestions: Suggestion[] = [
      { 
        id: Date.now(), 
        text: "Tell me more about that experience", 
        applied: false 
      },
      { 
        id: Date.now() + 1, 
        text: "How does that affect your current goals?", 
        applied: false 
      },
      { 
        id: Date.now() + 2, 
        text: "Who else was involved in that situation?", 
        applied: false 
      },
    ];
    
    setSuggestions(newSuggestions);
  };
  
  // Handle using a suggestion
  const handleUseSuggestion = (suggestion: Suggestion) => {
    setInputValue(suggestion.text);
    
    // Mark suggestion as applied
    setSuggestions(prev => 
      prev.map(s => s.id === suggestion.id ? { ...s, applied: true } : s)
    );
  };
  
  // Handle applying a suggested character update
  const handleApplySuggestion = () => {
    if (!activeSuggestion) return;
    
    // Update character with suggestion
    // This is just an example - in a real app you'd have specific fields to update
    const update: Partial<Character> = {};
    
    if (activeSuggestion.id === 1) {
      // Example: Update backstory
      update.backstory = character.backstory ? 
        `${character.backstory}\n\n${activeSuggestion.text}` : 
        activeSuggestion.text;
    } else if (activeSuggestion.id === 2) {
      // Example: Update motivations
      update.motivations = character.motivations ? 
        `${character.motivations}\n\n${activeSuggestion.text}` : 
        activeSuggestion.text;
    }
    
    // Update character locally and via WebSocket
    onCharacterUpdate(update);
    updateCharacterFromChat(update);
    
    // Close suggestion
    setActiveSuggestion(null);
    
    toast({
      title: "Character Updated",
      description: "The conversation insight has been added to your character."
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[75%] h-[85vh] flex flex-col p-0 gap-0 border-primary/20 bg-black text-amber-100/90">
        <div className="flex p-4 bg-gradient-to-b from-amber-800/25 to-transparent border-b border-primary/20">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-amber-400">Conversation with {character.name}</h2>
            <p className="text-sm text-amber-100/60">
              Chat directly with your character to develop their personality and story
            </p>
          </div>
          {connected ? (
            <div className="text-xs text-amber-400/80 flex items-center">
              <span className="h-2 w-2 rounded-full bg-amber-400 mr-2"></span>
              Connected
            </div>
          ) : (
            <div className="text-xs text-red-400/80 flex items-center">
              <span className="h-2 w-2 rounded-full bg-red-400 mr-2"></span>
              Disconnected
            </div>
          )}
        </div>
      
        <div className="flex-1 overflow-auto p-4 bg-gradient-to-b from-transparent to-amber-950/10">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-amber-100/60">
              <Lightbulb className="h-12 w-12 text-amber-400/60" />
              <p className="text-center max-w-md">
                Start a conversation with {character.name} to explore their personality, motivations, and backstory. 
                The AI will respond in character based on their traits and history.
              </p>
              <p className="text-sm opacity-75">
                Try asking about their past, their goals, or how they would respond to a situation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user' 
                        ? 'bg-amber-800/40 text-amber-100' 
                        : 'bg-amber-950/60 text-amber-100 border border-amber-800/30'
                    }`}
                  >
                    <div className="text-sm">
                      {message.content}
                    </div>
                    <div className="text-xs text-amber-100/50 mt-1 text-right">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Character update suggestion panel */}
        {activeSuggestion && (
          <div className="p-4 bg-amber-900/20 border-t border-b border-amber-500/30">
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="text-amber-400 text-sm font-medium mb-1">Character Development Insight</h3>
                <p className="text-sm">{activeSuggestion.text}</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  size="sm"
                  className="text-amber-400 border-amber-400 hover:bg-amber-400/20"
                  onClick={handleApplySuggestion}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Apply to Character
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  className="text-amber-100/60 border-amber-100/30 hover:bg-amber-400/10"
                  onClick={() => setActiveSuggestion(null)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Suggestions panel */}
        {suggestions.length > 0 && !activeSuggestion && (
          <div className="p-2 bg-amber-950/60 border-t border-amber-700/30 overflow-x-auto">
            <div className="flex space-x-2">
              {suggestions.map(suggestion => (
                <button
                  key={suggestion.id}
                  className={`px-3 py-1.5 text-sm rounded border ${
                    suggestion.applied 
                      ? 'bg-amber-400/10 border-amber-400/20 text-amber-100/60' 
                      : 'bg-transparent border-amber-600/40 text-amber-100/80 hover:bg-amber-700/20'
                  } whitespace-nowrap`}
                  onClick={() => handleUseSuggestion(suggestion)}
                  disabled={suggestion.applied}
                >
                  {suggestion.text}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Input area */}
        <div className="p-4 border-t border-primary/20 bg-gradient-to-t from-amber-950/20 to-transparent">
          <div className="flex space-x-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Ask ${character.name} a question...`}
              className="flex-1 min-h-[80px] bg-transparent border-amber-700/50 placeholder:text-amber-100/30 text-amber-100"
            />
            <Button 
              onClick={handleSend}
              className="bg-amber-600 hover:bg-amber-700 text-amber-50 self-end"
              disabled={!connected || loading || !inputValue.trim()}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <div className="text-xs text-amber-100/40 mt-2">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}