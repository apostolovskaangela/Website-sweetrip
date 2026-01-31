import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 400,
    padding: 16,
  },
  logoContainer: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#001F3F",
    borderRadius: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  description: {
    textAlign: "center",
    marginBottom: 16,
    color: "#555",
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#EBEBEB",
  },
  button: {
    marginTop: 12,
    backgroundColor: "#001F3F",
  },
  contentContainerStyle: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
});
