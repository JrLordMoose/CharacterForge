import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ProgressDashboard } from './progress-dashboard';
import { CharacterTabs } from './character-tabs';
import { Character, CharacterTrait, CharacterRelationship } from '@shared/schema';
import { 
  generateCharacterImage, 
  generateCharacterTraits, 
  enhanceCharacterBackstory,
  generateCharacterVoice,
  generateCharacterRelationships,
  generateCharacterArc,
  simulateCharacterResponse
} from '@/lib/openai';
import { useToast } from '@/hooks/use-toast';
import { Wand2, MessageSquare, Sparkles, UserIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { BasicInput } from '@/components/ui/basic-input';

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
  
  const [simulateDialogOpen, setSimulateDialogOpen] = useState(false);
  const [simulationScenario, setSimulationScenario] = useState('');
  const [simulationResult, setSimulationResult] = useState('');
  const [simulatingResponse, setSimulatingResponse] = useState(false);
  
  const handleSimulate = async (scenario?: string) => {
    if (!character.name) {
      toast({
        title: "Character name required",
        description: "Please provide a character name first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSimulatingResponse(true);
      const scenarioToUse = scenario || simulationScenario || "meeting a stranger at a coffee shop";
      setSimulationScenario(scenarioToUse);
      
      toast({
        title: "Simulating character response",
        description: `Generating ${character.name}'s response to the scenario...`
      });
      
      const response = await simulateCharacterResponse(character, scenarioToUse);
      setSimulationResult(response);
      setSimulateDialogOpen(true);
    } catch (error) {
      toast({
        title: "Simulation failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setSimulatingResponse(false);
    }
  };
  
  const [generatingDetails, setGeneratingDetails] = useState(false);
  
  const handleEnhanceWithAI = async (section: string) => {
    if (!character.name) {
      toast({
        title: "Character name required",
        description: "Please provide a character name first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      toast({
        title: `Enhancing ${section}`,
        description: "AI enhancement is being processed..."
      });
      
      switch(section) {
        case 'psychology':
          const traits = await generateCharacterTraits(character);
          onUpdate('traits', traits);
          break;
        case 'backstory':
          const enhancedBackstory = await enhanceCharacterBackstory(character.backstory || '');
          onUpdate('backstory', enhancedBackstory);
          break;
        case 'voice':
          const voice = await generateCharacterVoice(character);
          onUpdate('voice', voice);
          break;
        case 'relationships':
          const relationships = await generateCharacterRelationships(character);
          onUpdate('relationships', relationships);
          break;
        case 'arc':
          const arc = await generateCharacterArc(character);
          onUpdate('arc', arc);
          break;
      }
      
      toast({
        title: `${section} enhanced`,
        description: `Your character's ${section} has been enhanced with AI`
      });
    } catch (error) {
      toast({
        title: "Enhancement failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  const handleGenerateFullCharacter = async () => {
    if (!character.name) {
      toast({
        title: "Character name required",
        description: "Please provide a character name first before generating details",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setGeneratingDetails(true);
      
      // Starting with appearance and role
      if (!character.appearance) {
        onUpdate('appearance', `${character.name} is a striking individual with a commanding presence. They have distinctive features that reflect their background and personality.`);
      }
      
      if (!character.role) {
        onUpdate('role', 'Protagonist');
      }
      
      // Generate each section in sequence
      await handleEnhanceWithAI('psychology');
      await handleEnhanceWithAI('backstory');
      await handleEnhanceWithAI('relationships');
      await handleEnhanceWithAI('arc');
      await handleEnhanceWithAI('voice');
      
      // Update progress
      onUpdate('progress', 60);
      
      toast({
        title: "Character details generated",
        description: "Your character has been fleshed out with AI. Feel free to edit any details."
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setGeneratingDetails(false);
    }
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
              <BasicInput
                type="text"
                value={character.name || ''}
                onChange={(value) => onUpdate('name', value)}
                className="w-full bg-secondary border-border rounded-md px-4 py-2 focus:border-primary focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-muted-foreground mb-2">Role:</label>
              <BasicInput
                type="text"
                value={character.role || ''}
                onChange={(value) => onUpdate('role', value)}
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
            
            <Button
              disabled={generatingDetails}
              onClick={handleGenerateFullCharacter}
              className="w-full bg-amber-900/40 border border-amber-600/50 text-amber-400 hover:bg-amber-900/60 hover:text-amber-300 transition flex items-center justify-center space-x-2 py-3"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              <span>{generatingDetails ? 'Generating...' : 'Auto-Generate Character Details'}</span>
            </Button>
          </div>
          
          <ProgressDashboard 
            characterId={character.id?.toString()}
            progress={character.progress || 0}
            description={character.description || ""}
            onOutlineClick={handleOutlineEvents}
          />
        </div>
        
        <CharacterTabs
          characterId={character.id?.toString()}
          traits={character.traits as CharacterTrait[] || []}
          motivations={character.motivations || ""}
          conflicts={character.conflicts || ""}
          backstory={character.backstory || ""}
          relationships={character.relationships as CharacterRelationship[] || []}
          arc={character.arc || ""}
          voice={character.voice || ""}
          onUpdate={onUpdate}
          onSimulate={handleSimulate}
          onEnhance={handleEnhanceWithAI}
        />
        
        <div className="mt-8 flex justify-between items-center">
          {!isNew && onChatOpen && (
            <Button 
              variant="outline" 
              className="bg-black/20 border-amber-600/50 text-amber-400 hover:bg-amber-900/30 hover:text-amber-300"
              onClick={onChatOpen}
            >
              <span className="mr-2">Chat with {character.name}</span>
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
          
          <div className="flex gap-4">
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={onSave}
            >
              {isNew ? 'Create Character' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
