import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  lastLogin: text("last_login"),
  resetToken: text("reset_token"),
  resetTokenExpiry: text("reset_token_expiry"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull().default("Uncategorized"),
  appearance: text("appearance"),
  description: text("description"),
  traits: jsonb("traits").notNull().default([]),
  motivations: text("motivations"),
  conflicts: text("conflicts"),
  backstory: text("backstory"),
  relationships: jsonb("relationships").notNull().default([]),
  arc: text("arc"),
  voice: text("voice"),
  progress: integer("progress").notNull().default(0),
  folder: text("folder").notNull().default("My Novel"),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  userId: true,
});

export const updateCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  userId: true,
}).partial();

export const characterTraitSchema = z.object({
  name: z.string(),
  value: z.number().min(1).max(5),
  description: z.string().optional(),
});

export const characterRelationshipSchema = z.object({
  name: z.string(),
  relation: z.string(),
  description: z.string().optional(),
  strength: z.number().min(1).max(5).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type UpdateCharacter = z.infer<typeof updateCharacterSchema>;
export type Character = typeof characters.$inferSelect;
export type CharacterTrait = z.infer<typeof characterTraitSchema>;
export type CharacterRelationship = z.infer<typeof characterRelationshipSchema>;
