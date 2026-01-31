import { AuthContext } from "@/src/context/Auth";
import { useContext } from "react";

export function useAppNavigatorLogic() {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("AuthContext is missing. Make sure AuthProvider wraps AppNavigator.");
  }

  const { isLoading, isAuthenticated } = auth;

  return { isLoading, isAuthenticated };
}
