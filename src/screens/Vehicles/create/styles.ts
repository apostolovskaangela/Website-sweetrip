import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  error: { color: "red", marginBottom: 10, fontWeight: "600" },
});
