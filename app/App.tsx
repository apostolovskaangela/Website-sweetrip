import { platformSelect, statusBarStyle } from "@/src/config/platform";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Login from "@/src/components/Login";
import { AuthProvider } from "@/src/context/Auth";
import { QueryProvider } from "@/src/lib/QueryProvider";
import { MainNavigator } from "@/src/navigation/MainNavigator";
import { RootStackParamList } from "@/src/navigation/types";
import Welcome from "@/src/screens/Welcome";
import Offline from '@/src/services/offline';
import { useEffect, useState } from "react";
import { AppState } from 'react-native';
import { useAppNavigatorLogic } from "./logic";
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
      <StatusBar barStyle={statusBarStyle} backgroundColor="transparent" translucent={false} />
      <QueryProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </QueryProvider>
    </SafeAreaView>
  );
}
