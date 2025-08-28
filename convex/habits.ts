

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("habits")
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    icon: v.string(),
    targetFrequency: v.number(),
    points: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("habits", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("habits"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    targetFrequency: v.optional(v.number()),

    points: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("habits") },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { isActive: false });
  },
});

export const getTodayCompletions = query({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split('T')[0];
    return await ctx.db
      .query("habitCompletions")
      .withIndex("by_date", (q) => q.eq("date", today))
      .collect();
  },
});

export const getHabitProgress = query({
  args: { habitId: v.id("habits"), days: v.number() },
  handler: async (ctx, args) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - args.days);

    const completions = await ctx.db
      .query("habitCompletions")
      .withIndex("by_habit", (q) => q.eq("habitId", args.habitId))
      .filter((q) => q.gte(q.field("completedAt"), startDate.getTime()))
      .collect();

    return completions;
  },
});