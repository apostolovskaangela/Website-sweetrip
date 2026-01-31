// /src/context/Auth/index.tsx
import React, { createContext } from "react";
import { AuthContextType } from "./types";
import { useAuthLogic } from "./logic";

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { state, login, register, logout, clearError, refreshUser, updateUser } = useAuthLogic();

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                register,
                logout,
                clearError,
                refreshUser,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
