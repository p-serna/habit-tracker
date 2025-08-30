import { useState, useRef, useCallback } from 'react';
import { UndoAction } from '@/components/UndoToast';

interface UndoState {
  pendingAction: UndoAction | null;
  timeoutId: NodeJS.Timeout | null;
}

export default function useUndoState() {
  const [undoState, setUndoState] = useState<UndoState>({
    pendingAction: null,
    timeoutId: null,
  });

  const startUndoTimer = useCallback((action: UndoAction, onTimeout: () => void) => {
    // Clear any existing timeout
    if (undoState.timeoutId) {
      clearTimeout(undoState.timeoutId);
    }

    // Set new timeout for 5 seconds
    const timeoutId = setTimeout(() => {
      onTimeout();
      setUndoState({
        pendingAction: null,
        timeoutId: null,
      });
    }, 5000);

    setUndoState({
      pendingAction: action,
      timeoutId,
    });
  }, [undoState.timeoutId]);

  const cancelUndoTimer = useCallback(() => {
    if (undoState.timeoutId) {
      clearTimeout(undoState.timeoutId);
    }
    setUndoState({
      pendingAction: null,
      timeoutId: null,
    });
  }, [undoState.timeoutId]);

  const executeUndo = useCallback(() => {
    const action = undoState.pendingAction;
    cancelUndoTimer();
    return action;
  }, [undoState.pendingAction, cancelUndoTimer]);

  return {
    pendingAction: undoState.pendingAction,
    isUndoActive: undoState.pendingAction !== null,
    startUndoTimer,
    cancelUndoTimer,
    executeUndo,
  };
}