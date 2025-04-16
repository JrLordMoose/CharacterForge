import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Sidebar } from '@/components/sidebar';
import { CommandInterface } from '@/components/command-interface';
import { useCharacter } from '@/context/character-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [, navigate] = useLocation();
  const { characters, loading } = useCharacter();
  const { toast } = useToast();
  
  const processCommand = (command: string, params?: string) => {
    switch (command) {
      case '/generate':
      case '/new':
        navigate('/character/new');
        break;
      case '/save':
        toast({
          title: "Nothing to save",
          description: "Please open a character editor first"
        });
        break;
      case '/help':
      case 'help':
        toast({
          title: "Available Commands",
          description: "/generate - Create a new character\n/open [id] - Open character editor\n/save - Save current character"
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
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            <h1 className="cinzel text-4xl font-bold text-primary mb-8">5D Character Creator</h1>
            
            <div className="mb-8">
              <Link href="/character/new">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Character
                </Button>
              </Link>
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">Your Characters</h2>
            
            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading characters...</p>
              </div>
            ) : characters.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border rounded-lg">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No characters yet</h3>
                <p className="text-muted-foreground mb-4">Start creating your first character now</p>
                <Link href="/character/new">
                  <Button variant="outline" className="mt-2">
                    Create Character
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {characters.map((character) => (
                  <Link key={character.id} href={`/character/${character.id}`}>
                    <Card className="cursor-pointer hover:border-primary transition-colors">
                      <CardContent className="p-0">
                        <div className="h-40 bg-secondary relative">
                          {character.imageUrl ? (
                            <img 
                              src={character.imageUrl} 
                              alt={character.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                            <div className="flex justify-between items-end">
                              <div>
                                <h3 className="text-white font-bold">{character.name}</h3>
                                <p className="text-gray-300 text-sm">{character.role}</p>
                              </div>
                              <div className="bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs">
                                {character.progress}%
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-muted-foreground text-sm line-clamp-3">
                            {character.description || character.appearance || "No description available"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <CommandInterface onCommand={processCommand} />
      </main>
      
      {/* Mobile Navigation (visible on small screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary border-t border-border p-4">
        <div className="flex justify-around">
          <Link href="/">
            <button className="text-muted-foreground hover:text-primary">
              <i className="fas fa-home"></i>
            </button>
          </Link>
          <Link href="/character/new">
            <button className="text-muted-foreground hover:text-primary">
              <i className="fas fa-user"></i>
            </button>
          </Link>
          <button className="text-muted-foreground hover:text-primary">
            <i className="fas fa-folder"></i>
          </button>
          <button className="text-muted-foreground hover:text-primary">
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
