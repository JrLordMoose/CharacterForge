import { characters, type Character, type InsertCharacter, type UpdateCharacter, users, type User, type InsertUser } from "@shared/schema";
import { db } from './db';
import { eq } from 'drizzle-orm';

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User>;
  updateLastLogin(id: number): Promise<void>;
  
  // Character methods
  getAllCharacters(): Promise<Character[]>;
  getCharactersByUserId(userId: number): Promise<Character[]>;
  getCharacter(id: number): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter, userId: number): Promise<Character>;
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
    this.seedCharacters();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Using Array.from() to avoid iterator issues with Map in TS
    const allUsers = Array.from(this.users.values());
    return allUsers.find(user => user.username === username);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const allUsers = Array.from(this.users.values());
    return allUsers.find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date().toISOString();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now,
      lastLogin: null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    const updatedUser: User = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateLastLogin(id: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLogin = new Date().toISOString();
      this.users.set(id, user);
    }
  }

  async getAllCharacters(): Promise<Character[]> {
    return Array.from(this.characterStorage.values());
  }
  
  async getCharactersByUserId(userId: number): Promise<Character[]> {
    const allCharacters = Array.from(this.characterStorage.values());
    return allCharacters.filter(character => character.userId === userId);
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characterStorage.get(id);
  }

  async createCharacter(character: InsertCharacter, userId: number): Promise<Character> {
    const id = this.currentCharacterId++;
    const newCharacter: Character = { 
      ...character, 
      id,
      userId 
    };
    this.characterStorage.set(id, newCharacter);
    return newCharacter;
  }

  async updateCharacter(id: number, data: UpdateCharacter): Promise<Character> {
    const character = this.characterStorage.get(id);
    if (!character) {
      throw new Error(`Character with id ${id} not found`);
    }
    const updatedCharacter: Character = { ...character, ...data };
    this.characterStorage.set(id, updatedCharacter);
    return updatedCharacter;
  }

  async deleteCharacter(id: number): Promise<void> {
    this.characterStorage.delete(id);
  }

  private async seedCharacters() {
    // Create a demo user first
    const demoUser = await this.createUser({
      username: "demo",
      password: "demo123", // in a real app, this would be hashed
      email: "demo@example.com",
      displayName: "Demo User",
      bio: "This is a demo account for exploring the application",
      avatarUrl: null
    });
    
    // Add some example characters
    await this.createCharacter({
      name: "Julian Carter",
      role: "Protagonist",
      category: "Main Character",
      progress: 75,
      description: "A troubled detective with a dark past",
      appearance: "Mid-30s, tall with haunted blue eyes and perpetual stubble. Has a distinctive scar across his left cheek.",
      imageUrl: "https://storage.googleapis.com/pai-images/ae63495c4ab84e7593d2dea9d3fdfa45.jpeg",
      traits: JSON.stringify([
        { name: "Perseverance", value: 90, description: "Never gives up, even when the odds seem impossible" },
        { name: "Introversion", value: 75, description: "Prefers to work alone, uncomfortable in social situations" },
        { name: "Empathy", value: 60, description: "Can understand the motivations of criminals, sometimes too well" }
      ]),
      motivations: "Seeking redemption for past failures, driven to solve the one case that haunts him",
      conflicts: "Internal struggle with alcoholism; External conflict with corrupt officials in the department",
      backstory: "Former star detective who fell from grace after a high-profile case went wrong, resulting in the death of his partner. Has been working lower-profile cases since, but still maintains his sharp investigative instincts.",
      relationships: JSON.stringify([
        { name: "Sarah Carter", relation: "Ex-wife", description: "Still cares for him but couldn't handle his obsession with work", strength: 35 },
        { name: "Captain Reynolds", relation: "Boss", description: "Tough but fair, gives Julian chances others wouldn't", strength: 65 }
      ]),
      arc: "From broken detective to finding redemption, not through solving the case, but by learning to forgive himself",
      voice: "Speaks in short, clipped sentences. Rarely raises his voice. Occasional dry, dark humor. Uses police jargon frequently."
    }, demoUser.id);
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }
  
  async updateLastLogin(id: number): Promise<void> {
    await db
      .update(users)
      .set({ lastLogin: new Date().toISOString() })
      .where(eq(users.id, id));
  }

  async getAllCharacters(): Promise<Character[]> {
    return db.select().from(characters);
  }
  
  async getCharactersByUserId(userId: number): Promise<Character[]> {
    return db
      .select()
      .from(characters)
      .where(eq(characters.userId, userId));
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    const [character] = await db.select().from(characters).where(eq(characters.id, id));
    return character || undefined;
  }

  async createCharacter(character: InsertCharacter, userId: number): Promise<Character> {
    const [newCharacter] = await db
      .insert(characters)
      .values({ ...character, userId })
      .returning();
    return newCharacter;
  }

  async updateCharacter(id: number, data: UpdateCharacter): Promise<Character> {
    const [updatedCharacter] = await db
      .update(characters)
      .set(data)
      .where(eq(characters.id, id))
      .returning();
    return updatedCharacter;
  }

  async deleteCharacter(id: number): Promise<void> {
    await db.delete(characters).where(eq(characters.id, id));
  }
}

// Use DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();