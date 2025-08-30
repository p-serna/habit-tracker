

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useWeeklyProgress } from "@/src/hooks";

export default function WeeklyProgress() {
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - 6);
  
  const { data: weeklyProgressData, isLoading } = useWeeklyProgress(
    startDate.toISOString().split('T')[0],
    today.toISOString().split('T')[0]
  );

  if (isLoading || !weeklyProgressData) {
    return null;
  }

  // Convert array format to object for easy lookup
  const weeklyProgress: Record<string, number> = {};
  weeklyProgressData.forEach(item => {
    weeklyProgress[item.date] = item.count;
  });

  const days = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en', { weekday: 'short' });
    const completions = weeklyProgress[dateStr] || 0;
    
    days.push({
      day: dayName,
      date: dateStr,
      completions,
      isToday: i === 0,
    });
  }

  const maxCompletions = Math.max(...days.map(d => d.completions), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>This Week</Text>
      <View style={styles.progressContainer}>
        {days.map((day, index) => (
          <View key={day.date} style={styles.dayContainer}>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max((day.completions / maxCompletions) * 40, 4),
                    backgroundColor: day.isToday ? "#3b82f6" : "#e5e7eb",
                  },
                ]}
              />
            </View>
            <Text style={[styles.dayLabel, day.isToday && styles.todayLabel]}>
              {day.day}
            </Text>
            <Text style={styles.completionCount}>{day.completions}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dayContainer: {
    alignItems: "center",
    flex: 1,
  },
  barContainer: {
    height: 44,
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  todayLabel: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  completionCount: {
    fontSize: 10,
    color: "#9ca3af",
    fontWeight: "500",
  },
});
