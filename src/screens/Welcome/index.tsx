import React from "react";
import { Text, View, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/src/navigation/types";
import { styles } from "./styles";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { FadeIn } from "@/src/components/ui/FadeIn";
import { ThemeToggleButton } from "@/src/components/ui/ThemeToggleButton";
import { useTheme } from "react-native-paper";
import { getBrandGradient } from "@/src/theme/gradients";
import { Feather } from "@expo/vector-icons";

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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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

          {/* Feature grid */}
          <FadeIn fromY={20} durationMs={320} style={styles.featuresGrid}>
            {/* Real-Time Tracking */}
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Feather name="map-pin" size={28} color="#00ffcc" />
              </View>
              <Text style={styles.featureTitle}>Real-Time Tracking</Text>
              <Text style={styles.featureDesc}>
                Monitor your entire fleet on a live map. Know exactly where every vehicle is, every moment.
              </Text>
            </View>

            {/* Smart Analytics */}
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Feather name="trending-up" size={28} color="#00ffcc" />
              </View>
              <Text style={styles.featureTitle}>Smart Analytics</Text>
              <Text style={styles.featureDesc}>
                Data-driven insights to optimize routes, reduce costs, and improve efficiency.
              </Text>
            </View>

            {/* Enterprise Security */}
            <View style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Feather name="shield" size={28} color="#00ffcc" />
              </View>
              <Text style={styles.featureTitle}>Enterprise Security</Text>
              <Text style={styles.featureDesc}>
                Bank-level security to protect your fleet data and ensure compliance.
              </Text>
            </View>
          </FadeIn>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
