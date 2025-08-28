

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  habits: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    icon: v.string(),
    targetFrequency: v.number(), // days per week
    points: v.number(), // points earned per completion
    isActive: v.boolean(),
    createdAt: v.number(),
  }),


  habitCompletions: defineTable({
    habitId: v.id("habits"),
    completedAt: v.number(),
    date: v.string(), // YYYY-MM-DD format for easy querying
    points: v.number(),
  })
    .index("by_habit", ["habitId"])
    .index("by_date", ["date"])
    .index("by_habit_and_date", ["habitId", "date"]),

  achievements: defineTable({
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    type: v.union(
      v.literal("streak"),
      v.literal("total_completions"),
      v.literal("points"),
      v.literal("consistency")
    ),
    requirement: v.number(),
    points: v.number(),
    unlockedAt: v.optional(v.number()),
  }),

  userStats: defineTable({
    totalPoints: v.number(),
    totalCompletions: v.number(),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastCompletionDate: v.optional(v.string()),
  }),
});
