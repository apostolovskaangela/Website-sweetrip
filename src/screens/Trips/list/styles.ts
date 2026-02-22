import { StyleSheet } from "react-native";
import type { MD3Theme } from "react-native-paper";
import { radius, space, type } from "@/src/theme/tokens";

export const makeStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    loading: {
      flex: 1,
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
    listContent: {
      paddingBottom: 96
    },
    tripCard: {
      backgroundColor: theme.colors.elevation.level1,
      borderColor: theme.colors.outline,
      borderWidth: 1,
      borderRadius: radius.lg,
      padding: 14,
      marginBottom: 12,
    },
    tripRoute: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.onSurface,
    },
    tripStatus: {
      marginTop: 6,
      color: theme.colors.primary,
      fontWeight: "700",
    },
    tripMeta: {
      marginTop: 8,
    },
    tripMetaText: {
      color: theme.colors.onSurfaceVariant,
    },
  });
