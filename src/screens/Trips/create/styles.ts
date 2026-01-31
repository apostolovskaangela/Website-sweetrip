import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#f5f7fa" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  submitBtn: {
    backgroundColor: "hsl(217,91%,35%)",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  submitText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  label: { color: "gray", paddingBottom: 2 },
  error: { color: "red", marginBottom: 6 },
});
