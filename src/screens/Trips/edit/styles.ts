import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: "hsl(217,91%,35%)",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  submitBtnDisabled: {
    backgroundColor: "#86efac",
    opacity: 0.7,
  },
  submitText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  statusOption: {
    padding: 8,
    marginRight: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  statusOptionSelected: {
    backgroundColor: "#3b82f6",
  },
  statusText: { color: "#000", fontWeight: "600" },
});
