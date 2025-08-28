

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const DEFAULT_ACHIEVEMENTS = [
  {
    name: "First Step",
    description: "Complete your first habit",
    icon: "🎯",
    type: "total_completions" as const,
    requirement: 1,
    points: 50,
  },
  {
    name: "Getting Started",
    description: "Complete 5 habits",
    icon: "🌱",
    type: "total_completions" as const,
    requirement: 5,
    points: 100,
  },
  {
    name: "Habit Builder",
    description: "Complete 25 habits",
    icon: "🏗️",
    type: "total_completions" as const,
    requirement: 25,
    points: 250,
  },
  {
    name: "Consistency King",
    description: "Complete 100 habits",
    icon: "👑",
    type: "total_completions" as const,
    requirement: 100,
    points: 500,
  },
  {
    name: "Streak Starter",
    description: "Maintain a 3-day streak",
    icon: "🔥",
    type: "streak" as const,
    requirement: 3,
    points: 75,
  },
  {
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "⚡",
    type: "streak" as const,
    requirement: 7,
    points: 200,
  },
  {
    name: "Unstoppable",
    description: "Maintain a 30-day streak",
    icon: "🚀",
    type: "streak" as const,
    requirement: 30,
    points: 1000,
  },
  {
    name: "Point Collector",
    description: "Earn 500 points",
    icon: "💎",
    type: "points" as const,
    requirement: 500,
    points: 100,
  },
  {
    name: "Point Master",
    description: "Earn 2000 points",
    icon: "💰",
    type: "points" as const,
    requirement: 2000,
    points: 300,
  },
];

export const initializeAchievements = mutation({
  args: {},
  handler: async (ctx) => {
    const existingAchievements = await ctx.db.query("achievements").collect();
    
    if (existingAchievements.length === 0) {
      for (const achievement of DEFAULT_ACHIEVEMENTS) {
        await ctx.db.insert("achievements", achievement);
      }
    }
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("achievements").order("asc").collect();
  },
});

export const checkAndUnlock = mutation({
  args: {},
  handler: async (ctx) => {
    const stats = await ctx.db.query("userStats").first();
    if (!stats) return [];

    const achievements = await ctx.db
      .query("achievements")
      .filter((q) => q.eq(q.field("unlockedAt"), undefined))
      .collect();

    const newlyUnlocked = [];

    for (const achievement of achievements) {
      let shouldUnlock = false;

      switch (achievement.type) {
        case "total_completions":
          shouldUnlock = stats.totalCompletions >= achievement.requirement;
          break;
        case "streak":
          shouldUnlock = stats.currentStreak >= achievement.requirement;
          break;
        case "points":
          shouldUnlock = stats.totalPoints >= achievement.requirement;
          break;
      }

      if (shouldUnlock) {
        await ctx.db.patch(achievement._id, {
          unlockedAt: Date.now(),
        });
        
        // Award achievement points
        await ctx.db.patch(stats._id, {
          totalPoints: stats.totalPoints + achievement.points,
        });

        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  },
});
