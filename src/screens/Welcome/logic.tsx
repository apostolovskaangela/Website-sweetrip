import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useWelcomeLogic = () => {
  const navigation = useNavigation<any>();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("AUTH_TOKEN");
        setIsLoggedIn(!!token);
      } catch (err) {
        console.error(err);
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const handleStartTrial = () => {
    navigation.navigate("Login"); // go to Login screen
  };

  return { isLoggedIn, handleStartTrial };
};
