import React from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "@/src/components/Login";
import Welcome from "@/src/screens/Welcome";
import { MainNavigator } from "@/src/navigation/MainNavigator";
import { RootStackParamList } from "@/src/navigation/types";
import { styles } from "./styles";
import { useAppNavigatorLogic } from "./logic";
import { AuthProvider } from "@/src/context/Auth";

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
  return (
    <SafeAreaView style={styles.container}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaView>
  );
}
