export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCoins(userId: number, coins: number): Promise<User | undefined>;
  
  // Task methods
  getTasks(userId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  completeTask(id: number): Promise<Task | undefined>;
  
  // Daily Goal methods
  getDailyGoals(userId: number): Promise<DailyGoal[]>;
  createDailyGoal(goal: InsertDailyGoal): Promise<DailyGoal>;
  completeDailyGoal(id: number): Promise<DailyGoal | undefined>;
  resetDailyGoals(userId: number): Promise<boolean>;
  
  // Reward methods
  getRewards(userId: number): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  unlockReward(id: number): Promise<Reward | undefined>;
  
  // Mini-game methods
  getMiniGameScores(userId: number, gameType?: string): Promise<MiniGameScore[]>;
  createMiniGameScore(score: InsertMiniGameScore): Promise<MiniGameScore>;
}

import { users, tasks, dailyGoals, rewards, miniGameScores } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { User, InsertUser, Task, InsertTask, DailyGoal, InsertDailyGoal, Reward, InsertReward, MiniGameScore, InsertMiniGameScore } from "@shared/schema";

// Класс для хранения в базе данных
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserCoins(userId: number, coins: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const [updatedUser] = await db
      .update(users)
      .set({ coins: user.coins + coins })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  // Task methods
  async getTasks(userId: number): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task | undefined> {
    const task = await this.getTask(id);
    if (!task) return undefined;

    const [updatedTask] = await db
      .update(tasks)
      .set(taskUpdate)
      .where(eq(tasks.id, id))
      .returning();
    
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning({ id: tasks.id });

    return result.length > 0;
  }

  async completeTask(id: number): Promise<Task | undefined> {
    const task = await this.getTask(id);
    if (!task || task.isCompleted) return undefined;

    const [completedTask] = await db
      .update(tasks)
      .set({ isCompleted: true, completedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    
    return completedTask;
  }

  // Daily Goal methods
  async getDailyGoals(userId: number): Promise<DailyGoal[]> {
    return await db
      .select()
      .from(dailyGoals)
      .where(eq(dailyGoals.userId, userId))
      .orderBy(dailyGoals.id);
  }

  async createDailyGoal(insertGoal: InsertDailyGoal): Promise<DailyGoal> {
    const [goal] = await db
      .insert(dailyGoals)
      .values(insertGoal)
      .returning();
    return goal;
  }

  async completeDailyGoal(id: number): Promise<DailyGoal | undefined> {
    const [goal] = await db.select().from(dailyGoals).where(eq(dailyGoals.id, id));
    if (!goal || goal.isCompleted) return undefined;

    const [completedGoal] = await db
      .update(dailyGoals)
      .set({ isCompleted: true, completedAt: new Date() })
      .where(eq(dailyGoals.id, id))
      .returning();
    
    return completedGoal;
  }

  async resetDailyGoals(userId: number): Promise<boolean> {
    await db
      .update(dailyGoals)
      .set({ isCompleted: false, completedAt: null })
      .where(eq(dailyGoals.userId, userId));
    
    return true;
  }

  // Reward methods
  async getRewards(userId: number): Promise<Reward[]> {
    return await db
      .select()
      .from(rewards)
      .where(eq(rewards.userId, userId))
      .orderBy(rewards.id);
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const [reward] = await db
      .insert(rewards)
      .values(insertReward)
      .returning();
    return reward;
  }

  async unlockReward(id: number): Promise<Reward | undefined> {
    const [reward] = await db.select().from(rewards).where(eq(rewards.id, id));
    if (!reward) return undefined;

    const [unlockedReward] = await db
      .update(rewards)
      .set({ 
        lastUnlocked: new Date(),
        timesUnlocked: (reward.timesUnlocked || 0) + 1
      })
      .where(eq(rewards.id, id))
      .returning();
    
    return unlockedReward;
  }

  // Mini-game methods
  async getMiniGameScores(userId: number, gameType?: string): Promise<MiniGameScore[]> {
    if (gameType) {
      return await db
        .select()
        .from(miniGameScores)
        .where(
          and(
            eq(miniGameScores.userId, userId),
            eq(miniGameScores.gameType, gameType)
          )
        )
        .orderBy(desc(miniGameScores.createdAt));
    } else {
      return await db
        .select()
        .from(miniGameScores)
        .where(eq(miniGameScores.userId, userId))
        .orderBy(desc(miniGameScores.createdAt));
    }
  }

  async createMiniGameScore(insertScore: InsertMiniGameScore): Promise<MiniGameScore> {
    const [score] = await db
      .insert(miniGameScores)
      .values(insertScore)
      .returning();
    return score;
  }
}

export const storage = new DatabaseStorage();