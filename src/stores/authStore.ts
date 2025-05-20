// src/stores/authStore.ts
import { defineStore } from 'pinia';
import axios from 'axios';
import { useRecipeStore } from './recipeStore';

export interface User {
    id: number;
    username: string;
    name: string;
    email: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    name: string;
    email: string;
    password: string;
}

export interface AuthState {
    token: string | null;
    user: User | null;
    loading: boolean;
    error: string | null;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://recipemanager-c0033f7f55ed.herokuapp.com';

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        token: localStorage.getItem('token'),
        user: JSON.parse(localStorage.getItem('user') || 'null'),
        loading: false,
        error: null
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        currentUser: (state) => state.user
    },

    actions: {
        async login(loginRequest: LoginRequest) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.post(`${API_URL}/auth/login`, loginRequest);
                this.setAuthData(response.data.token, response.data.user);
                return response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Login failed. Please check your credentials.';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async register(registerRequest: RegisterRequest) {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.post(`${API_URL}/auth/register`, registerRequest);
                this.setAuthData(response.data.token, response.data.user);
                return response.data;
            } catch (err: any) {
                this.error = err.response?.data?.message || 'Registration failed. Please try again.';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            this.token = null;
            this.user = null;

            // Reset recipe store
            const recipeStore = useRecipeStore();
            recipeStore.$reset();
        },

        setAuthData(token: string, user: User) {
            this.token = token;
            this.user = user;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        }
    }
});