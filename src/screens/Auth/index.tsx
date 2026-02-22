import React, { useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, View, ScrollView } from "react-native";
import {
  Card,
  Text,
  TextInput,
  Snackbar,
  useTheme,
} from "react-native-paper";
import { makeStyles } from "./styles";
import { useAuthLogic } from "./logic";
import { LinearGradient } from "expo-linear-gradient";
import { TruckIcon } from "@/src/components/TruckIcon";
import { FadeIn } from "@/src/components/ui/FadeIn";
import { PrimaryButton } from "@/src/components/ui/PrimaryButton";
import { getBrandGradient } from "@/src/theme/gradients";
import { ThemeToggleButton } from "@/src/components/ui/ThemeToggleButton";

interface AuthScreenProps {
  initialTab?: "login";
}

export default function AuthScreen({ initialTab = "login" }: AuthScreenProps) {
  const [tab] = useState<"login">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<any>(null);
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const { isLoading, snackbar, setSnackbar, handleLogin } = useAuthLogic();

  return (
    <LinearGradient
      colors={getBrandGradient(theme) as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <KeyboardAvoidingView style={styles.keyboardAvoider} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.contentContainerStyle} keyboardShouldPersistTaps="handled">
          <View style={styles.themeToggleContainer}>
            <ThemeToggleButton accessibilityLabel="Toggle theme" />
          </View>

          <FadeIn fromY={16} style={styles.fadeContainer}>
            <Card style={styles.card}>
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <TruckIcon size={48} color="white" />
                </View>

                <Text accessibilityRole="header" style={styles.title}>
                  Sweetrip
                </Text>
                <Text style={styles.description}>
                  Fleet management made simple
                </Text>
              </View>

              {tab === "login" && (
                <View>
                  <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    contentStyle={styles.inputContent}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    textContentType="emailAddress"
                    autoFocus
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus?.()}
                    outlineColor={theme.colors.outline}
                    activeOutlineColor={theme.colors.primary}
                  />

                  <TextInput
                    ref={passwordRef}
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    contentStyle={styles.inputContent}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    textContentType="password"
                    returnKeyType="done"
                    onSubmitEditing={() => handleLogin(email, password)}
                    outlineColor={theme.colors.outline}
                    activeOutlineColor={theme.colors.primary}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? "eye-off" : "eye"}
                        accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                        onPress={() => setShowPassword((prev) => !prev)}
                      />
                    }
                  />

                  <PrimaryButton
                    onPress={() => handleLogin(email, password)}
                    loading={isLoading}
                    accessibilityRole="button"
                    accessibilityLabel="Login"
                    style={styles.primaryButton}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </PrimaryButton>
                </View>
              )}
            </Card>
          </FadeIn>

          <Snackbar
            visible={snackbar.visible}
            onDismiss={() =>
              setSnackbar({ ...snackbar, visible: false })
            }
            duration={3000}
          >
            {snackbar.message}
          </Snackbar>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
