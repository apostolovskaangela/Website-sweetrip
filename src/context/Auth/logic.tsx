import { queryClient } from "@/src/lib/queryClient";
import { useCallback, useEffect, useState } from "react";
import { AuthRepository } from "./repository";
import { AuthState, User } from "./types";
import {
    stopUserForegroundTracking,
} from "@/src/services/location/foregroundTracking";

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
                } else {
                    setState(prev => ({ ...prev, isLoading: false }));
                }
            } catch {
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

            setState({ isAuthenticated: true, token, user, isLoading: false, error: null });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Login failed";
            setState({ isAuthenticated: false, token: null, user: null, isLoading: false, error: message });
            throw error;
        }
    }, []);

    // const register = useCallback(async (email: string, password: string, name?: string) => {
    //     await login(email, password);
    // }, [login]);

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

    return { state, login, logout, clearError, refreshUser, updateUser };
};
