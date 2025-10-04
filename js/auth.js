class AuthSystem {
    constructor() {
        this.baseURL = this.getBaseURL();
        this.isOfflineMode = false;
        this.init();
    }

    getBaseURL() {
        const hostname = window.location.hostname;
        
        // Development environment
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return `http://localhost:3000`;
        }
        
        // Production environment
        return window.location.origin;
    }

    async init() {
        console.log('AuthSystem initialized');
        await this.checkServerHealth();
        this.cleanupOldSessions(); // Clean any conflicting sessions
    }

    // Clean up any old/conflicting session data
    cleanupOldSessions() {
        // Remove old conflicting keys
        const oldKeys = [
            'customerAuthenticated', 'customerUser', 'customerToken',
            'adminAuthenticated', 'adminUser', 'adminToken',
            'userBooksRead', 'userLoyaltyPoints', 'userFavoriteGenre'
        ];
        
        oldKeys.forEach(key => {
            sessionStorage.removeItem(key);
            localStorage.removeItem(key);
        });
    }

    async checkServerHealth() {
        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                timeout: 5000
            });
            
            if (response.ok) {
                console.log('✅ Server is available');
                this.isOfflineMode = false;
                return true;
            }
        } catch (error) {
            console.log('❌ Server offline, switching to demo mode');
            this.isOfflineMode = true;
        }
        return false;
    }

    async login(email, password, userType = 'customer') {
        // Basic validation
        if (!email || !password) {
            return { success: false, error: 'Email and password are required' };
        }

        if (!email.includes('@')) {
            return { success: false, error: 'Please enter a valid email address' };
        }

        // Clean any existing session first
        this.clearSession();

        // Try online login first
        if (!this.isOfflineMode) {
            try {
                const response = await fetch(`${this.baseURL}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password, userType }),
                    timeout: 10000
                });

                if (response.ok) {
                    const data = await response.json();
                    this.storeSession(data.token, data.user, userType);
                    return { success: true, user: data.user };
                } else {
                    const errorData = await response.json();
                    return { success: false, error: errorData.message || 'Login failed' };
                }
            } catch (error) {
                console.log('Online login failed, switching to offline mode:', error);
                this.isOfflineMode = true;
            }
        }

        // Offline/demo login
        return this.handleOfflineLogin(email, password, userType);
    }

    handleOfflineLogin(email, password, userType) {
        // Flexible demo validation - accept any email with basic password check
        if (password.length < 3) {
            return { success: false, error: 'Password must be at least 3 characters long' };
        }

        // Admin check - only allow admin emails for admin login
        if (userType === 'admin' && !email.toLowerCase().includes('admin')) {
            return { success: false, error: 'Admin email required for admin access (e.g., admin@yourdomain.com)' };
        }

        // Create demo user for any valid email
        const demoUser = {
            id: Date.now(),
            email: email,
            name: userType === 'admin' ? 'Admin User' : this.formatName(email.split('@')[0]),
            type: userType,
            booksRead: userType === 'customer' ? 47 : undefined,
            loyaltyPoints: userType === 'customer' ? 2340 : undefined,
            favoriteGenre: userType === 'customer' ? 'Mystery' : undefined,
            joinedDate: new Date().toISOString()
        };

        // Store session
        this.storeSession('demo-token-' + Date.now(), demoUser, userType);
        
        return { success: true, user: demoUser };
    }

    formatName(name) {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    storeSession(token, user, userType) {
        try {
            // Store in sessionStorage (primary storage)
            sessionStorage.setItem('authToken', token);
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            sessionStorage.setItem('userType', userType);
            sessionStorage.setItem('loginTime', Date.now().toString());
            
            // Set expiry (4 hours from now)
            const expiry = Date.now() + (4 * 60 * 60 * 1000);
            sessionStorage.setItem('authExpiry', expiry.toString());

            // Store minimal data in localStorage for compatibility
            localStorage.setItem('userType', userType);
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('userName', user.name);

            console.log('✅ Session stored successfully for:', user.name);
        } catch (error) {
            console.error('Session storage failed:', error);
        }
    }

    clearSession() {
        try {
            // Clear sessionStorage
            const sessionKeys = [
                'authToken', 'currentUser', 'userType', 'authExpiry', 'loginTime'
            ];
            sessionKeys.forEach(key => sessionStorage.removeItem(key));
            
            // Clear relevant localStorage
            const localKeys = [
                'userType', 'userEmail', 'userName', 'userId'
            ];
            localKeys.forEach(key => localStorage.removeItem(key));

            console.log('✅ Session cleared');
        } catch (error) {
            console.error('Session cleanup failed:', error);
        }
    }

    getCurrentUser() {
        try {
            const userStr = sessionStorage.getItem('currentUser');
            if (!userStr) return null;

            // Check if session has expired
            const expiry = sessionStorage.getItem('authExpiry');
            if (expiry && Date.now() > parseInt(expiry)) {
                this.logout(false);
                return null;
            }

            return JSON.parse(userStr);
        } catch (error) {
            console.error('Error getting current user:', error);
            this.clearSession();
            return null;
        }
    }

    isAuthenticated() {
        const user = this.getCurrentUser();
        return user !== null;
    }

    getUserType() {
        return sessionStorage.getItem('userType');
    }

    requireAuth(redirectUrl = 'index.html') {
        if (!this.isAuthenticated()) {
            this.showAuthNotification('Please log in to continue');
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 2000);
            return false;
        }
        return true;
    }

    requireUserType(requiredType, redirectUrl = 'index.html') {
        if (!this.isAuthenticated()) {
            return this.requireAuth(redirectUrl);
        }

        const userType = this.getUserType();
        if (userType !== requiredType) {
            this.showAuthNotification(`Access denied. ${requiredType} account required.`);
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 2000);
            return false;
        }

        return true;
    }

    logout(redirect = true) {
        const user = this.getCurrentUser();
        const userName = user?.name || 'User';
        
        this.clearSession();
        
        this.showAuthNotification(`Goodbye, ${userName}!`, 'success');
        
        if (redirect) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    }

    showAuthNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    validateToken() {
        const token = sessionStorage.getItem('authToken');
        const expiry = sessionStorage.getItem('authExpiry');
        
        if (!token || !expiry) return false;
        if (Date.now() > parseInt(expiry)) {
            this.logout(false);
            return false;
        }
        
        return true;
    }
}

// Initialize globally and ensure it's ready
if (!window.authSystem) {
    window.authSystem = new AuthSystem();
}

// Enhanced login functions
function customerLogin(event) {
    if (event) event.preventDefault();
    
    const email = document.getElementById('customer-email')?.value || 'customer@crumbelore.com';
    const password = document.getElementById('customer-password')?.value || 'customer123';
    const button = event?.target?.querySelector('.login-btn');
    
    if (!email || !password) {
        showNotification('Please enter both email and password', 'error');
        return;
    }

    if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<span class="loading"></span> Signing in...';
        button.disabled = true;
    }

    window.authSystem.login(email, password, 'customer')
        .then(result => {
            if (result.success) {
                showNotification(`Welcome back, ${result.user.name}!`, 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showNotification(result.error, 'error');
                if (button) {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            showNotification('Login failed. Please try again.', 'error');
            if (button) {
                button.innerHTML = originalText;
                button.disabled = false;
            }
        });
}

function adminLogin(event) {
    if (event) event.preventDefault();
    
    const email = document.getElementById('admin-email')?.value || 'admin@crumbelore.com';
    const password = document.getElementById('admin-password')?.value || 'admin123';
    const button = event?.target?.querySelector('.login-btn');
    
    if (!email || !password) {
        showNotification('Please enter both email and password', 'error');
        return;
    }

    if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<span class="loading"></span> Verifying...';
        button.disabled = true;
    }

    window.authSystem.login(email, password, 'admin')
        .then(result => {
            if (result.success) {
                showNotification('Admin access granted!', 'success');
                setTimeout(() => {
                    window.location.href = 'admin-dashboard.html';
                }, 1500);
            } else {
                showNotification(result.error, 'error');
                if (button) {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }
            }
        })
        .catch(error => {
            console.error('Admin login error:', error);
            showNotification('Admin login failed. Please try again.', 'error');
            if (button) {
                button.innerHTML = originalText;
                button.disabled = false;
            }
        });
}

// Utility function for notifications
function showNotification(message, type = 'info', duration = 4000) {
    if (window.authSystem) {
        window.authSystem.showAuthNotification(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// Validate session on page load
document.addEventListener('DOMContentLoaded', function() {
    if (window.authSystem && window.authSystem.isAuthenticated()) {
        window.authSystem.validateToken();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthSystem;
}