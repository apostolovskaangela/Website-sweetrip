import { platformSelect } from "@/src/config/platform";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthProvider } from "@/src/context/Auth";
import { QueryProvider } from "@/src/lib/QueryProvider";
import Offline from '@/src/services/offline';
import { useEffect, useState } from "react";
import { AppState } from 'react-native';
import { initDatabase } from '@/src/services/db';
import { styles } from "./styles";
import * as dataService from '@/src/lib/sqlite/dataService';

const Stack = createNativeStackNavigator<RootStackParamList>();

function Loading() {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

function AppNavigator() {
  const { isLoading, isAuthenticated } = useAppNavigatorLogic();

  if (isLoading) return <Loading />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Dashboard" component={MainNavigator} />
      ) : (
        <>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Login" component={Login} />
        </>
      )}
    </Stack.Navigator>
  );
}
import { ThemeProvider } from "@/src/theme/ThemeProvider";
import { AppNavigator } from "@/src/navigation/AppNavigator";
import { RootStackParamList } from "@/src/navigation/types";

export default function App() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    // Initialize local database from db.json
    const initDb = async () => {
      try {
        console.log('📦 Initializing local database...');
        await dataService.initializeLocalDatabase();
        console.log('✅ Local database initialized successfully');
        setDbInitialized(true);
      } catch (error) {
        console.error('❌ Error initializing database:', error);
        // Continue anyway - app should still work
        setDbInitialized(true);
      }
    };

    initDb();
  }, []);

  useEffect(() => {
    if (!dbInitialized) return;

    // Start background sync for any queued offline requests
    Offline.startBackgroundSync();

    // Also trigger sync when app comes to foreground
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        Offline.processQueue().catch(() => {});
      }
    });

    return () => {
      sub.remove();
      Offline.stopBackgroundSync();
    };
  }, [dbInitialized]);

  if (!dbInitialized) {
    return <Loading />;
  }

  const safeAreaEdges = platformSelect({
    ios: ['top', 'left', 'right'] as const,
    android: ['top', 'left', 'right'] as const,
    default: ['top', 'left', 'right'] as const,
  });

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <ThemeProvider>
        <QueryProvider>
          <AuthProvider>
            <AppNavigator />
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </SafeAreaView>
  );
}
