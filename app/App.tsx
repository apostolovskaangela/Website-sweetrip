import { platformSelect } from "@/src/config/platform";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthProvider } from "@/src/context/Auth";
import { QueryProvider } from "@/src/lib/QueryProvider";
import Offline from '@/src/services/offline';
import { useEffect } from "react";
import { AppState } from 'react-native';
import { initDatabase } from '@/src/services/db';
import { styles } from "./styles";
import { ThemeProvider } from "@/src/theme/ThemeProvider";
import { AppNavigator } from "@/src/navigation/AppNavigator";

export default function App() {
  useEffect(() => {
    // Initialize local SQLite database (seeded from api/db.json on first run)
    initDatabase().catch((e) => {
      console.error('Failed to init SQLite DB', e);
    });

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
