// js/auth.js - Django Backend Authentication
const API_BASE_URL = 'http://127.0.0.1:8000/api';

window.authSystem = {
    // Check if user is authenticated
    isAuthenticated() {
        return !!sessionStorage.getItem('userToken') || !!sessionStorage.getItem('userType');
    },

    // Get current user
    getCurrentUser() {
        const userStr = sessionStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Get user type
    getUserType() {
        return sessionStorage.getItem('userType') || 'customer';
    },

    // Login function
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: email,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success && data.user) {
                // Store user data
                sessionStorage.setItem('userToken', 'authenticated');
                sessionStorage.setItem('currentUser', JSON.stringify(data.user));
                sessionStorage.setItem('userEmail', data.user.email);
                sessionStorage.setItem('userName', data.user.username);
                sessionStorage.setItem('userType', data.user.is_staff ? 'admin' : 'customer');

                return {
                    success: true,
                    user: data.user
                };
            }

            return {
                success: false,
                error: data.error || 'Login failed'
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'Connection error - please check if backend is running'
            };
        }
    },

    // Logout function
    async logout() {
        try {
            await fetch(`${API_BASE_URL}/auth/logout/`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout error:', error);
        }

        // Clear all session data
        sessionStorage.clear();
        localStorage.removeItem('userToken');
        localStorage.removeItem('currentUser');
        
        // Redirect to homepage
        window.location.href = 'index.html';
    },

    // Register function
    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (data.success) {
                sessionStorage.setItem('userToken', 'authenticated');
                sessionStorage.setItem('currentUser', JSON.stringify(data.user));
                sessionStorage.setItem('userType', 'customer');
                return { success: true, user: data.user };
            }

            return {
                success: false,
                error: data.errors || 'Registration failed'
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: 'Connection error'
            };
        }
    }
};

console.log('Auth system loaded with Django backend');