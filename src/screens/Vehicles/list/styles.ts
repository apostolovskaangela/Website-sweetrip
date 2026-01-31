// src/screens/Vehicles/list/styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  listContent: { paddingBottom: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { color: "#6b7280" },
  createBtn: { backgroundColor: "hsl(217,91%,35%)", padding: 10, borderRadius: 8 },
  createText: { color: "#fff", fontWeight: "600", padding: 4 },
  card: { backgroundColor: "#fff", padding: 14, marginBottom: 12, borderRadius: 10 },
  active: { color: "green", marginTop: 4 },
  inactive: { color: "gray", marginTop: 4 },
});
