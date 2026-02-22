import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "@/src/services/api";
import { User } from "./types";

const STORAGE_KEYS = {
    TOKEN: "AUTH_TOKEN",
    USER: "USER_DATA",
};

export const AuthRepository = {
    async saveToken(token: string) {
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    },

    async getToken(): Promise<string | null> {
        return AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    },

    async saveUser(user: User) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    },

    async getUser(): Promise<User | null> {
        const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        return userStr ? JSON.parse(userStr) : null;
    },

    async clear(): Promise<void> {
        await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    },

    async login(email: string, password: string): Promise<{ token: string; user: User }> {
        const response = await authApi.login({ email, password });
        const user: User = {
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            roles: response.user.roles,
        };
        return { token: response.token, user };
    },

    async logout(): Promise<void> {
        await authApi.logout();
    },

    async fetchUser(): Promise<User> {
        const data = await authApi.getUser();
        return {
            id: data.id,
            name: data.name,
            email: data.email,
            roles: data.roles,
        };
    },
};
