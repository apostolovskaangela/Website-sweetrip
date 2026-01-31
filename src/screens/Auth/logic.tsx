import { useContext, useState } from "react";
import { AuthContext } from "@/src/context/Auth";

interface SnackbarState {
  visible: boolean;
  message: string;
}

export function useAuthLogic() {
  const auth = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    visible: false,
    message: "",
  });

  const showToast = (message: string) => {
    setSnackbar({ visible: true, message });
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleLogin = async (email: string, password: string) => {
    if (!auth) return;

    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address.");
      return;
    }

    if (password.length <= 6) {
      showToast("Password must be longer than 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await auth.login(email, password);
      showToast("Login successful!");
    } catch {
      showToast("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    snackbar,
    setSnackbar,
    handleLogin,
  };
}
