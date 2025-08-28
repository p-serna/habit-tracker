
import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as Haptics from "expo-haptics";

export default function AchievementsScreen() {
  const achievements = useQuery(api.achievements.list);
  const stats = useQuery(api.stats.getUserStats);

  const handleHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  if (achievements === undefined || stats === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading achievements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);

  const getProgress = (achievement: typeof achievements[0]) => {
    switch (achievement.type) {
      case "total_completions":
        return Math.min(stats.totalCompletions / achievement.requirement, 1);
      case "streak":
        return Math.min(stats.currentStreak / achievement.requirement, 1);
      case "points":
        return Math.min(stats.totalPoints / achievement.requirement, 1);
      default:
        return 0;
    }
  };

  const getProgressText = (achievement: typeof achievements[0]) => {
    switch (achievement.type) {
      case "total_completions":
        return `${stats.totalCompletions}/${achievement.requirement}`;
      case "streak":
        return `${stats.currentStreak}/${achievement.requirement}`;
      case "points":
        return `${stats.totalPoints}/${achievement.requirement}`;
      default:
        return "0/0";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            handleHapticFeedback();
            router.back();
          }}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.statsOverview}>
            <Text style={styles.overviewTitle}>Your Progress</Text>
            <Text style={styles.overviewSubtitle}>
              {unlockedAchievements.length} of {achievements.length} achievements unlocked
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(unlockedAchievements.length / achievements.length) * 100}%` },
                ]}
              />
            </View>
          </View>

          {unlockedAchievements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏆 Unlocked</Text>
              {unlockedAchievements.map((achievement) => (
                <View key={achievement._id} style={[styles.achievementCard, styles.unlockedCard]}>
                  <View style={styles.achievementContent}>
                    <View style={styles.achievementIcon}>
                      <Text style={styles.achievementIconText}>{achievement.icon}</Text>
                    </View>
                    <View style={styles.achievementText}>
                      <Text style={styles.achievementName}>{achievement.name}</Text>
                      <Text style={styles.achievementDescription}>
                        {achievement.description}
                      </Text>
                      <Text style={styles.achievementPoints}>+{achievement.points} points</Text>
                    </View>
                    <View style={styles.achievementBadge}>
                      <Text style={styles.badgeText}>✓</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {lockedAchievements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔒 Locked</Text>
              {lockedAchievements.map((achievement) => {
                const progress = getProgress(achievement);
                const progressText = getProgressText(achievement);
                
                return (
                  <View key={achievement._id} style={[styles.achievementCard, styles.lockedCard]}>
                    <View style={styles.achievementContent}>
                      <View style={[styles.achievementIcon, styles.lockedIcon]}>
                        <Text style={styles.lockedIconText}>{achievement.icon}</Text>
                      </View>
                      <View style={styles.achievementText}>
                        <Text style={[styles.achievementName, styles.lockedText]}>
                          {achievement.name}
                        </Text>
                        <Text style={[styles.achievementDescription, styles.lockedDescription]}>
                          {achievement.description}
                        </Text>
                        <Text style={styles.achievementPoints}>+{achievement.points} points</Text>
                        <View style={styles.progressContainer}>
                          <View style={styles.miniProgressBar}>
                            <View
                              style={[styles.miniProgressFill, { width: `${progress * 100}%` }]}
                            />
                          </View>
                          <Text style={styles.progressText}>{progressText}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {achievements.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🏆</Text>
              <Text style={styles.emptyStateTitle}>No achievements yet</Text>
              <Text style={styles.emptyStateDescription}>
                Start completing habits to unlock achievements!
              </Text>
            </View>
          )}
        </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    justifyConte
nt: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 20,
    color: "#374151",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  statsOverview: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  overviewSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  achievementCard: {
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  unlockedCard: {
    backgroundColor: "white",
  },
  lockedCard: {
    backgroundColor: "#f9fafb",
  },
  achievementContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  lockedIcon: {
    backgroundColor: "#f3f4f6",
  },
  achievementIconText: {
    fontSize: 28,
  },
  lockedIconText: {
    fontSize: 28,
    opacity: 0.5,
  },
  achievementText: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  lockedText: {
    color: "#6b7280",
  },
  achievementDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  lockedDescription: {
    color: "#9ca3af",
  },
  achievementPoints: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "600",
  },
  achievementBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  miniProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    marginRight: 8,
  },
  miniProgressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    minWidth: 40,
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
    lineHeight: 22,
  },
});