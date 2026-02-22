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
    errorText: {
      color: theme.colors.error,
    },
    notFoundText: {
      color: theme.colors.onSurfaceVariant,
    },
    title: {
      fontSize: type.h1,
      fontWeight: "900",
      color: theme.colors.onBackground,
    },
    activeStatus: {
      marginTop: 6,
      fontWeight: "700",
      color: "#16a34a",
    },
    inactiveStatus: {
      marginTop: 6,
      fontWeight: "700",
      color: theme.colors.onSurfaceVariant,
    },
    formFade: {
      marginTop: space.lg,
    },
    notesCard: {
      backgroundColor: theme.colors.elevation.level1,
      borderColor: theme.colors.outline,
      borderWidth: 1,
      borderRadius: radius.lg,
      padding: 14,
    },
    notesTitle: {
      fontWeight: "800",
      color: theme.colors.onSurface,
    },
    notesBody: {
      marginTop: 6,
      color: theme.colors.onSurfaceVariant,
    },
    editButton: {
      marginTop: space.lg,
    },
  });

