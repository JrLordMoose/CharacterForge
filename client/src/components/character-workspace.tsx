import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ProgressDashboard } from './progress-dashboard';
import { CharacterTabs } from './character-tabs';
import { Character, CharacterTrait, CharacterRelationship } from '@shared/schema';
import { generateCharacterImage } from '@/lib/openai';
import { useToast } from '@/hooks/use-toast';
import { Wand2 } from 'lucide-react';

interface CharacterWorkspaceProps {
  character: Partial<Character>;
  isNew?: boolean;
  onUpdate: (field: string, value: any) => void;
  onSave: () => void;
  onChatOpen?: () => void;
}

export function CharacterWorkspace({ 
  character, 
  isNew = false,
  onUpdate,
  onSave,
  onChatOpen
}: CharacterWorkspaceProps) {
  const { toast } = useToast();
  const [imageGenerating, setImageGenerating] = useState(false);
  
  const handleGenerateImage = async () => {
    if (!character.name || !character.appearance) {
      toast({
        title: "Missing information",
        description: "Character name and appearance are required to generate an image",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setImageGenerating(true);
      const prompt = `Portrait of ${character.name}, ${character.appearance}`;
      const imageUrl = await generateCharacterImage(prompt);
      
      if (imageUrl) {
        onUpdate('imageUrl', imageUrl);
        toast({
          title: "Image generated",
          description: "Character image has been successfully created"
        });
      }
    } catch (error) {
      toast({
        title: "Image generation failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setImageGenerating(false);
    }
  };
  
  const handleSimulate = () => {
    toast({
      title: "Character Simulation",
      description: "Simulation feature is being prepared..."
    });
  };
  
  const handleEnhanceWithAI = (section: string) => {
    toast({
      title: `Enhancing ${section}`,
      description: "AI enhancement is being processed..."
    });
  };
  
  const handleOutlineEvents = () => {
    toast({
      title: "Outline Key Events",
      description: "Opening event outliner..."
    });
  };
  
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="cinzel text-5xl font-bold text-primary mb-8">CHARACTER<br/>CREATION</h2>
        
        {/* Character Image Section */}
        <div className="mb-8 relative">
          <div className="rounded-lg overflow-hidden relative group">
            {character.imageUrl ? (
              <img 
                src={character.imageUrl} 
                alt="Character portrait" 
                className="w-96 h-96 object-cover rounded-lg" 
              />
            ) : (
              <div className="w-96 h-96 bg-secondary flex items-center justify-center rounded-lg">
                <span className="text-muted-foreground">No image available</span>
              </div>
            )}
            
            {character.imageUrl && (
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleGenerateImage}
                >
                  Change Image
                </Button>
              </div>
            )}
          </div>
          
          <Button
            disabled={imageGenerating}
            onClick={handleGenerateImage}
            variant="outline"
            className="mt-4 py-2 px-4 bg-secondary border border-primary text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition flex items-center space-x-2"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            <span>{imageGenerating ? 'Generating...' : 'Generate character image'}</span>
          </Button>
        </div>
        
        {/* Character Details Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6 col-span-1">
            <div>
              <label className="block text-muted-foreground mb-2">Name:</label>
              <Input
                type="text"
                value={character.name || ''}
                onChange={(e) => onUpdate('name', e.target.value)}
                className="w-full bg-secondary border-border rounded-md px-4 py-2 focus:border-primary focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-muted-foreground mb-2">Role:</label>
              <Input
                type="text"
                value={character.role || ''}
                onChange={(e) => onUpdate('role', e.target.value)}
                className="w-full bg-secondary border-border rounded-md px-4 py-2 focus:border-primary focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-muted-foreground mb-2">Appearance:</label>
              <Textarea
                value={character.appearance || ''}
                onChange={(e) => onUpdate('appearance', e.target.value)}
                rows={5}
                className="w-full bg-secondary border-border rounded-md px-4 py-2 focus:border-primary focus:outline-none"
              />
            </div>
            
            <div className="py-2 px-4 bg-secondary rounded-md border border-primary">
              <div className="flex items-center">
                <span className="text-accent mr-2">💡</span>
                <p className="text-muted-foreground">Tip: Use /simulate to test reactions</p>
              </div>
            </div>
          </div>
          
          <ProgressDashboard 
            characterId={character.id?.toString()}
            progress={character.progress || 0}
            description={character.description}
            onOutlineClick={handleOutlineEvents}
          />
        </div>
        
        <CharacterTabs
          characterId={character.id?.toString()}
          traits={character.traits as CharacterTrait[] || []}
          motivations={character.motivations}
          conflicts={character.conflicts}
          backstory={character.backstory}
          relationships={character.relationships as CharacterRelationship[] || []}
          arc={character.arc}
          voice={character.voice}
          onUpdate={onUpdate}
          onSimulate={handleSimulate}
          onEnhance={handleEnhanceWithAI}
        />
        
        <div className="mt-8 flex justify-end">
          <Button 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onSave}
          >
            {isNew ? 'Create Character' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
