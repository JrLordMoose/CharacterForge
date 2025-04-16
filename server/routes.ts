import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCharacterSchema, updateCharacterSchema } from "@shared/schema";
import { ZodError } from "zod";
import OpenAI from "openai";

// Configure OpenAI
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key-for-development" 
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Character CRUD operations
  app.get("/api/characters", async (req: Request, res: Response) => {
    try {
      const characters = await storage.getAllCharacters();
      res.json(characters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch characters" });
    }
  });

  app.get("/api/characters/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid character ID" });
      }
      
      const character = await storage.getCharacter(id);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      
      res.json(character);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch character" });
    }
  });

  app.post("/api/characters", async (req: Request, res: Response) => {
    try {
      const validatedData = insertCharacterSchema.parse(req.body);
      const character = await storage.createCharacter(validatedData);
      res.status(201).json(character);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid character data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create character" });
    }
  });

  app.patch("/api/characters/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid character ID" });
      }
      
      const validatedData = updateCharacterSchema.parse(req.body);
      const character = await storage.getCharacter(id);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      
      const updatedCharacter = await storage.updateCharacter(id, validatedData);
      res.json(updatedCharacter);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid character data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update character" });
    }
  });

  app.delete("/api/characters/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid character ID" });
      }
      
      const character = await storage.getCharacter(id);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      
      await storage.deleteCharacter(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete character" });
    }
  });

  // Image generation with OpenAI
  app.post("/api/generate-image", async (req: Request, res: Response) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      // For development, return dummy image URLs based on predetermined categories
      // In production, this would call the actual OpenAI API

      const isDev = process.env.NODE_ENV === "development";
      let imageUrl = "";

      if (isDev) {
        // Determine image category based on prompt keywords
        const promptLower = prompt.toLowerCase();
        
        let categoryUrls = [
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60",
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60",
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60",
          "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60"
        ];
        
        // Fantasy images
        if (promptLower.includes("fantasy") || promptLower.includes("wizard") || promptLower.includes("elf") || promptLower.includes("dwarf")) {
          categoryUrls = [
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60",
            "https://images.unsplash.com/photo-1542103749-8ef59b94f47e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60",
            "https://images.unsplash.com/photo-1514136649217-b627b4b9cfb2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60",
            "https://images.unsplash.com/photo-1576078044571-8ea98b0b0963?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60",
            "https://images.unsplash.com/photo-1596375764789-0062e14fce0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60",
            "https://images.unsplash.com/photo-1615267807911-3f7e05904288?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60"
          ];
        }
        
        // Sci-fi images
        if (promptLower.includes("sci-fi") || promptLower.includes("future") || promptLower.includes("space") || promptLower.includes("tech")) {
          categoryUrls = [
            "https://images.unsplash.com/photo-1511207538754-e8555f2bc187?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60",
            "https://images.unsplash.com/photo-1544646290-6ae257aabc9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60",
            "https://images.unsplash.com/photo-1541367777708-7aaff32d2e9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60",
            "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60",
            "https://images.unsplash.com/photo-1518141532615-4305c9f914c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60",
            "https://images.unsplash.com/photo-1522277245709-6a4ddf73165a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60"
          ];
        }
        
        // Randomly select an image from the category
        const randomIndex = Math.floor(Math.random() * categoryUrls.length);
        imageUrl = categoryUrls[randomIndex];
      } else {
        // In production, call the OpenAI API
        try {
          const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: `Create a character portrait of ${prompt}. Realistic style, dramatic lighting, high quality.`,
            n: 1,
            size: "1024x1024",
            quality: "standard",
          });
          imageUrl = response.data[0].url;
        } catch (openaiError) {
          return res.status(500).json({ 
            message: "Error generating image with OpenAI", 
            error: openaiError instanceof Error ? openaiError.message : "Unknown OpenAI error" 
          });
        }
      }

      res.json({ imageUrl });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to generate image", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // AI-powered character enhancement endpoints
  app.post("/api/generate-traits", async (req: Request, res: Response) => {
    try {
      const { character } = req.body;
      
      // For development, return predefined traits
      // In production, this would call the OpenAI API
      
      const traits = [
        { name: "Determination", value: 4, description: "This character is extremely determined and will pursue their goals relentlessly." },
        { name: "Caution", value: 2, description: "While normally cautious, this character's determination can override this trait when pursuing important objectives." },
        { name: "Empathy", value: 3, description: "Shows average empathy towards others, but can become detached when focused on their goals." },
        { name: "Intelligence", value: 5, description: "Highly intelligent and analytical, able to solve complex problems with ease." }
      ];
      
      res.json(traits);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate traits" });
    }
  });

  app.post("/api/enhance-backstory", async (req: Request, res: Response) => {
    try {
      const { backstory } = req.body;
      
      // For development, simply enhance the existing backstory with a template
      // In production, this would call the OpenAI API
      
      let enhancedBackstory = backstory || "";
      
      if (!backstory || backstory.trim() === "") {
        enhancedBackstory = "The character grew up in a small town with loving parents who encouraged their interests. When they were a teenager, a life-changing event occurred that set them on their current path. They've since been driven by a mix of personal goals and a desire to make a difference in the world.";
      } else {
        enhancedBackstory = backstory + "\n\nAdditionally, formative experiences in their early adulthood shaped their worldview significantly. They've always carried a sense of destiny that both motivates and burdens them.";
      }
      
      res.json({ enhancedBackstory });
    } catch (error) {
      res.status(500).json({ message: "Failed to enhance backstory" });
    }
  });

  app.post("/api/generate-voice", async (req: Request, res: Response) => {
    try {
      const { character } = req.body;
      
      // For development, return predefined voice pattern
      // In production, this would call the OpenAI API
      
      const voice = `${character.name} speaks with a deliberate cadence, choosing words carefully. They tend to use complex vocabulary when discussing topics they're passionate about, but simplify their language when explaining concepts to others. When emotional, their speech becomes more clipped and direct. Common phrases include "Let's examine this further" and "I'm not convinced yet."`;
      
      res.json({ voice });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate voice" });
    }
  });

  app.post("/api/generate-relationships", async (req: Request, res: Response) => {
    try {
      const { character } = req.body;
      
      // For development, return predefined relationships
      // In production, this would call the OpenAI API
      
      const relationships = [
        { name: "Morgan Wells", relation: "Mentor", description: "An older, experienced figure who guided the character in their early development but now has a complicated relationship with them.", strength: 4 },
        { name: "Alex Rivera", relation: "Rival", description: "Someone with similar goals but different methods, creating a competitive but respectful dynamic.", strength: 3 },
        { name: "Jamie Chen", relation: "Friend", description: "A loyal companion who provides emotional support and occasional comic relief.", strength: 5 }
      ];
      
      res.json({ relationships });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate relationships" });
    }
  });

  app.post("/api/generate-arc", async (req: Request, res: Response) => {
    try {
      const { character } = req.body;
      
      // For development, return predefined arc
      // In production, this would call the OpenAI API
      
      const arc = `${character.name} begins their journey confident in their beliefs but naive about the complexities of the world. The first turning point comes when they face their initial failure, forcing them to reevaluate their approach. In the middle of their journey, they discover uncomfortable truths about themselves and must reconcile their ideals with reality. By the climax, they've developed a more nuanced worldview, achieving their goals but at a cost they didn't anticipate. Their final state shows growth in wisdom and capability, though certain innocence has been lost.`;
      
      res.json({ arc });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate arc" });
    }
  });

  app.post("/api/simulate-character", async (req: Request, res: Response) => {
    try {
      const { character, scenario } = req.body;
      
      if (!character || !scenario) {
        return res.status(400).json({ message: "Character and scenario are required" });
      }
      
      // For development, return predefined response
      // In production, this would call the OpenAI API
      
      const response = `Given ${character.name}'s personality and backstory, they would approach this scenario with caution initially. Their first instinct would be to analyze the situation before committing to any action. They would likely ask clarifying questions and consider multiple perspectives, weighing the potential consequences against their personal values and goals. In the end, they would take decisive action, though perhaps with some reservations about the outcome.`;
      
      res.json({ response });
    } catch (error) {
      res.status(500).json({ message: "Failed to simulate character response" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
