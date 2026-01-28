import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f7fa", // light gradient alternative
  },
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
    backgroundColor: "gray",
    borderRadius: 16,
    overflow: "hidden",
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
  form: {
    marginTop: 16,
  },
  input: {
    // marginBottom: 12,
    backgroundColor: '#EBEBEB',
  },
  button: {
    marginTop: 12,
    backgroundColor: '#333333'
  },
  contentContainerStyle: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  
});
