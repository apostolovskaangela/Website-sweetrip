import { StyleSheet } from "react-native";
import type { MD3Theme } from "react-native-paper";
import { space, type } from "@/src/theme/tokens";

export const makeStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      marginBottom: space.xl,
    },
    title: {
      fontWeight: "800",
      fontSize: type.title,
      color: theme.colors.onBackground,
    },
    subtitle: {
      marginTop: 4,
      color: theme.colors.onSurfaceVariant,
    },
    statsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: space.xl,
    },
  });
