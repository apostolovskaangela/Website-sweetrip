import { RootStackParamList } from "@/app/App";
import { AuthContext } from "@/src/context/AuthContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { useContext, useState } from "react";

export function useAuthLogic(navigation:StackNavigationProp<RootStackParamList>) {
  const auth = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: "",
  });

  const showToast = (message: string) => setSnackbar({ visible: true, message });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // const passwordRegex =
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleLogin = async (email: string, password: string) => {
    if (!auth) return;

    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address.");
      return;
    }

    // if (!passwordRegex.test(password)) {
    //   showToast(
    //     "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character."
    //   );
    //   return;
    // }

    if (password.length <= 6) {
      showToast("Password must be longer than 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await auth.login(email, password); // <-- call AuthContext login with password
      showToast("Login successful!"); // AppNavigator will now show Dashboard
    } catch (e) {
      showToast("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, snackbar, setSnackbar, handleLogin };
}
