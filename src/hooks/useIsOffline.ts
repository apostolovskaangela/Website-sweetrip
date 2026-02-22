import { subscribeInternetStatus } from "@/src/services/internetStatus";
import { useEffect, useState } from "react";

export function useIsOffline() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeInternetStatus(setIsOffline);
    return () => {
      // Ensure React effect cleanup returns void.
      unsubscribe();
    };
  }, []);

  return isOffline;
}

