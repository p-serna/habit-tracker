
import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from "react-native";
import { useHabits, useTodayCompletions, useStats, useAchievements } from "@/src/hooks";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import HabitCard from "@/components/HabitCard";
import StatsHeader from "@/components/StatsHeader";
import WeeklyProgress from "@/components/WeeklyProgress";

export default function HomeScreen() {
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: todayCompletions, isLoading: completionsLoading } = useTodayCompletions();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { initializeAchievements } = useAchievements();

  useEffect(() => {
    // Initialize achievements on first load
    initializeAchievements();
  }, []);

  const completedToday = new Set(todayCompletions?.map(c => c.habitId) || []);

  const handleHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  if (habitsLoading || statsLoading || completionsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your habits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {stats && <StatsHeader stats={stats} />}
        
        <WeeklyProgress />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Habits</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                handleHapticFeedback();
                router.push("/add-habit");
              }}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {habits?.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🎯</Text>
              <Text style={styles.emptyStateTitle}>No habits yet</Text>
              <Text style={styles.emptyStateDescription}>
                Create your first habit to start building consistency
              </Text>
              <TouchableOpacity
                style={styles.createFirstButton}
                onPress={() => {
                  handleHapticFeedback();
                  router.push("/add-habit");
                }}
              >
                <Text style={styles.createFirstButtonText}>Create First Habit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.habitsContainer}>
              {habits?.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompleted={completedToday.has(habit.id)}
                  onHapticFeedback={handleHapticFeedback}
                />
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.achievementsButton}
          onPress={() => {
            handleHapticFeedback();
            router.push("/achievements");
          }}
        >
          <Text style={styles.achievementsButtonIcon}>🏆</Text>
          <Text style={styles.achievementsButtonText}>View Achievements</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  scrollView: {
    flex: 1,
  },
  section: 
{
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  createFirstButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createFirstButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  habitsContainer: {
    gap: 12,
  },
  achievementsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  achievementsButtonIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  achievementsButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
});