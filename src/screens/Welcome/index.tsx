import React from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/src/navigation/types";
import { styles } from "./styles";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { FadeIn } from "@/src/components/ui/FadeIn";
import { ThemeToggleButton } from "@/src/components/ui/ThemeToggleButton";
import { useTheme } from "react-native-paper";
import { getBrandGradient } from "@/src/theme/gradients";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export default function Welcome({ navigation }: Props) {
  const theme = useTheme();

  return (
    <LinearGradient
      colors={getBrandGradient(theme) as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.themeToggleContainer}>
        <ThemeToggleButton accessibilityLabel="Toggle theme" />
      </View>

      <View style={styles.contentWrapper}>
        <FadeIn fromY={14}>
          <Text accessibilityRole="header" style={styles.title}>
            Fleet Management
          </Text>
          <Text style={styles.subtitle}>Made Simple</Text>
        </FadeIn>

        <FadeIn fromY={18} durationMs={280} style={styles.fadeButtonWrapper}>
          <PrimaryButton
            onPress={() => navigation.navigate("Login")}
            accessibilityLabel="Login"
            accessibilityHint="Navigates to the login screen"
            style={[styles.button, styles.buttonCentered]}
            textColor="#0b1220"
          >
            Login
          </PrimaryButton>
        </FadeIn>
      </View>
    </LinearGradient>
  );
}
