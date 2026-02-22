import { cardShadow } from "@/src/utils/platformStyles";
import { StyleSheet } from "react-native";
import type { MD3Theme } from "react-native-paper";

export const makeStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    card: {
      width: "48%",
      marginBottom: 12,
      padding: 8,
      borderRadius: 12,
      backgroundColor: theme.colors.elevation.level1,
      borderColor: theme.colors.outline,
      borderWidth: 1,
      ...cardShadow(2),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    iconWrapper: {
      marginRight: 8,
    },
    title: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colors.onSurface,
    },
    value: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 4,
      color: theme.colors.onSurface,
    },
    trend: {
      fontSize: 14,
      fontWeight: "600",
    },
    trendUp: {
      color: "#bff2bf",
    },
    trendDown: {
      color: "#f7665e",
    },
    trendNeutral: {
      color: "#000",
    },
  });
