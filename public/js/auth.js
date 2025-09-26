// auth.js - Centralized authentication system
class AuthSystem {
    constructor() {
        this.baseURL = window.location.hostname === 'localhost' ? 
            'http://localhost:3000' : 'https://your-server.com';
        this.isOfflineMode = false;
        this.init();
    }

    async init() {
        // Check server availability
        try {
            await fetch(`${this.baseURL}/health`);
            console.log('Server available');
        } catch (error) {
            console.log('Server offline, switching to demo mode');
            this.isOfflineMode = true;
        }
    }

    async login(email, password, userType = 'customer') {
        // Remove exposed credentials
        if (this.isOfflineMode) {
            return this.handleOfflineLogin(email, password, userType);
        }

        try {
            const response = await fetch(`${this.baseURL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, userType })
            });

            const data = await response.json();
            
            if (response.ok) {
                this.storeSession(data.token, data.user, userType);
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.message };
            }
        } catch (error) {
            return { success: false, error: 'Connection failed' };
        }
    }

    handleOfflineLogin(email, password, userType) {
        // Demo mode - validate format only
        if (!email || !password) {
            return { success: false, error: 'Email and password required' };
        }

        if (!email.includes('@')) {
            return { success: false, error: 'Invalid email format' };
        }

        // Create demo user
        const demoUser = {
            id: Date.now(),
            email: email,
            name: email.split('@')[0],
            type: userType
        };

        // Store in sessionStorage for demo
        sessionStorage.setItem('authToken', 'demo-token-' + Date.now());
        sessionStorage.setItem('currentUser', JSON.stringify(demoUser));
        sessionStorage.setItem('userType', userType);

        return { success: true, user: demoUser };
    }

    storeSession(token, user, userType) {
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        sessionStorage.setItem('userType', userType);
        
        // Set expiry (4 hours)
        const expiry = Date.now() + (4 * 60 * 60 * 1000);
        sessionStorage.setItem('authExpiry', expiry.toString());
    }

    getCurrentUser() {
        const userStr = sessionStorage.getItem('currentUser');
        if (!userStr) return null;

        // Check expiry
        const expiry = sessionStorage.getItem('authExpiry');
        if (expiry && Date.now() > parseInt(expiry)) {
            this.logout();
            return null;
        }

        return JSON.parse(userStr);
    }

    isAuthenticated() {
        const user = this.getCurrentUser();
        return user !== null;
    }

    requireAuth(redirectUrl = 'index.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    logout() {
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('userType');
        sessionStorage.removeItem('authExpiry');
        window.location.href = 'index.html';
    }
}

// Initialize globally
window.authSystem = new AuthSystem();

// Usage in your existing files:
function customerLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('customer-email').value;
    const password = document.getElementById('customer-password').value;
    const button = event.target.querySelector('.login-btn');
    
    button.innerHTML = '<span class="loading"></span> Signing in...';
    button.disabled = true;
    
    window.authSystem.login(email, password, 'customer')
        .then(result => {
            if (result.success) {
                showNotification('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showNotification(result.error, 'error');
                button.innerHTML = 'Sign In';
                button.disabled = false;
            }
        });
}

function adminLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const button = event.target.querySelector('.login-btn');
    
    button.innerHTML = '<span class="loading"></span> Verifying...';
    button.disabled = true;
    
    window.authSystem.login(email, password, 'admin')
        .then(result => {
            if (result.success) {
                showNotification('Admin access granted!', 'success');
                setTimeout(() => {
                    window.location.href = 'admin-dashboard.html';
                }, 1500);
            } else {
                showNotification(result.error, 'error');
                button.innerHTML = 'Admin Login';
                button.disabled = false;
            }
        });
}