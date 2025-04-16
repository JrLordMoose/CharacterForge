import { characters, type Character, type InsertCharacter, type UpdateCharacter, users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Character methods
  getAllCharacters(): Promise<Character[]>;
  getCharacter(id: number): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, data: UpdateCharacter): Promise<Character>;
  deleteCharacter(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private characterStorage: Map<number, Character>;
  currentUserId: number;
  currentCharacterId: number;

  constructor() {
    this.users = new Map();
    this.characterStorage = new Map();
    this.currentUserId = 1;
    this.currentCharacterId = 1;
    
    // Add some initial characters for demo purposes
    this.seedCharacters();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getAllCharacters(): Promise<Character[]> {
    return Array.from(this.characterStorage.values());
  }
  
  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characterStorage.get(id);
  }
  
  async createCharacter(character: InsertCharacter): Promise<Character> {
    const id = this.currentCharacterId++;
    const newCharacter: Character = { ...character, id };
    this.characterStorage.set(id, newCharacter);
    return newCharacter;
  }
  
  async updateCharacter(id: number, data: UpdateCharacter): Promise<Character> {
    const character = this.characterStorage.get(id);
    if (!character) {
      throw new Error(`Character with ID ${id} not found`);
    }
    
    const updatedCharacter: Character = { ...character, ...data };
    this.characterStorage.set(id, updatedCharacter);
    return updatedCharacter;
  }
  
  async deleteCharacter(id: number): Promise<void> {
    if (!this.characterStorage.has(id)) {
      throw new Error(`Character with ID ${id} not found`);
    }
    
    this.characterStorage.delete(id);
  }
  
  private seedCharacters() {
    const sampleCharacters: InsertCharacter[] = [
      {
        name: "Julian Carter",
        role: "Protagonist",
        appearance: "A brooding young scholar haunted by his tragic past, driven to uncover the truth at any cost.",
        description: "A brooding young scholar haunted by his tragic past",
        folder: "My Novel",
        category: "Protagonists",
        progress: 40,
        imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60",
        traits: [
          { name: "Determination", value: 4, description: "Julian's determination borders on obsession; he will pursue knowledge at almost any cost." },
          { name: "Caution", value: 2, description: "While normally cautious, Julian's determination can override this trait when pursuing important leads." }
        ],
        motivations: "Julian is primarily motivated by a desire to uncover the truth about his family's mysterious past. The loss of his parents in what appeared to be an accident has driven him to pursue answers, believing there were darker forces at play. He struggles with guilt that he wasn't there to prevent their deaths.",
        conflicts: "Julian struggles with his growing obsession and the moral compromises he's willing to make to uncover the truth. He worries he's becoming like those he's investigating. He also wrestles with survivor's guilt and questions whether his academic pursuits are merely a distraction from processing grief."
      },
      {
        name: "Elara Nightshade",
        role: "Antagonist",
        appearance: "A poised, elegant woman with piercing eyes and an enigmatic smile that never reaches her eyes.",
        description: "The enigmatic leader of a secret organization with mysterious goals",
        folder: "My Novel",
        category: "Antagonists",
        progress: 65,
        imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60",
        traits: [
          { name: "Intelligence", value: 5, description: "Elara possesses a brilliant, analytical mind that can see ten steps ahead of her opponents." },
          { name: "Ruthlessness", value: 4, description: "She will eliminate obstacles to her plans without hesitation, though she takes no pleasure in pointless cruelty." }
        ]
      },
      {
        name: "Marcus Wells",
        role: "Supporting Character",
        appearance: "A weathered professor with kind eyes behind wire-rimmed glasses, always dressed in rumpled tweed.",
        description: "Julian's mentor and father figure who harbors his own secrets",
        folder: "My Novel",
        category: "Supporting Characters",
        progress: 30,
        imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60",
        relationships: [
          { name: "Julian Carter", relation: "Student/Mentee", description: "Sees Julian as the son he never had, but worries about his growing obsession.", strength: 4 }
        ]
      }
    ];
    
    for (const character of sampleCharacters) {
      this.createCharacter(character);
    }
  }
}

export const storage = new MemStorage();
