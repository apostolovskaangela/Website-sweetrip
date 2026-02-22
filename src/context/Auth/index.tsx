import React, { createContext, useMemo } from "react";
import { useAuthLogic } from "./logic";
import { AuthContextType } from "./types";

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { state, login, logout, clearError, refreshUser, updateUser } = useAuthLogic();

    const value = useMemo<AuthContextType>(
        () => ({
            ...state,
            login,
            logout,
            clearError,
            refreshUser,
            updateUser,
        }),
        [state, login, logout, clearError, refreshUser, updateUser]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
