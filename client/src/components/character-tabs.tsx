import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCharacter } from '@/context/character-context';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type Tab = 'psychology' | 'backstory' | 'relationships' | 'arc' | 'voice';

interface CharacterTabsProps {
  characterId?: string;
  traits: Array<{name: string; value: number; description?: string}>;
  motivations?: string;
  conflicts?: string;
  backstory?: string;
  relationships?: Array<{name: string; relation: string; description?: string; strength?: number}>;
  arc?: string;
  voice?: string;
  onUpdate: (field: string, value: any) => void;
  onSimulate: () => void;
  onEnhance: (section: string) => void;
}

export function CharacterTabs({
  characterId,
  traits = [],
  motivations,
  conflicts,
  backstory,
  relationships = [],
  arc,
  voice,
  onUpdate,
  onSimulate,
  onEnhance
}: CharacterTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('psychology');
  const { toast } = useToast();
  
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };
  
  return (
    <div className="mt-10">
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          <button 
            onClick={() => handleTabChange('psychology')}
            className={`py-4 px-1 border-b-2 font-medium ${
              activeTab === 'psychology' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Psychology
          </button>
          <button 
            onClick={() => handleTabChange('backstory')}
            className={`py-4 px-1 border-b-2 font-medium ${
              activeTab === 'backstory' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Backstory
          </button>
          <button 
            onClick={() => handleTabChange('relationships')}
            className={`py-4 px-1 border-b-2 font-medium ${
              activeTab === 'relationships' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Relationships
          </button>
          <button 
            onClick={() => handleTabChange('arc')}
            className={`py-4 px-1 border-b-2 font-medium ${
              activeTab === 'arc' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Arc
          </button>
          <button 
            onClick={() => handleTabChange('voice')}
            className={`py-4 px-1 border-b-2 font-medium ${
              activeTab === 'voice' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Voice
          </button>
        </nav>
      </div>
      
      <div className="py-6">
        {activeTab === 'psychology' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl mb-4">Traits & Motivations</h3>
                
                {traits.map((trait, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-muted-foreground">{trait.name}</label>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <button 
                            key={i}
                            className={`mr-1 focus:outline-none`}
                            onClick={() => {
                              const newTraits = [...traits];
                              newTraits[index] = {...trait, value: i + 1};
                              onUpdate('traits', newTraits);
                            }}
                          >
                            <span className={`fa fa-circle text-xs ${i < trait.value ? 'text-primary' : 'text-muted-foreground'}`}></span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <Textarea 
                      value={trait.description || ''} 
                      onChange={(e) => {
                        const newTraits = [...traits];
                        newTraits[index] = {...trait, description: e.target.value};
                        onUpdate('traits', newTraits);
                      }}
                      className="text-sm h-20 bg-secondary border-border text-muted-foreground"
                    />
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    onUpdate('traits', [...traits, {name: 'New Trait', value: 3}]);
                  }}
                >
                  Add Trait
                </Button>
              </div>
              
              <div>
                <h3 className="text-xl mb-4">Core Motivations</h3>
                <Textarea 
                  rows={5} 
                  value={motivations || ''}
                  onChange={(e) => onUpdate('motivations', e.target.value)}
                  className="w-full bg-secondary border-border rounded-md px-4 py-2 focus:border-primary focus:outline-none text-muted-foreground"
                />
                
                <h3 className="text-xl mb-4 mt-6">Internal Conflicts</h3>
                <Textarea 
                  rows={5} 
                  value={conflicts || ''}
                  onChange={(e) => onUpdate('conflicts', e.target.value)}
                  className="w-full bg-secondary border-border rounded-md px-4 py-2 focus:border-primary focus:outline-none text-muted-foreground"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                className="mr-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={onSimulate}
              >
                Run Simulation
              </Button>
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => onEnhance('psychology')}
              >
                Enhance with AI
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'backstory' && (
          <div>
            <h3 className="text-xl mb-4">Character Backstory</h3>
            <Textarea 
              rows={10} 
              value={backstory || ''}
              onChange={(e) => onUpdate('backstory', e.target.value)}
              className="w-full bg-secondary border-border rounded-md px-4 py-2 focus:border-primary focus:outline-none text-muted-foreground"
            />
            <Button 
              className="mt-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              variant="outline"
              onClick={() => onEnhance('backstory')}
            >
              Enhance Backstory with AI
            </Button>
          </div>
        )}

        {activeTab === 'relationships' && (
          <div>
            <h3 className="text-xl mb-4">Character Relationships</h3>
            {relationships.map((relationship, index) => (
              <div key={index} className="mb-6 p-4 border border-border rounded-md">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Name</label>
                    <input 
                      type="text" 
                      value={relationship.name}
                      onChange={(e) => {
                        const newRelationships = [...relationships];
                        newRelationships[index] = {...relationship, name: e.target.value};
                        onUpdate('relationships', newRelationships);
                      }}
                      className="w-full bg-secondary border border-border rounded-md px-3 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Relation</label>
                    <input 
                      type="text" 
                      value={relationship.relation}
                      onChange={(e) => {
                        const newRelationships = [...relationships];
                        newRelationships[index] = {...relationship, relation: e.target.value};
                        onUpdate('relationships', newRelationships);
                      }}
                      className="w-full bg-secondary border border-border rounded-md px-3 py-1.5"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-sm text-muted-foreground mb-1 block">Description</label>
                  <Textarea 
                    value={relationship.description || ''}
                    onChange={(e) => {
                      const newRelationships = [...relationships];
                      newRelationships[index] = {...relationship, description: e.target.value};
                      onUpdate('relationships', newRelationships);
                    }}
                    className="w-full bg-secondary border-border"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground mr-2">Relationship Strength:</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <button 
                          key={i}
                          className={`mr-1 focus:outline-none`}
                          onClick={() => {
                            const newRelationships = [...relationships];
                            newRelationships[index] = {...relationship, strength: i + 1};
                            onUpdate('relationships', newRelationships);
                          }}
                        >
                          <span className={`fa fa-circle text-xs ${i < (relationship.strength || 0) ? 'text-primary' : 'text-muted-foreground'}`}></span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive hover:text-destructive/90"
                    onClick={() => {
                      const newRelationships = [...relationships];
                      newRelationships.splice(index, 1);
                      onUpdate('relationships', newRelationships);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  onUpdate('relationships', [...relationships, {name: '', relation: '', description: ''}]);
                }}
              >
                Add Relationship
              </Button>
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => onEnhance('relationships')}
              >
                Generate Relationships with AI
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'arc' && (
          <div>
            <h3 className="text-xl mb-4">Character Arc</h3>
            <Textarea 
              rows={10} 
              value={arc || ''}
              onChange={(e) => onUpdate('arc', e.target.value)}
              className="w-full bg-secondary border-border rounded-md px-4 py-2 focus:border-primary focus:outline-none text-muted-foreground"
            />
            <Button 
              className="mt-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              variant="outline"
              onClick={() => onEnhance('arc')}
            >
              Develop Arc with AI
            </Button>
          </div>
        )}

        {activeTab === 'voice' && (
          <div>
            <h3 className="text-xl mb-4">Character Voice</h3>
            <Textarea 
              rows={10} 
              value={voice || ''}
              onChange={(e) => onUpdate('voice', e.target.value)}
              className="w-full bg-secondary border-border rounded-md px-4 py-2 focus:border-primary focus:outline-none text-muted-foreground"
            />
            <div className="mt-4 flex space-x-4">
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={() => onEnhance('voice')}
              >
                Generate Voice Pattern
              </Button>
              <Button 
                variant="outline"
                onClick={() => onSimulate()}
              >
                Test in Dialogue
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
