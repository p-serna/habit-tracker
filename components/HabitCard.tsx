

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface Habit {
  _id: Id<"habits">;
  name: string;
  description?: string;
  color: string;
  icon: string;
  points: number;
  targetFrequency: number;
}


interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onHapticFeedback: () => void;
}

export default function HabitCard({ habit, isCompleted, onHapticFeedback }: HabitCardProps) {
  const completeHabit = useMutation(api.completions.completeHabit);

  const handleToggle = async () => {
    onHapticFeedback();
    
    try {
      if (!isCompleted) {
        const today = new Date().toISOString().split('T')[0];
        await completeHabit({ 
          habitId: habit._id,
          date: today
        });
        // Show celebration for completion
        Alert.alert(
          "Great job! 🎉",
          `You earned ${habit.points} points for completing "${habit.name}"!`,
          [{ text: "Awesome!", style: "default" }]
        );
      }
    } catch (error) {
      console.error("Error toggling habit:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderLeftColor: habit.color },
        isCompleted && styles.completedContainer,
      ]}
      onPress={handleToggle}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={[styles.iconContainer, { backgroundColor: habit.color + "20" }]}>
            <Text style={styles.icon}>{habit.icon}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.name, isCompleted && styles.completedText]}>
              {habit.name}
            </Text>
            {habit.description && (
              <Text style={[styles.description, isCompleted && styles.completedDescription]}>
                {habit.description}
              </Text>
            )}
            <Text style={styles.frequency}>
              {habit.targetFrequency}x per week • {habit.points} points
            </Text>
          </View>
        </View>
        
        <View style={styles.rightSection}>
          <View style={[
            styles.checkbox,
            isCompleted && styles.checkedBox,
            { borderColor: habit.color }
          ]}>
            {isCompleted && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  completedContainer: {
    opacity: 0.8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#6b7280",
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  completedDescription: {
    color: "#9ca3af",
  },
  frequency: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "500",
  },
  rightSection: {
    marginLeft: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  checkedBox: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  checkmark: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
