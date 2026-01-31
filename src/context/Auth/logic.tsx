// /src/context/Auth/logic.tsx
import { useState, useEffect } from "react";
import { AuthRepository } from "./repository";
import { AuthState, User } from "./types";

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
            } catch (err) {
                setState(prev => ({ ...prev, isLoading: false }));
            }
        })();
    }, []);

    const login = async (email: string, password: string) => {
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
    };

    const register = async (email: string, password: string, name?: string) => {
        // call API or delegate to login for now
        await login(email, password);
    };

    const logout = async () => {
        try {
            await AuthRepository.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            await AuthRepository.clear();
            setState({ isAuthenticated: false, token: null, user: null, isLoading: false, error: null });
        }
    };

    const clearError = () => setState(prev => ({ ...prev, error: null }));

    const refreshUser = async () => {
        if (!state.token) return;
        try {
            const user = await AuthRepository.fetchUser();
            await AuthRepository.saveUser(user);
            setState(prev => ({ ...prev, user }));
        } catch (error) {
            console.error("Refresh user error:", error);
        }
    };

    const updateUser = async (userData: Partial<User>) => {
        if (!state.user) return;
        const updatedUser = { ...state.user, ...userData };
        await AuthRepository.saveUser(updatedUser);
        setState(prev => ({ ...prev, user: updatedUser }));
    };

    return { state, login, register, logout, clearError, refreshUser, updateUser };
};
