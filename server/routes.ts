import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertTaskSchema, 
  insertDailyGoalSchema, 
  insertRewardSchema, 
  insertMiniGameScoreSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/user/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Exclude password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.post("/api/user/:id/coins", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const schema = z.object({
      coins: z.number(),
    });

    try {
      const data = schema.parse(req.body);
      const user = await storage.updateUserCoins(userId, data.coins);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid request body" });
    }
  });

  // Task routes
  app.get("/api/user/:userId/tasks", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const tasks = await storage.getTasks(userId);
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    try {
      const taskUpdate = req.body;
      const updatedTask = await storage.updateTask(taskId, taskUpdate);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      res.status(400).json({ message: "Invalid task data" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const deleted = await storage.deleteTask(taskId);
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(204).end();
  });

  app.post("/api/tasks/:id/complete", async (req, res) => {
    const taskId = parseInt(req.params.id);
    if (isNaN(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await storage.completeTask(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update user coins
    const user = await storage.getUser(task.userId);
    if (user) {
      await storage.updateUserCoins(user.id, user.coins + task.coinReward);
    }

    res.json(task);
  });

  // Daily Goal routes
  app.get("/api/user/:userId/daily-goals", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const goals = await storage.getDailyGoals(userId);
    res.json(goals);
  });

  app.post("/api/daily-goals", async (req, res) => {
    try {
      const goalData = insertDailyGoalSchema.parse(req.body);
      const goal = await storage.createDailyGoal(goalData);
      res.status(201).json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid goal data" });
    }
  });

  app.post("/api/daily-goals/:id/complete", async (req, res) => {
    const goalId = parseInt(req.params.id);
    if (isNaN(goalId)) {
      return res.status(400).json({ message: "Invalid goal ID" });
    }

    const goal = await storage.completeDailyGoal(goalId);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Also add some coins when completing daily goals
    const user = await storage.getUser(goal.userId);
    if (user) {
      await storage.updateUserCoins(user.id, user.coins + 15); // 15 coins for each daily goal
    }

    res.json(goal);
  });

  app.post("/api/user/:userId/reset-daily-goals", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    await storage.resetDailyGoals(userId);
    const goals = await storage.getDailyGoals(userId);
    res.json(goals);
  });

  // Reward routes
  app.get("/api/user/:userId/rewards", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const rewards = await storage.getRewards(userId);
    res.json(rewards);
  });

  app.post("/api/rewards", async (req, res) => {
    try {
      const rewardData = insertRewardSchema.parse(req.body);
      const reward = await storage.createReward(rewardData);
      res.status(201).json(reward);
    } catch (error) {
      res.status(400).json({ message: "Invalid reward data" });
    }
  });

  app.post("/api/rewards/:id/unlock", async (req, res) => {
    const rewardId = parseInt(req.params.id);
    if (isNaN(rewardId)) {
      return res.status(400).json({ message: "Invalid reward ID" });
    }

    const reward = await storage.unlockReward(rewardId);
    if (!reward) {
      return res.status(404).json({ message: "Reward not found" });
    }

    // Subtract coins from user
    const user = await storage.getUser(reward.userId);
    if (user) {
      if (user.coins < reward.coinCost) {
        return res.status(400).json({ message: "Not enough coins" });
      }
      
      await storage.updateUserCoins(user.id, user.coins - reward.coinCost);
    }

    res.json(reward);
  });

  // Mini-game routes
  app.get("/api/user/:userId/mini-game-scores", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const gameType = req.query.gameType as string | undefined;
    const scores = await storage.getMiniGameScores(userId, gameType);
    res.json(scores);
  });

  app.post("/api/mini-game-scores", async (req, res) => {
    try {
      const scoreData = insertMiniGameScoreSchema.parse(req.body);
      const score = await storage.createMiniGameScore(scoreData);
      
      // Add coins to user
      const user = await storage.getUser(score.userId);
      if (user) {
        await storage.updateUserCoins(user.id, user.coins + score.coinsEarned);
      }
      
      res.status(201).json(score);
    } catch (error) {
      res.status(400).json({ message: "Invalid score data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
