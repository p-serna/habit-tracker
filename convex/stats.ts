

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserStats = query({
  args: {},
  handler: async (ctx, args) => {
    // Try to get existing stats
    let stats = await ctx.db
      .query("userStats")
      .first();

    // If no stats exist, return default values
    if (!stats) {
      return {
        totalPoints: 0,
        totalCompletions: 0,
        currentStreak: 0,

        longestStreak: 0,
        lastCompletionDate: undefined
      };
    }

    return stats;
  },
});

export const initializeUserStats = mutation({
  args: {},
  handler: async (ctx, args) => {
    // Check if stats already exist
    const existingStats = await ctx.db
      .query("userStats")
      .first();

    if (existingStats) {
      return existingStats._id;
    }

    // Create new stats
    const statsId = await ctx.db.insert("userStats", {
      totalPoints: 0,
      totalCompletions: 0,
      currentStreak: 0,
      longestStreak: 0,
    });

    return statsId;
  },
});

export const updateUserStats = mutation({
  args: {
    pointsToAdd: v.number(),
    completionDate: v.string(),
  },
  handler: async (ctx, args) => {
    let stats = await ctx.db
      .query("userStats")
      .first();

    if (!stats) {
      // Initialize stats if they don't exist
      const statsId = await ctx.db.insert("userStats", {
        totalPoints: args.pointsToAdd,
        totalCompletions: 1,
        currentStreak: 1,
        longestStreak: 1,
        lastCompletionDate: args.completionDate,
      });
      return statsId;
    }

    // Calculate streak
    const lastDate = stats.lastCompletionDate ? new Date(stats.lastCompletionDate) : null;
    const currentDate = new Date(args.completionDate);
    let newStreak = stats.currentStreak;

    if (lastDate) {
      const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        // Consecutive day
        newStreak = stats.currentStreak + 1;
      } else if (daysDiff > 1) {
        // Streak broken
        newStreak = 1;
      }
      // If daysDiff === 0, it's the same day, keep current streak
    } else {
      newStreak = 1;
    }

    // Update stats
    await ctx.db.patch(stats._id, {
      totalPoints: stats.totalPoints + args.pointsToAdd,
      totalCompletions: stats.totalCompletions + 1,
      currentStreak: newStreak,
      longestStreak: Math.max(stats.longestStreak, newStreak),
      lastCompletionDate: args.completionDate,
    });

    return stats._id;
  },
});