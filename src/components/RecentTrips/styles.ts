import { StyleSheet } from "react-native";
import type { MD3Theme } from "react-native-paper";
import { space } from "@/src/theme/tokens";

export const makeStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    section: {
      marginVertical: space.sm,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 8,
      color: theme.colors.onBackground,
    },
    card: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.colors.elevation.level1,
      borderColor: theme.colors.outline,
      borderWidth: 1,
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.onSurface,
    },
    cardSubtitle: {
      fontSize: 14,
      marginTop: 2,
      color: theme.colors.onSurfaceVariant,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      minWidth: 80,
      alignItems: "center",
    },
    statusText: {
      fontWeight: "bold",
      fontSize: 12,
    },
  });

export const statusBadgeBg = (backgroundColor: string) => ({ backgroundColor } as const);
export const statusTextColor = (color: string) => ({ color } as const);
