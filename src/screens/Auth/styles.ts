import { StyleSheet } from "react-native";
import type { MD3Theme } from "react-native-paper";
import { radius } from "@/src/theme/tokens";

export const makeStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    keyboardAvoider: {
      flex: 1,
    },
    themeToggleContainer: {
      position: "absolute",
      top: 10,
      right: 10,
      zIndex: 10,
    },
    fadeContainer: {
      width: "100%",
      maxWidth: 520,
    },
    card: {
      width: "100%",
      padding: 16,
      backgroundColor: theme.colors.elevation.level2,
      borderColor: theme.colors.outline,
      borderWidth: 1,
      borderRadius: radius.xl,
    },
    header: {
      alignItems: "center",
      marginBottom: 16,
    },
    logoContainer: {
      width: 80,
      height: 80,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      textAlign: "center",
      color: theme.colors.onSurface,
    },
    description: {
      textAlign: "center",
      marginBottom: 16,
      color: theme.colors.onSurfaceVariant,
    },
    input: {
      marginBottom: 12,
      backgroundColor: theme.colors.elevation.level1,
    },
    inputContent: {
      paddingLeft: 2,
    },
    primaryButton: {
      marginTop: 12,
    },
    contentContainerStyle: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
    },
  });
