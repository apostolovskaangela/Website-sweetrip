import { platformSelect, statusBarStyle } from "@/src/config/platform";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Login from "@/src/components/Login";
import { AuthProvider } from "@/src/context/Auth";
import { MainNavigator } from "@/src/navigation/MainNavigator";
import { RootStackParamList } from "@/src/navigation/types";
import Welcome from "@/src/screens/Welcome";
import Offline from '@/src/services/offline';
import { useEffect } from "react";
import { AppState } from 'react-native';
import { useAppNavigatorLogic } from "./logic";
import { styles } from "./styles";

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
  useEffect(() => {
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
  }, []);

  const safeAreaEdges = platformSelect({
    ios: ['top', 'left', 'right'] as const,
    android: ['top', 'left', 'right'] as const,
    default: ['top', 'left', 'right'] as const,
  });

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <StatusBar barStyle={statusBarStyle} backgroundColor="transparent" translucent={false} />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaView>
  );
}
