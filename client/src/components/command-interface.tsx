import { useState, KeyboardEvent } from 'react';
import { useCharacter } from '@/context/character-context';
import { useToast } from '@/hooks/use-toast';

interface CommandInterfaceProps {
  onCommand: (command: string, params?: string) => void;
}

export function CommandInterface({ onCommand }: CommandInterfaceProps) {
  const [input, setInput] = useState('');
  const { toast } = useToast();
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      processCommand(input);
    }
  };
  
  const processCommand = (commandText: string) => {
    if (!commandText.trim()) return;
    
    const parts = commandText.trim().split(' ');
    let command = parts[0];
    if (!command.startsWith('/') && command !== 'help') {
      command = `/${command}`;
    }
    
    const params = parts.slice(1).join(' ');
    
    try {
      onCommand(command, params);
      setInput('');
    } catch (error) {
      toast({
        title: "Command Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="border-t border-border p-4 bg-secondary flex items-center">
      <div className="flex-1 flex items-center space-x-2 font-mono">
        <span className="text-accent">/</span>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type command (e.g. /generate, /simulate, /save)" 
          className="flex-1 bg-transparent border-none focus:outline-none text-foreground"
        />
      </div>
      <div className="hidden md:flex items-center space-x-4 text-muted-foreground">
        <span>/generate</span>
        <span>/back</span>
        <span>/save</span>
        <span>help</span>
      </div>
    </div>
  );
}
