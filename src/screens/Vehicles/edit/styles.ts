import { StyleSheet } from "react-native";
import type { MD3Theme } from "react-native-paper";
import { radius, space, type } from "@/src/theme/tokens";

export const makeStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    restrictedText: {
      color: theme.colors.onSurfaceVariant,
    },
    restrictedButton: {
      marginTop: space.lg,
    },
    loadingCenter: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      fontSize: type.h1,
      fontWeight: "900",
      color: theme.colors.onBackground,
    },
    subtitle: {
      marginTop: 4,
      color: theme.colors.onSurfaceVariant,
    },
    formFade: {
      marginTop: space.lg,
    },
    errorCard: {
      padding: 12,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.elevation.level1,
      marginBottom: space.md,
    },
    errorText: {
      color: theme.colors.error,
    },
    input: {
      marginBottom: space.md,
      backgroundColor: theme.colors.elevation.level1,
    },
    switchRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 12,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.elevation.level1,
      marginBottom: space.lg,
    },
    switchLabel: {
      fontWeight: "800",
      color: theme.colors.onSurface,
    },
  });
