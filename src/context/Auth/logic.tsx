// /src/context/Auth/logic.tsx
import { queryClient } from "@/src/lib/queryClient";
import { useCallback, useEffect, useState } from "react";
import { AuthRepository } from "./repository";
import { AuthState, User } from "./types";
import {
    startUserForegroundTracking,
    stopUserForegroundTracking,
} from "@/src/services/location/foregroundTracking";
import * as Location from "expo-location";
import { Alert, Linking } from "react-native";

async function promptLocationSharingEveryLogin(): Promise<boolean> {
    // Always show an in-app prompt, since OS prompts might not appear after the first decision.
    return new Promise((resolve) => {
        Alert.alert(
            "Share Location",
            "Allow location sharing so others can see your initials on Live Tracking (Find My style)?",
            [
                { text: "Not now", style: "cancel", onPress: () => resolve(false) },
                { text: "Allow", onPress: () => resolve(true) },
            ],
            { cancelable: true, onDismiss: () => resolve(false) }
        );
    });
}

async function ensureLocationTrackingStarted(): Promise<void> {
    const current = await Location.getForegroundPermissionsAsync();
    if (current.status === "granted") {
        await startUserForegroundTracking();
        return;
    }

    const allowedInApp = await promptLocationSharingEveryLogin();
    if (!allowedInApp) return;

    const requested = await Location.requestForegroundPermissionsAsync();
    if (requested.status === "granted") {
        await startUserForegroundTracking();
        return;
    }

    Alert.alert(
        "Location Permission Required",
        "Location sharing is off. To enable it, open settings and allow Location access.",
        [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
        ]
    );
}

export const useAuthLogic = () => {
    const [state, setState] = useState<AuthState>({
        isAuthenticated: false,
        token: null,
        user: null,
        isLoading: true,
        error: null,
    });

    // Restore session on mount
    useEffect(() => {
        (async () => {
            try {
                const token = await AuthRepository.getToken();
                const user = await AuthRepository.getUser();

                if (token && user) {
                    setState({
                        isAuthenticated: true,
                        token,
                        user,
                        isLoading: false,
                        error: null,
                    });

                    // Treat session restore as a login for permission behavior.
                    // (Required: ask every time someone "logs in".)
                    ensureLocationTrackingStarted().catch(() => {});
                } else {
                    setState(prev => ({ ...prev, isLoading: false }));
                }
            } catch (err) {
                setState(prev => ({ ...prev, isLoading: false }));
            }
        })();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const { token, user } = await AuthRepository.login(email, password);
            await AuthRepository.saveToken(token);
            await AuthRepository.saveUser(user);

            // Ask for location permissions on every login (per requirement).
            try {
                await ensureLocationTrackingStarted();
            } catch (e) {
                // Don't block login if permissions fail
                if (__DEV__) console.warn("Location permission/tracking setup failed", e);
            }

            setState({ isAuthenticated: true, token, user, isLoading: false, error: null });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Login failed";
            setState({ isAuthenticated: false, token: null, user: null, isLoading: false, error: message });
            throw error;
        }
    }, []);

    const register = useCallback(async (email: string, password: string, name?: string) => {
        await login(email, password);
    }, [login]);

    const logout = useCallback(async () => {
        try {
            await AuthRepository.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            stopUserForegroundTracking();
            await AuthRepository.clear();
            queryClient.clear();
            setState({ isAuthenticated: false, token: null, user: null, isLoading: false, error: null });
        }
    }, []);

    const clearError = useCallback(() => setState(prev => ({ ...prev, error: null })), []);

    const refreshUser = useCallback(async () => {
        const token = await AuthRepository.getToken();
        if (!token) return;
        try {
            const user = await AuthRepository.fetchUser();
            await AuthRepository.saveUser(user);
            setState(prev => ({ ...prev, user }));
        } catch (error) {
            console.error("Refresh user error:", error);
        }
    }, []);

    const updateUser = useCallback(async (userData: Partial<User>) => {
        setState(prev => {
            if (!prev.user) return prev;
            const updatedUser = { ...prev.user, ...userData };
            AuthRepository.saveUser(updatedUser).catch(console.error);
            return { ...prev, user: updatedUser };
        });
    }, []);

    return { state, login, register, logout, clearError, refreshUser, updateUser };
};
