import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface DatabaseLoadingScreenProps {
  error?: string | null;
}

export const DatabaseLoadingScreen: React.FC<DatabaseLoadingScreenProps> = ({ error }) => {
  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Database Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Initializing database...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d73a49',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});