import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

export interface AuthResponse {
    token: string;
    username: string;
    role: string;
}

export const authService = {
    async login(username: string, password: string): Promise<AuthResponse> {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                username,
                password
            });
            
            if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            
            return response.data;
        } catch (error: any) {
            throw error.response?.data || 'An error occurred during login';
        }
    },

    async register(username: string, password: string): Promise<AuthResponse> {
        try {
            const response = await axios.post(`${API_URL}/register`, {
                username,
                password
            });
            
            if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            
            return response.data;
        } catch (error: any) {
            throw error.response?.data || 'An error occurred during registration';
        }
    },

    logout(): void {
        localStorage.removeItem('user');
    },

    getCurrentUser(): AuthResponse | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getAuthHeader(): { Authorization?: string } {
        const user = this.getCurrentUser();
        return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
    }
};