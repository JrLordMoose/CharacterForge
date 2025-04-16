import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Character, CharacterTrait, CharacterRelationship } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type Folder = {
  name: string;
  categories: Array<{name: string}>;
};

type CharacterContextType = {
  loading: boolean;
  characters: Character[];
  folders: Folder[];
  getCharacter: (id: string) => Character | undefined;
  createCharacter: (character: Partial<Character>) => Promise<Character>;
  updateCharacter: (id: string, data: Partial<Character>) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
};

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export function CharacterProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Define the default folders structure
  const defaultFolders: Folder[] = [
    {
      name: 'My Novel',
      categories: [
        { name: 'Protagonists' },
        { name: 'Antagonists' },
        { name: 'Supporting Characters' },
        { name: 'Unused' }
      ]
    }
  ];
  
  const [folders] = useState<Folder[]>(defaultFolders);

  // Query characters from the API
  const { data: characters = [], isLoading } = useQuery<Character[]>({
    queryKey: ['/api/characters'],
  });
  
  // Create character mutation
  const createMutation = useMutation({
    mutationFn: async (character: Partial<Character>) => {
      const res = await apiRequest('POST', '/api/characters', character);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
      toast({
        title: "Success",
        description: "Character created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create character",
        variant: "destructive",
      });
    }
  });
  
  // Update character mutation
  const updateMutation = useMutation({
    mutationFn: async ({id, data}: {id: string, data: Partial<Character>}) => {
      await apiRequest('PATCH', `/api/characters/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
      toast({
        title: "Success",
        description: "Character updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update character",
        variant: "destructive",
      });
    }
  });
  
  // Delete character mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/characters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/characters'] });
      toast({
        title: "Success",
        description: "Character deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete character",
        variant: "destructive",
      });
    }
  });

  const getCharacter = (id: string): Character | undefined => {
    return characters.find(c => c.id === parseInt(id));
  };

  const createCharacter = async (character: Partial<Character>): Promise<Character> => {
    return await createMutation.mutateAsync(character);
  };

  const updateCharacter = async (id: string, data: Partial<Character>): Promise<void> => {
    await updateMutation.mutateAsync({id, data});
  };

  const deleteCharacter = async (id: string): Promise<void> => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <CharacterContext.Provider
      value={{
        loading: isLoading,
        characters,
        folders,
        getCharacter,
        createCharacter,
        updateCharacter,
        deleteCharacter,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
}
