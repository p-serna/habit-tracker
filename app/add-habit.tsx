
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useHabits } from "@/src/hooks";
import * as Haptics from "expo-haptics";

const HABIT_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
];

const HABIT_ICONS = [
  "💪", "📚", "🏃", "🧘", "💧", "🥗", "😴", "🎯",
  "🎨", "🎵", "📝", "🌱", "🏋️", "🚶", "🧠", "❤️"
];

export default function AddHabitScreen() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(HABIT_ICONS[0]);
  const [targetFrequency, setTargetFrequency] = useState(7);
  const [points, setPoints] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const { createHabit } = useHabits();

  const handleHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a habit name");
      return;
    }

    setIsLoading(true);
    handleHapticFeedback();

    try {
      await createHabit({
        name: name.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
        icon: selectedIcon,
        targetFrequency,
        points,
      });

      Alert.alert(
        "Success! 🎉",
        "Your new habit has been created. Start building consistency!",
        [
          {
            text: "Let's go!",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Error creating habit:", error);
      Alert.alert("Error", "Failed to create habit. Please try again.");
    } finally {
      setIsLoading(false);
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
        <Text style={styles.headerTitle}>New Habit</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Habit Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Drink 8 glasses of water"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add more details about your habit..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Choose Icon</Text>
            <View style={styles.iconGrid}>
              {HABIT_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    selectedIcon === icon && styles.selectedIconOption,
             
     ]}
                  onPress={() => {
                    handleHapticFeedback();
                    setSelectedIcon(icon);
                  }}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Choose Color</Text>
            <View style={styles.colorGrid}>
              {HABIT_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorOption,
                  ]}
                  onPress={() => {
                    handleHapticFeedback();
                    setSelectedColor(color);
                  }}
                />
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Target per Week</Text>
              <View style={styles.numberInputContainer}>
                <TouchableOpacity
                  style={styles.numberButton}
                  onPress={() => {
                    handleHapticFeedback();
                    setTargetFrequency(Math.max(1, targetFrequency - 1));
                  }}
                >
                  <Text style={styles.numberButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.numberValue}>{targetFrequency}</Text>
                <TouchableOpacity
                  style={styles.numberButton}
                  onPress={() => {
                    handleHapticFeedback();
                    setTargetFrequency(Math.min(7, targetFrequency + 1));
                  }}
                >
                  <Text style={styles.numberButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Points per Day</Text>
              <View style={styles.numberInputContainer}>
                <TouchableOpacity
                  style={styles.numberButton}
                  onPress={() => {
                    handleHapticFeedback();
                    setPoints(Math.max(5, points - 5));
                  }}
                >
                  <Text style={styles.numberButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.numberValue}>{points}</Text>
                <TouchableOpacity
                  style={styles.numberButton}
                  onPress={() => {
                    handleHapticFeedback();
                    setPoints(Math.min(50, points + 5));
                  }}
                >
                  <Text style={styles.numberButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Preview</Text>
            <View style={[styles.previewCard, { borderLeftColor: selectedColor }]}>
              <View style={styles.previewContent}>
                <View style={[styles.previewIcon, { backgroundColor: selectedColor + "20" }]}>
                  <Text style={styles.previewIconText}>{selectedIcon}</Text>
                </View>
                <View style={styles.previewText}>
                  <Text style={styles.previewName}>{name || "Habit Name"}</Text>
                  {description && (
                    <Text style={styles.previewDescription}>{description}</Text>
                  )}
                  <Text style={styles.previewFrequency}>
                    {targetFrequency}x per week • {points} points
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.disabledButton]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? "Creating..." : "Create Habit"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
    justifyContent: "center",
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
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  selectedIconOption: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  iconText: {
    fontSize: 24,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "transparent",
  },
  selectedColorOption: {
    borderColor: "#1f2937",
  },
  row: {
    flexDirection: "row",
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  numberInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  numberButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  numberButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3b82f6",
  },
  numberValue: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  previewContainer: {
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: "white",
    borderRadius: 16,
    borderLeftWidth: 4,
    padding: 16,
  },
  previewContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  previewIconText: {
    fontSize: 24,
  },
  previewText: {
    flex: 1,
  },
  previewName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  previewDescription: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  previewFrequency: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "500",
  },
  footer: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
