import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';

export interface UndoAction {
  type: 'complete' | 'archive' | 'uncomplete';
  habitId: string;
  habitName: string;
  timestamp: number;
  originalData?: any;
}

interface UndoToastProps {
  action: UndoAction | null;
  onUndo: () => void;
  onDismiss: () => void;
  visible: boolean;
}

export default function UndoToast({ action, onUndo, onDismiss, visible }: UndoToastProps) {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide up animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide down animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, opacity]);

  if (!action) return null;

  const getActionText = () => {
    switch (action.type) {
      case 'complete':
        return `Completed "${action.habitName}"`;
      case 'archive':
        return `Archived "${action.habitName}"`;
      case 'uncomplete':
        return `Unmarked "${action.habitName}"`;
      default:
        return 'Action performed';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.actionText}>{getActionText()}</Text>
        <View style={styles.buttons}>
          <TouchableOpacity 
            style={styles.undoButton} 
            onPress={onUndo}
            accessibilityLabel={`Undo ${action.type} action for ${action.habitName}`}
            accessibilityRole="button"
          >
            <Text style={styles.undoButtonText}>UNDO</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.dismissButton} 
            onPress={onDismiss}
            accessibilityLabel="Dismiss undo notification"
            accessibilityRole="button"
          >
            <Text style={styles.dismissButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  content: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionText: {
    color: '#f9fafb',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  undoButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  undoButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  dismissButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButtonText: {
    color: '#9ca3af',
    fontSize: 18,
    fontWeight: '500',
  },
});