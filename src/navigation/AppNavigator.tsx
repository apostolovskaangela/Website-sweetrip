import React, { useContext } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../context/Auth";
import { MainNavigator } from "./MainNavigator";
import Welcome from "../screens/Welcome";
import Login from "../components/Login";
import { RootStackParamList } from "./types";
import { AuthContextType } from "../context/Auth/types";

// Loading screen extracted for separation of concerns
const LoadingScreen: React.FC = () => (
  <View style={styles.loaderContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
  </View>
);

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const auth = useContext(AuthContext) as AuthContextType | null;

  if (!auth) {
    console.warn("AuthContext is null!");
    return <LoadingScreen />;
  }

  const { isLoading, isAuthenticated } = auth;

  if (isLoading) {
    return <LoadingScreen />;
  }

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
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
