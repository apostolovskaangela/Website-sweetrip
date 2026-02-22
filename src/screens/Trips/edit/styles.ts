import { StyleSheet } from "react-native";
import type { MD3Theme } from "react-native-paper";
import { space } from "@/src/theme/tokens";

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
  });
