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
  },
  submitText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  label: {
    color: 'gray',
    paddingBottom: 2
  }
});
