import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import router from '../router';

export function setupInterceptors() {
    // Request interceptor
    axios.interceptors.request.use(
        (config) => {
            const authStore = useAuthStore();
            if (authStore.token) {
                config.headers.Authorization = `Bearer ${authStore.token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor
    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            if (error.response) {
                const authStore = useAuthStore();

                // Handle 401 Unauthorized errors - token expired or invalid
                if (error.response.status === 401) {
                    authStore.logout();
                    router.push({ name: 'Login', query: { message: 'Your session has expired. Please log in again.' } });
                }

                // Handle 403 Forbidden errors - insufficient permissions
                if (error.response.status === 403) {
                    router.push({ name: 'Dashboard', query: { message: 'You do not have permission to access this resource.' } });
                }
            }

            return Promise.reject(error);
        }
    );
}