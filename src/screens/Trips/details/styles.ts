import { Dimensions, StyleSheet } from "react-native";
import type { MD3Theme } from "react-native-paper";
import { radius, space, type } from "@/src/theme/tokens";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginTop: 16 },
  editBtn: {
    backgroundColor: "hsl(217,91%,35%)",
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  updateBtn: {
    backgroundColor: "#16a34a",
    padding: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  updateBtnDisabled: {
    backgroundColor: "#86efac",
    opacity: 0.7,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
    fontStyle: "italic",
  },
  cmrImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: "#f0f0f0",
  },
  cmrActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    justifyContent: "center",
  },
  viewBtn: {
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 8,
    flex: 1,
  },
  viewBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  downloadBtn: {
    backgroundColor: "#16a34a",
    padding: 10,
    borderRadius: 8,
    flex: 1,
  },
  downloadBtnDisabled: {
    backgroundColor: "#86efac",
    opacity: 0.7,
  },
  downloadBtnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 8,
  },
  modalCloseText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100%",
    paddingVertical: 20,
  },
  modalImage: {
    width: screenWidth,
    height: screenHeight * 0.8,
    maxWidth: "100%",
  },
  modalActions: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  modalDownloadBtn: {
    backgroundColor: "#16a34a",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  modalDownloadBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statusPickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  statusPicker: {
    width: "100%",
  },
  card: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  }
});

export const makeThemedStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    contentFade: {
      marginTop: space.lg,
    },
    title: {
      fontSize: type.h1,
      fontWeight: "900",
      color: theme.colors.onBackground,
    },
    subtitle: {
      marginTop: 6,
      color: theme.colors.onSurfaceVariant,
    },
    sectionTitle: {
      fontSize: type.h2,
      fontWeight: "900",
      color: theme.colors.onBackground,
      marginBottom: 10,
    },
    detailsCard: {
      backgroundColor: theme.colors.elevation.level1,
      borderColor: theme.colors.outline,
      borderWidth: 1,
      borderRadius: radius.lg,
      padding: 14,
      marginBottom: space.lg,
    },
    detailsHeader: {
      fontWeight: "900",
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    detailsLine: {
      color: theme.colors.onSurfaceVariant,
    },
    stopCard: {
      padding: 12,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      backgroundColor: theme.colors.elevation.level1,
      marginBottom: 10,
    },
    stopText: {
      color: theme.colors.onSurface,
    },
    cmrTitle: {
      fontSize: type.h2,
      fontWeight: "900",
      color: theme.colors.onBackground,
      marginTop: space.lg,
    },
    cmrActionsRow: {
      flexDirection: "row",
      marginTop: 8,
      justifyContent: "center",
    },
    cmrActionLeft: {
      flex: 1,
      marginRight: 10,
    },
    cmrActionRight: {
      flex: 1,
    },
    statusPickerContainer: {
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: radius.md,
      overflow: "hidden",
      backgroundColor: theme.colors.elevation.level1,
      marginTop: 8,
      marginBottom: 8,
    },
    buttonMarginBottom: {
      marginBottom: space.md,
    },
    buttonMarginTop: {
      marginTop: space.md,
    },
  });
