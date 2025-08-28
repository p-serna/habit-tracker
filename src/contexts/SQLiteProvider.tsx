import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { databaseService, DatabaseService } from '../services/database';
import { DatabaseLoadingScreen } from '../components/DatabaseLoadingScreen';

interface SQLiteContextType {
  db: DatabaseService;
  isInitialized: boolean;
  error: string | null;
}

const SQLiteContext = createContext<SQLiteContextType | null>(null);

export const useSQLiteContext = (): SQLiteContextType => {
  const context = useContext(SQLiteContext);
  if (!context) {
    throw new Error('useSQLiteContext must be used within a SQLiteProvider');
  }
  return context;
};

interface SQLiteProviderProps {
  children: ReactNode;
}

export const SQLiteProvider: React.FC<SQLiteProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await databaseService.initialize();
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize database');
      }
    };

    initializeDatabase();
  }, []);

  const contextValue: SQLiteContextType = {
    db: databaseService,
    isInitialized,
    error,
  };

  // Show loading screen while database is initializing
  if (!isInitialized && !error) {
    return <DatabaseLoadingScreen />;
  }

  // Show error screen if database initialization failed
  if (error) {
    return <DatabaseLoadingScreen error={error} />;
  }

  return (
    <SQLiteContext.Provider value={contextValue}>
      {children}
    </SQLiteContext.Provider>
  );
};