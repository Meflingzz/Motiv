import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  coins: integer("coins").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  lastLogin: timestamp("last_login").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Task schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  coinReward: integer("coin_reward").notNull().default(10),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  userId: true,
  title: true,
  description: true,
  dueDate: true,
  coinReward: true,
});

// Daily Goal schema
export const dailyGoals = pgTable("daily_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  icon: text("icon").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDailyGoalSchema = createInsertSchema(dailyGoals).pick({
  userId: true,
  title: true,
  icon: true,
});

// Reward schema
export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
  duration: integer("duration").notNull(), // in minutes
  coinCost: integer("coin_cost").notNull(),
  isUnlocked: boolean("is_unlocked").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRewardSchema = createInsertSchema(rewards).pick({
  userId: true,
  title: true,
  description: true,
  icon: true,
  duration: true,
  coinCost: true,
});

// Mini-game score schema
export const miniGameScores = pgTable("mini_game_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  gameType: text("game_type").notNull(), // "memory", "reaction"
  score: integer("score").notNull(),
  coinsEarned: integer("coins_earned").notNull(),
  playedAt: timestamp("played_at").notNull().defaultNow(),
});

export const insertMiniGameScoreSchema = createInsertSchema(miniGameScores).pick({
  userId: true,
  gameType: true,
  score: true,
  coinsEarned: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type DailyGoal = typeof dailyGoals.$inferSelect;
export type InsertDailyGoal = z.infer<typeof insertDailyGoalSchema>;

export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;

export type MiniGameScore = typeof miniGameScores.$inferSelect;
export type InsertMiniGameScore = z.infer<typeof insertMiniGameScoreSchema>;

// Default Data
export const DEFAULT_DAILY_GOALS = [
  { title: "Study", icon: "book-read" },
  { title: "Exercise", icon: "heart-pulse" },
  { title: "Water", icon: "water-flash" },
  { title: "Reading", icon: "book" },
  { title: "Coding", icon: "computer" },
];

export const DEFAULT_REWARDS = [
  { title: "Gaming Time", description: "30 minutes", icon: "gamepad", duration: 30, coinCost: 50 },
  { title: "Movie Time", description: "2 hours", icon: "movie", duration: 120, coinCost: 100 },
  { title: "Social Media", description: "15 minutes", icon: "instagram", duration: 15, coinCost: 30 },
];
