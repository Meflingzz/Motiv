import {
  users, tasks, dailyGoals, rewards, miniGameScores,
  type User, type InsertUser,
  type Task, type InsertTask,
  type DailyGoal, type InsertDailyGoal,
  type Reward, type InsertReward,
  type MiniGameScore, type InsertMiniGameScore,
  DEFAULT_DAILY_GOALS, DEFAULT_REWARDS
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private dailyGoals: Map<number, DailyGoal>;
  private rewards: Map<number, Reward>;
  private miniGameScores: Map<number, MiniGameScore>;
  
  private userIdCounter: number;
  private taskIdCounter: number;
  private goalIdCounter: number;
  private rewardIdCounter: number;
  private scoreIdCounter: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.dailyGoals = new Map();
    this.rewards = new Map();
    this.miniGameScores = new Map();
    
    this.userIdCounter = 1;
    this.taskIdCounter = 1;
    this.goalIdCounter = 1;
    this.rewardIdCounter = 1;
    this.scoreIdCounter = 1;
    
    // Create demo user
    this.createUser({ username: "demo", password: "password" }).then(user => {
      // Add some sample tasks
      this.createTask({
        userId: user.id,
        title: "Complete JavaScript course module",
        description: "Finish the advanced function chapter",
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        coinReward: 30
      });
      
      this.createTask({
        userId: user.id,
        title: "Work on portfolio project",
        description: "Fix responsive layout issues",
        dueDate: new Date(Date.now() + 4.5 * 60 * 60 * 1000), // 4.5 hours from now
        coinReward: 45
      });
      
      // Add a completed task
      this.createTask({
        userId: user.id,
        title: "Morning Workout",
        description: "30 minutes cardio",
        dueDate: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        coinReward: 25
      }).then(task => {
        this.completeTask(task.id);
        this.updateUserCoins(user.id, user.coins + task.coinReward);
      });
      
      // Add default daily goals
      DEFAULT_DAILY_GOALS.forEach(goal => {
        this.createDailyGoal({
          userId: user.id,
          title: goal.title,
          icon: goal.icon
        });
      });
      
      // Add default rewards
      DEFAULT_REWARDS.forEach(reward => {
        this.createReward({
          userId: user.id,
          title: reward.title,
          description: reward.description,
          icon: reward.icon,
          duration: reward.duration,
          coinCost: reward.coinCost
        });
      });
      
      // Mark some daily goals as completed
      this.getDailyGoals(user.id).then(goals => {
        if (goals.length >= 3) {
          this.completeDailyGoal(goals[0].id);
          this.completeDailyGoal(goals[1].id);
          this.completeDailyGoal(goals[2].id);
        }
      });
      
      // Add coins to user
      this.updateUserCoins(user.id, 285);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id, 
      coins: 0, 
      streak: 0,
      lastLogin: new Date() 
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserCoins(userId: number, coins: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, coins };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Task methods
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const task: Task = {
      ...insertTask,
      id,
      isCompleted: false,
      completedAt: null,
      createdAt: new Date()
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, taskUpdate: Partial<Task>): Promise<Task | undefined> {
    const task = await this.getTask(id);
    if (!task) return undefined;

    const updatedTask = { ...task, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async completeTask(id: number): Promise<Task | undefined> {
    const task = await this.getTask(id);
    if (!task) return undefined;

    const completedTask = { 
      ...task, 
      isCompleted: true, 
      completedAt: new Date() 
    };
    this.tasks.set(id, completedTask);
    return completedTask;
  }

  // Daily Goal methods
  async getDailyGoals(userId: number): Promise<DailyGoal[]> {
    return Array.from(this.dailyGoals.values()).filter(
      (goal) => goal.userId === userId
    );
  }

  async createDailyGoal(insertGoal: InsertDailyGoal): Promise<DailyGoal> {
    const id = this.goalIdCounter++;
    const goal: DailyGoal = {
      ...insertGoal,
      id,
      isCompleted: false,
      createdAt: new Date()
    };
    this.dailyGoals.set(id, goal);
    return goal;
  }

  async completeDailyGoal(id: number): Promise<DailyGoal | undefined> {
    const goal = this.dailyGoals.get(id);
    if (!goal) return undefined;

    const completedGoal = { ...goal, isCompleted: true };
    this.dailyGoals.set(id, completedGoal);
    return completedGoal;
  }

  async resetDailyGoals(userId: number): Promise<boolean> {
    const goals = await this.getDailyGoals(userId);
    goals.forEach(goal => {
      const resetGoal = { ...goal, isCompleted: false };
      this.dailyGoals.set(goal.id, resetGoal);
    });
    return true;
  }

  // Reward methods
  async getRewards(userId: number): Promise<Reward[]> {
    return Array.from(this.rewards.values()).filter(
      (reward) => reward.userId === userId
    );
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const id = this.rewardIdCounter++;
    const reward: Reward = {
      ...insertReward,
      id,
      isUnlocked: false,
      createdAt: new Date()
    };
    this.rewards.set(id, reward);
    return reward;
  }

  async unlockReward(id: number): Promise<Reward | undefined> {
    const reward = this.rewards.get(id);
    if (!reward) return undefined;

    const unlockedReward = { ...reward, isUnlocked: true };
    this.rewards.set(id, unlockedReward);
    return unlockedReward;
  }

  // Mini-game methods
  async getMiniGameScores(userId: number, gameType?: string): Promise<MiniGameScore[]> {
    let scores = Array.from(this.miniGameScores.values()).filter(
      (score) => score.userId === userId
    );
    
    if (gameType) {
      scores = scores.filter(score => score.gameType === gameType);
    }
    
    return scores;
  }

  async createMiniGameScore(insertScore: InsertMiniGameScore): Promise<MiniGameScore> {
    const id = this.scoreIdCounter++;
    const score: MiniGameScore = {
      ...insertScore,
      id,
      playedAt: new Date()
    };
    this.miniGameScores.set(id, score);
    return score;
  }
}

export const storage = new MemStorage();
