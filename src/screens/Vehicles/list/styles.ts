import { StyleSheet } from "react-native";
import type { MD3Theme } from "react-native-paper";
import { radius, space, type } from "@/src/theme/tokens";

export const makeStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    loading: {
      flex: 1,
    },
    restrictedText: {
      color: theme.colors.onSurfaceVariant,
    },
    restrictedButton: {
      marginTop: space.lg,
    },
    errorCard: {
      padding: 12,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.elevation.level1,
    },
    errorText: {
      color: theme.colors.error,
      marginBottom: 10,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: space.lg,
    },
    headerLeft: {
      flex: 1,
    },
    title: {
      fontSize: type.h1,
      fontWeight: "800",
      color: theme.colors.onBackground,
    },
    subtitle: {
      marginTop: 2,
      color: theme.colors.onSurfaceVariant,
    },
    newButtonContent: {
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    listContent: {
      paddingBottom: 24,
    },
    card: {
      backgroundColor: theme.colors.elevation.level1,
      borderColor: theme.colors.outline,
      borderWidth: 1,
      borderRadius: radius.lg,
      padding: 14,
      marginBottom: 12,
    },
    regNumber: {
      fontSize: 16,
      fontWeight: "800",
      color: theme.colors.onSurface,
    },
    activeText: {
      marginTop: 6,
      fontWeight: "700",
      color: "#16a34a",
    },
    inactiveText: {
      marginTop: 6,
      fontWeight: "700",
      color: theme.colors.onSurfaceVariant,
    },
    notesText: {
      marginTop: 6,
      color: theme.colors.onSurfaceVariant,
    },
  });
