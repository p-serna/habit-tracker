import React, { useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import { PanGestureHandler, PanGestureHandlerGestureEvent, State } from "react-native-gesture-handler";
import HabitCard from "./HabitCard";
import { Habit } from "@/src/types/database";
import { UndoAction } from "./UndoToast";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 100;
const COMPLETION_THRESHOLD = 150;

interface SwipeableHabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onComplete: (habitId: string) => void;
  onArchive: (habitId: string) => void;
  onHapticFeedback: () => void;
  onRefreshNeeded: () => void;
  onUndoNeeded: (action: UndoAction) => void;
}

export default function SwipeableHabitCard({
  habit,
  isCompleted,
  onComplete,
  onArchive,
  onHapticFeedback,
  onRefreshNeeded,
  onUndoNeeded,
}: SwipeableHabitCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  
  const handleGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    const { translationX } = event.nativeEvent;
    
    // Limit the translation to screen bounds
    const clampedTranslation = Math.max(-SCREEN_WIDTH * 0.6, Math.min(SCREEN_WIDTH * 0.6, translationX));
    
    translateX.setValue(clampedTranslation);
    
    // Show background when swiping
    const opacity = Math.min(Math.abs(clampedTranslation) / SWIPE_THRESHOLD, 1);
    backgroundOpacity.setValue(opacity);
  };

  const handleStateChange = (event: any) => {
    const { translationX, state } = event.nativeEvent;
    
    if (state === State.END || state === State.CANCELLED) {
      const absTranslationX = Math.abs(translationX);
      
      // Check if swipe was strong enough to trigger action
      if (absTranslationX >= COMPLETION_THRESHOLD) {
        onHapticFeedback();
        
        if (translationX > 0) {
          // Right swipe - complete habit
          const undoData: UndoAction = {
            type: 'complete',
            habitId: habit.id,
            habitName: habit.name,
            timestamp: Date.now(),
          };
          onComplete(habit.id);
          onUndoNeeded(undoData);
        } else {
          // Left swipe - archive habit
          const undoData: UndoAction = {
            type: 'archive',
            habitId: habit.id,
            habitName: habit.name,
            timestamp: Date.now(),
          };
          onArchive(habit.id);
          onUndoNeeded(undoData);
        }
      }
      
      // Reset animations
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 150,
          friction: 8,
        }),
        Animated.timing(backgroundOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const getBackgroundColor = () => {
    return translateX.interpolate({
      inputRange: [-COMPLETION_THRESHOLD, 0, COMPLETION_THRESHOLD],
      outputRange: ['#ef4444', 'transparent', '#10b981'],
      extrapolate: 'clamp',
    });
  };

  const getIconOpacity = (isLeft: boolean) => {
    const range = isLeft ? [-COMPLETION_THRESHOLD, -SWIPE_THRESHOLD/2] : [SWIPE_THRESHOLD/2, COMPLETION_THRESHOLD];
    return translateX.interpolate({
      inputRange: range,
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
  };

  return (
    <View style={styles.container}>
      {/* Background with action indicators */}
      <Animated.View 
        style={[
          styles.background,
          {
            backgroundColor: getBackgroundColor(),
            opacity: backgroundOpacity,
          }
        ]}
      >
        {/* Left action (archive) */}
        <Animated.View style={[styles.leftAction, { opacity: getIconOpacity(true) }]}>
          <Text style={styles.actionIcon}>🗑️</Text>
          <Text style={styles.actionText}>Archive</Text>
        </Animated.View>
        
        {/* Right action (complete) */}
        <Animated.View style={[styles.rightAction, { opacity: getIconOpacity(false) }]}>
          <Text style={styles.actionIcon}>✅</Text>
          <Text style={styles.actionText}>Complete</Text>
        </Animated.View>
      </Animated.View>

      {/* Main card with gesture handling */}
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleStateChange}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-20, 20]}
      >
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <HabitCard
            habit={habit}
            isCompleted={isCompleted}
            onHapticFeedback={onHapticFeedback}
            onRefreshNeeded={onRefreshNeeded}
            onComplete={(habitId) => {
              const undoData: UndoAction = {
                type: 'complete',
                habitId: habit.id,
                habitName: habit.name,
                timestamp: Date.now(),
              };
              onComplete(habitId);
              onUndoNeeded(undoData);
            }}
          />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 12,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  leftAction: {
    alignItems: 'center',
  },
  rightAction: {
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContainer: {
    backgroundColor: 'transparent',
  },
});