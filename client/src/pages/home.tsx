import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Sidebar } from '@/components/sidebar';
import { CommandInterface } from '@/components/command-interface';
import { useCharacter } from '@/context/character-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, User, Book, Feather, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [, navigate] = useLocation();
  const { characters, loading } = useCharacter();
  const { toast } = useToast();
  const [showLogin, setShowLogin] = useState(false);
  
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
      case '/login':
        setShowLogin(true);
        break;
      case '/help':
      case 'help':
        toast({
          title: "Available Commands",
          description: "/generate - Create a new character\n/open [id] - Open character editor\n/save - Save current character\n/login - Toggle login form"
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
  
  // Determine what content to show
  const renderContent = () => {
    // Show login form
    if (showLogin) {
      return (
        <div className="w-full max-w-md mx-auto bg-card border border-border rounded-lg p-8 shadow-lg animate-fade-in">
          <h2 className="cinzel text-xl text-primary font-bold mb-4">Sign In</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="username">Username</label>
              <input 
                id="username"
                type="text" 
                className="w-full bg-secondary border border-border rounded p-2 text-foreground focus:border-primary"
                placeholder="Your username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
              <input 
                id="password"
                type="password" 
                className="w-full bg-secondary border border-border rounded p-2 text-foreground focus:border-primary"
                placeholder="Your password"
              />
            </div>
            <div className="pt-2 flex justify-between items-center">
              <button 
                type="button" 
                className="text-sm text-muted-foreground hover:text-primary"
                onClick={() => setShowLogin(false)}
              >
                Back to home
              </button>
              <button 
                type="button" 
                className="cta-button"
                onClick={() => {
                  toast({
                    title: "Login feature",
                    description: "This is just a UI demo - login functionality is coming soon!"
                  });
                  setShowLogin(false);
                }}
              >
                Sign In <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      );
    }
    
    // Show existing characters when we have characters loaded
    if (!loading && characters.length > 0) {
      return (
        <div className="animate-fade-in pt-8">
          <h2 className="text-2xl font-playfair text-primary mb-4">Your Characters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <Link key={character.id} href={`/character/${character.id}`}>
                <Card className="cursor-pointer hover:border-primary transition-colors overflow-hidden bg-card border border-border/50 shadow-md">
                  <CardContent className="p-0">
                    <div className="h-44 bg-secondary relative">
                      {character.imageUrl ? (
                        <img 
                          src={character.imageUrl} 
                          alt={character.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-16 w-16 text-muted-foreground opacity-30" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
                        <div className="flex justify-between items-end">
                          <div>
                            <h3 className="text-white font-bold cinzel text-lg">{character.name}</h3>
                            <p className="text-gray-300 text-sm font-spectral">{character.role}</p>
                          </div>
                          <div className="bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs">
                            {character.progress}%
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-muted-foreground text-sm line-clamp-3 font-spectral">
                        {character.description || character.appearance || "No description available"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            <Link href="/character/new">
              <Card className="cursor-pointer hover:border-primary transition-colors bg-card border border-border/50 border-dashed h-full min-h-[280px] flex items-center justify-center shadow-md">
                <CardContent className="text-center p-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
                    <PlusCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium cinzel text-primary">Create New Character</h3>
                  <p className="text-muted-foreground mt-2 font-spectral">Start building a new story</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      );
    }
    
    // Show landing page / empty state
    return (
      <div className="flex flex-col items-center justify-center">
        <h1 className="cinematic-title text-center animate-fade-in">
          5D Character<br />Creator
        </h1>
        
        <p className="cinematic-subtitle text-center animate-fade-in-delay-1">
          Use AI to create realistic characters for your stories, generate character images, and track your progress with ease.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 mt-8 animate-fade-in-delay-2">
          <Link href="/character/new">
            <button className="cta-button">
              <Feather size={18} />
              Create Character
            </button>
          </Link>
          <button 
            className="cta-button"
            onClick={() => setShowLogin(true)}
          >
            <User size={18} />
            Sign In
          </button>
          <a 
            href="#" 
            className="cta-button" 
            onClick={(e) => {
              e.preventDefault();
              toast({
                title: "Coming Soon",
                description: "The Notion integration is already available! Try exporting a character to Notion after creating one."
              });
            }}
          >
            <Book size={18} />
            Learn More
          </a>
        </div>
        
        {/* Loading state */}
        {loading && (
          <div className="mt-12 text-center animate-fade-in">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground font-spectral">Retrieving your characters...</p>
          </div>
        )}
        
        {/* Empty state (if not loading and no characters) */}
        {!loading && characters.length === 0 && (
          <div className="mt-12 max-w-lg mx-auto bg-card/50 border border-border rounded-lg p-8 text-center animate-fade-in">
            <User className="h-16 w-16 mx-auto text-primary mb-4 opacity-50" />
            <h3 className="text-xl font-medium cinzel text-primary">Begin Your Journey</h3>
            <p className="text-muted-foreground mb-6 font-spectral">
              Start by creating your first character and bring your stories to life with AI-powered tools.
            </p>
            <Link href="/character/new">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cinzel">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Character
              </Button>
            </Link>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="h-screen flex flex-col overflow-hidden">      
      <main className="flex-1 flex flex-col overflow-hidden cinematic-bg">
        <div className="flex-1 overflow-auto p-6 relative z-10">
          <div className="container mx-auto py-8 flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
            {renderContent()}
          </div>
        </div>
        
        <CommandInterface onCommand={processCommand} />
      </main>
    </div>
  );
}
