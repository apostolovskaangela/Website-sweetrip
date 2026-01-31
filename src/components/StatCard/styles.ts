import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  statCard: {
    width: "48%",
    marginBottom: 12,
    padding: 8,
    borderRadius: 12, // ensure rounded corners
  },
  statCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconWrapper: {
    marginRight: 8, // replaces gap for cross-platform consistency
  },
  statCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statCardValue: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statCardTrend: {
    fontSize: 14,
    fontWeight: "600",
  },
});
