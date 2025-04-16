import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { Sidebar } from '@/components/sidebar';
import { CommandInterface } from '@/components/command-interface';
import { CharacterWorkspace } from '@/components/character-workspace';
import { CharacterChatDialog } from '@/components/character-chat-dialog';
import { NotionExportDialog } from '@/components/notion-export-dialog';
import { useCharacter } from '@/context/character-context';
import { Character } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function CharacterEditor() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const isNew = id === 'new';
  const { getCharacter, createCharacter, updateCharacter } = useCharacter();
  const { toast } = useToast();
  
  const [character, setCharacter] = useState<Partial<Character>>({
    name: '',
    role: '',
    appearance: '',
    description: '',
    traits: [],
    progress: 0,
    folder: 'My Novel',
    category: 'Uncategorized',
  });
  
  const [simulateDialogOpen, setSimulateDialogOpen] = useState(false);
  const [simulationScenario, setSimulationScenario] = useState('');
  const [simulationResult, setSimulationResult] = useState('');
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [notionExportOpen, setNotionExportOpen] = useState(false);
  
  useEffect(() => {
    if (!isNew) {
      const existingCharacter = getCharacter(id);
      if (existingCharacter) {
        setCharacter(existingCharacter);
      } else {
        toast({
          title: "Character not found",
          description: "The requested character could not be found",
          variant: "destructive"
        });
        navigate('/');
      }
    }
  }, [id, isNew, getCharacter, navigate, toast]);
  
  const handleUpdate = (field: string, value: any) => {
    setCharacter(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSave = async () => {
    try {
      if (!character.name || !character.role) {
        toast({
          title: "Missing required fields",
          description: "Please provide at least a name and role for the character",
          variant: "destructive"
        });
        return;
      }
      
      if (isNew) {
        await createCharacter(character);
        navigate('/');
      } else {
        await updateCharacter(id, character);
        toast({
          title: "Character saved",
          description: "Your changes have been saved successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error saving character",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  const processCommand = (command: string, params?: string) => {
    switch (command) {
      case '/save':
        handleSave();
        break;
      case '/back':
        navigate('/');
        break;
      case '/generate':
        if (params) {
          handleUpdate('description', params);
          toast({
            title: "Description generated",
            description: "Character description has been updated"
          });
        } else {
          toast({
            title: "Missing parameters",
            description: "Please provide a description to generate"
          });
        }
        break;
      case '/simulate':
        if (params) {
          setSimulationScenario(params);
          setSimulateDialogOpen(true);
          // This would connect to AI simulation in a real implementation
          setSimulationResult(`${character.name} would likely respond with caution initially, analyzing the situation before making any commitments. Given their background, they might express skepticism about ${params} but would be intrigued enough to investigate further.`);
        } else {
          toast({
            title: "Missing scenario",
            description: "Please provide a scenario to simulate"
          });
        }
        break;
      case '/chat':
        if (!isNew) {
          setChatDialogOpen(true);
        } else {
          toast({
            title: "Cannot chat yet",
            description: "Please save the character first before chatting"
          });
        }
        break;
      case '/export':
      case '/notion':
        if (!isNew) {
          setNotionExportOpen(true);
        } else {
          toast({
            title: "Cannot export yet",
            description: "Please save the character first before exporting to Notion"
          });
        }
        break;
      case '/help':
      case 'help':
        toast({
          title: "Available Commands",
          description: "/save - Save current character\n/back - Return to home\n/generate [text] - Generate description\n/simulate [scenario] - Simulate character response\n/chat - Open character chat dialog\n/export - Export character to Notion"
        });
        break;
      default:
        toast({
          title: "Unknown command",
          description: `Command "${command}" not recognized. Type /help for available commands.`,
          variant: "destructive"
        });
    }
  };
  
  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <CharacterWorkspace 
          character={character}
          isNew={isNew}
          onUpdate={handleUpdate}
          onSave={handleSave}
          onChatOpen={() => setChatDialogOpen(true)}
        />
        
        <CommandInterface onCommand={processCommand} />
      </main>
      
      {/* Mobile Navigation (visible on small screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary border-t border-border p-4">
        <div className="flex justify-around">
          <button 
            className="text-muted-foreground hover:text-primary"
            onClick={() => navigate('/')}
          >
            <i className="fas fa-home"></i>
          </button>
          <button className="text-primary">
            <i className="fas fa-user"></i>
          </button>
          <button className="text-muted-foreground hover:text-primary">
            <i className="fas fa-folder"></i>
          </button>
          <button className="text-muted-foreground hover:text-primary">
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </div>
      
      {/* Simulation Dialog */}
      <Dialog open={simulateDialogOpen} onOpenChange={setSimulateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Character Simulation</DialogTitle>
            <DialogDescription>
              How {character.name} would respond to: {simulationScenario}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 bg-secondary/50 rounded-md border border-border">
            <p>{simulationResult}</p>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Character Chat Dialog */}
      {!isNew && (
        <CharacterChatDialog
          open={chatDialogOpen}
          onOpenChange={setChatDialogOpen}
          character={character as Character}
          onCharacterUpdate={handleUpdate}
        />
      )}
      
      {/* Notion Export Dialog */}
      {!isNew && (
        <NotionExportDialog
          open={notionExportOpen}
          onOpenChange={setNotionExportOpen}
          character={character as Character}
        />
      )}
    </div>
  );
}
