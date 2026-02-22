import { StyleSheet } from "react-native";
import type { MD3Theme } from "react-native-paper";
import { radius, space } from "@/src/theme/tokens";

export const makeStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    headerTitle: {
      fontWeight: "800",
      color: theme.colors.onBackground,
    },
    headerSubtitle: {
      marginTop: 4,
      color: theme.colors.onSurfaceVariant,
    },
    formFade: {
      marginTop: space.lg,
    },
    input: {
      marginBottom: space.md,
      backgroundColor: theme.colors.elevation.level1,
    },
    amountInput: {
      marginBottom: space.lg,
      backgroundColor: theme.colors.elevation.level1,
    },
    dateSection: {
      marginBottom: space.md,
    },
    dateLabel: {
      marginBottom: 6,
      fontWeight: "700",
      color: theme.colors.onSurface,
    },
    dateButton: {
      borderRadius: radius.md,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: radius.md,
      overflow: "hidden",
      backgroundColor: theme.colors.elevation.level1,
      marginBottom: space.md,
    },
    pickerLabel: {
      paddingHorizontal: 12,
      paddingTop: 10,
      fontWeight: "700",
      color: theme.colors.onSurface,
    },
  });
