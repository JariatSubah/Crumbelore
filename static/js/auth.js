// js/auth.js - Django Backend Authentication
const API_BASE_URL = 'http://127.0.0.1:8000/api';

window.authSystem = {
    // Check if user is authenticated
    isAuthenticated() {
        return !!(sessionStorage.getItem('userToken') || localStorage.getItem('userToken'));
    },

    // Get current user
    getCurrentUser() {
        const userStr = sessionStorage.getItem('userData') || localStorage.getItem('userData');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Get user type
    getUserType() {
        const userData = this.getCurrentUser();
        if (userData) {
            return userData.is_staff ? 'admin' : 'customer';
        }
        return sessionStorage.getItem('userType') || 'customer';
    },

    // Login function
    async login(email, password, userType = 'customer') {
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
            
            if (data.success && data.token) {
                // Store authentication token
                sessionStorage.setItem('userToken', data.token);
                localStorage.setItem('userToken', data.token);
                
                // Store user data
                sessionStorage.setItem('userData', JSON.stringify(data.user));
                localStorage.setItem('userData', JSON.stringify(data.user));
                
                // Store customer data if available
                if (data.customer) {
                    sessionStorage.setItem('customerData', JSON.stringify(data.customer));
                    localStorage.setItem('customerData', JSON.stringify(data.customer));
                }
                
                // Store user type
                const type = data.user.is_staff ? 'admin' : 'customer';
                sessionStorage.setItem('userType', type);
                localStorage.setItem('userType', type);
                
                return {
                    success: true,
                    user: data.user,
                    customer: data.customer
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
                error: 'Connection error - please check if backend is running at http://127.0.0.1:8000'
            };
        }
    },

    // Logout function
    async logout() {
        try {
            const token = sessionStorage.getItem('userToken') || localStorage.getItem('userToken');
            if (token) {
                await fetch(`${API_BASE_URL}/auth/logout/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${token}`
                    },
                    credentials: 'include',
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        // Clear all session data
        sessionStorage.clear();
        localStorage.clear();
        
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
            
            if (data.success && data.user) {
                // Auto-login after registration
                return await this.login(userData.email, userData.password);
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

console.log('✅ Auth system loaded with Django backend');