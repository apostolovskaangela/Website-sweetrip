export interface User {
    id: string | number;
    name?: string;
    email: string;
    avatar?: string;
    roles?: string[];
}

export interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    user: User | null;
    isLoading: boolean;
    error: string | null;
}

export interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
    refreshUser: () => Promise<void>;
    updateUser: (userData: Partial<User>) => Promise<void>;
}
