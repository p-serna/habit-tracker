

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const completeHabit = mutation({
  args: {
    habitId: v.id("habits"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already completed today
    const existingCompletion = await ctx.db
      .query("habitCompletions")
      .withIndex("by_habit_and_date", (q) => 
        q.eq("habitId", args.habitId).eq("date", args.date)
      )
      .first();

    if (existingCompletion) {
      throw new Error("Habit already completed today");
    }

    // Get habit details
    const habit = await ctx.db.get(args.habitId);
    if (!habit) {
      throw new Error("Habit not found");
    }

    // Create completion record
    const completionId = await ctx.db.insert("habitCompletions", {
      habitId: args.habitId,
      date: args.date,
      points: habit.points,
      completedAt: Date.now(),
    });

    // Update user stats
    await ctx.runMutation(api.stats.updateUserStats, {
      pointsToAdd: habit.points,
      completionDate: args.date,
    });

    // Check for achievements
    await ctx.runMutation(api.achievements.checkAndUnlock, {});

    return completionId;
  },
});

export const getCompletionsForDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("habitCompletions")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
  },
});

export const getWeeklyProgress = query({
  args: { 
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const completions = await ctx.db
      .query("habitCompletions")
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

    // Group by date
    const dailyTotals: Record<string, number> = {};
    completions.forEach(completion => {
      dailyTotals[completion.date] = (dailyTotals[completion.date] || 0) + 1;
    });

    return dailyTotals;
  },
});
