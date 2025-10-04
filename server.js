// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://127.0.0.1:3000', 
        'http://localhost:8080',
        'http://127.0.0.1:5500',  // Add Live Server port
        'http://localhost:5500',   // Add Live Server port
        'http://127.0.0.1:5501',  // Alternative Live Server port
        'http://localhost:5501'    // Alternative Live Server port
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));
   // Handle preflight OPTIONS requests 
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        res.header('Access-Control-Allow-Credentials', true);
        res.sendStatus(200);
    } else {
        next();
    }
});

// Data directory setup
const DATA_DIR = path.join(__dirname, 'data');

// Initialize data directory and files
async function initializeStorage() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        const files = ['users.json', 'books.json', 'orders.json', 'reservations.json'];
        for (const file of files) {
            const filePath = path.join(DATA_DIR, file);
            try {
                await fs.access(filePath);
            } catch {
                await fs.writeFile(filePath, '[]');
                console.log(`Created ${file}`);
            }
        }
    } catch (error) {
        console.error('Storage initialization failed:', error);
        process.exit(1);
    }
}

// Safe file operations with retry
async function readJsonFile(filename, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const filePath = path.join(DATA_DIR, filename);
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data || '[]');
        } catch (error) {
            if (i === retries - 1) {
                console.error(`Failed to read ${filename}:`, error);
                return [];
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}

async function writeJsonFile(filename, data, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const filePath = path.join(DATA_DIR, filename);
            const backup = filePath + '.backup';
            
            // Create backup
            try {
                await fs.copyFile(filePath, backup);
            } catch (error) {
                // File might not exist yet
            }
            
            await fs.writeFile(filePath, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            if (i === retries - 1) {
                console.error(`Failed to write ${filename}:`, error);
                return false;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}

// Validation middleware
const validateRequired = (fields) => (req, res, next) => {
    const missing = fields.filter(field => !req.body[field]);
    if (missing.length > 0) {
        return res.status(400).json({ 
            message: `Missing required fields: ${missing.join(', ')}` 
        });
    }
    next();
};

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Authentication endpoints
app.post('/api/auth/login', validateRequired(['email', 'password']), async (req, res) => {
    try {
        const { email, password, userType } = req.body;
        
        // Basic validation
        if (!email.includes('@')) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        if (password.length < 3) {
            return res.status(400).json({ message: 'Password must be at least 3 characters long' });
        }

        // Admin check
        if (userType === 'admin' && !email.toLowerCase().includes('admin')) {
            return res.status(400).json({ message: 'Admin email required for admin access' });
        }

        let users = await readJsonFile('users.json');
        let user = users.find(u => u.email === email);
        
        if (!user) {
            // Create new user for demo
            user = {
                id: Date.now(),
                email,
                name: userType === 'admin' ? 'Admin User' : email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
                type: userType || 'customer',
                booksRead: userType === 'customer' ? 47 : undefined,
                loyaltyPoints: userType === 'customer' ? 2340 : undefined,
                favoriteGenre: userType === 'customer' ? 'Mystery' : undefined,
                createdAt: new Date().toISOString()
            };
            users.push(user);
            await writeJsonFile('users.json', users);
            console.log(`Created new ${userType} user:`, user.email);
        }

        // Generate token
        const token = Buffer.from(`${user.id}-${Date.now()}-${userType}`).toString('base64');
        
        res.json({
            success: true,
            token,
            user: { 
                id: user.id, 
                email: user.email, 
                name: user.name, 
                type: user.type,
                booksRead: user.booksRead,
                loyaltyPoints: user.loyaltyPoints,
                favoriteGenre: user.favoriteGenre
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get current user endpoint
app.get('/api/auth/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        
        // For demo - check if it's a valid demo token
        if (token.includes('demo-token') || token.includes('customer') || token.includes('admin') || token.length > 10) {
            // Try to decode user info from token or return default
            let userData = {
                id: 1,
                email: 'customer@crumbelore.com',
                name: 'Customer User',
                type: 'customer',
                booksRead: 47,
                loyaltyPoints: 2340,
                favoriteGenre: 'Mystery'
            };

            // Try to get real user data from token
            try {
                const decoded = Buffer.from(token, 'base64').toString();
                const userId = decoded.split('-')[0];
                
                if (userId && !isNaN(userId)) {
                    const users = await readJsonFile('users.json');
                    const user = users.find(u => u.id == userId);
                    if (user) {
                        userData = user;
                    }
                }
            } catch (e) {
                // Use default data
            }

            res.json({
                success: true,
                user: userData
            });
        } else {
            res.status(401).json({ message: 'Invalid token' });
        }
        
    } catch (error) {
        console.error('Auth me error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// User profile endpoint
app.get('/api/user/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        let userData = {
            name: 'Customer User',
            email: 'customer@crumbelore.com',
            level: 'Literary Explorer',
            booksRead: 47,
            loyaltyPoints: 2340,
            favoriteGenre: 'Mystery'
        };

        // Try to get user from token
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = Buffer.from(token, 'base64').toString();
                const userId = decoded.split('-')[0];
                
                if (userId && !isNaN(userId)) {
                    const users = await readJsonFile('users.json');
                    const user = users.find(u => u.id == userId);
                    if (user) {
                        userData = {
                            name: user.name,
                            email: user.email,
                            level: 'Literary Explorer',
                            booksRead: user.booksRead || 47,
                            loyaltyPoints: user.loyaltyPoints || 2340,
                            favoriteGenre: user.favoriteGenre || 'Mystery'
                        };
                    }
                }
            } catch (e) {
                // Use default data
            }
        }

        res.json(userData);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ 
            name: 'Customer User',
            email: 'customer@crumbelore.com',
            level: 'Literary Explorer',
            booksRead: 47,
            loyaltyPoints: 2340,
            favoriteGenre: 'Mystery'
        });
    }
});

// Dashboard stats endpoint
app.get('/api/user/dashboard-stats', async (req, res) => {
    try {
        res.json({
            monthlyBooks: 4,
            monthlyIncrease: 2,
            coffeeOrders: 23,
            favoriteCoffee: 'Vanilla Dream Latte',
            bookClubEvents: 8,
            nextEvent: 'Mystery Night - Friday 7PM'
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Current reading endpoint
app.get('/api/user/current-reading', async (req, res) => {
    try {
        res.json({
            book: {
                title: 'The Silent Patient',
                author: 'Alex Michaelides',
                genre: 'Mystery',
                description: 'A gripping psychological thriller about a woman\'s act of violence against her husband.'
            },
            progress: 70
        });
    } catch (error) {
        console.error('Current reading error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Recent orders endpoint
app.get('/api/user/recent-orders', async (req, res) => {
    try {
        const orders = [
            {
                id: 'ORD-001',
                items: 'Mystery Solver\'s Kit',
                description: 'Classic Espresso + Dark Chocolate Tart + Book',
                time: 'Today, 2:30 PM',
                status: 'completed',
                price: 580
            },
            {
                id: 'ORD-002',
                items: 'Vanilla Dream Latte',
                description: 'Large size with extra foam',
                time: 'Yesterday, 4:15 PM',
                status: 'completed',
                price: 280
            }
        ];
        res.json(orders);
    } catch (error) {
        console.error('Recent orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Books endpoints
app.get('/api/books', async (req, res) => {
    try {
        const books = await readJsonFile('books.json');
        res.json(books);
    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({ message: 'Failed to retrieve books' });
    }
});

app.post('/api/books', validateRequired(['title', 'author']), async (req, res) => {
    try {
        const books = await readJsonFile('books.json');
        const newBook = {
            id: req.body.id || `book-${Date.now()}`,
            ...req.body,
            createdAt: new Date().toISOString()
        };
        
        books.push(newBook);
        const success = await writeJsonFile('books.json', books);
        
        if (success) {
            res.status(201).json(newBook);
        } else {
            res.status(500).json({ message: 'Failed to save book' });
        }
    } catch (error) {
        console.error('Add book error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/books/sync', async (req, res) => {
    try {
        const { books } = req.body;
        if (!Array.isArray(books)) {
            return res.status(400).json({ message: 'Books must be an array' });
        }
        
        const success = await writeJsonFile('books.json', books);
        if (success) {
            res.json({ message: 'Books synced successfully' });
        } else {
            res.status(500).json({ message: 'Failed to sync books' });
        }
    } catch (error) {
        console.error('Sync books error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Orders endpoints
app.post('/api/orders', validateRequired(['items', 'total']), async (req, res) => {
    try {
        const orders = await readJsonFile('orders.json');
        const newOrder = {
            ...req.body,
            id: req.body.id || `ORD-${Date.now()}`,
            createdAt: new Date().toISOString()
        };
        
        orders.push(newOrder);
        const success = await writeJsonFile('orders.json', orders);
        
        if (success) {
            res.status(201).json({ order: newOrder });
        } else {
            res.status(500).json({ message: 'Failed to save order' });
        }
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await readJsonFile('orders.json');
        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Failed to retrieve orders' });
    }
});

// Menu endpoints
app.get('/api/menu', async (req, res) => {
    try {
        // Return default menu items for demo
        const menuItems = [
            {
                id: 'menu-1',
                name: 'Vanilla Dream Latte',
                category: 'Coffee',
                price: 280,
                available: true
            },
            {
                id: 'menu-2',
                name: 'Mystery Solver\'s Kit',
                category: 'Book Specials',
                price: 580,
                available: true
            },
            {
                id: 'menu-3',
                name: 'Dark Chocolate Tart',
                category: 'Desserts',
                price: 320,
                available: true
            }
        ];
        res.json(menuItems);
    } catch (error) {
        console.error('Get menu error:', error);
        res.status(500).json({ message: 'Failed to retrieve menu' });
    }
});

app.post('/api/menu', validateRequired(['name', 'category', 'price']), async (req, res) => {
    try {
        const newMenuItem = {
            id: `menu-${Date.now()}`,
            ...req.body,
            available: true,
            createdAt: new Date().toISOString()
        };
        
        // In a real app, have to save to database
        console.log('New menu item created:', newMenuItem);
        res.status(201).json(newMenuItem);
    } catch (error) {
        console.error('Add menu item error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Dashboard stats for admin
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const [orders, books, users] = await Promise.all([
            readJsonFile('orders.json'),
            readJsonFile('books.json'),
            readJsonFile('users.json')
        ]);
        
        const todayOrders = orders.filter(o => {
            const orderDate = new Date(o.createdAt);
            const today = new Date();
            return orderDate.toDateString() === today.toDateString();
        });
        
        const todaySales = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        
        res.json({
            totalOrders: orders.length,
            todayOrders: todayOrders.length,
            todaySales: todaySales,
            totalBooks: books.length,
            totalUsers: users.length
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ message: 'Failed to retrieve stats' });
    }
});

// Settings endpoint
app.post('/api/settings', async (req, res) => {
    try {
        console.log('Settings updated:', req.body);
        res.json({ message: 'Settings saved successfully' });
    } catch (error) {
        console.error('Settings error:', error);
        res.status(500).json({ message: 'Failed to save settings' });
    }
});

// Export orders endpoint
app.get('/api/orders/export', async (req, res) => {
    try {
        const orders = await readJsonFile('orders.json');
        res.json(orders);
    } catch (error) {
        console.error('Export orders error:', error);
        res.status(500).json({ message: 'Failed to export orders' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

// Start server
async function startServer() {
    try {
        await initializeStorage();
        app.listen(PORT, () => {
            console.log(`✅ Crumbelore Server running on http://localhost:${PORT}`);
            console.log(`📁 Data directory: ${DATA_DIR}`);
            console.log(`🔄 Server ready for API requests`);
            console.log(`📋 Available endpoints:`);
            console.log(`   - POST /api/auth/login`);
            console.log(`   - GET  /api/auth/me`);
            console.log(`   - GET  /api/user/profile`);
            console.log(`   - GET  /api/books`);
            console.log(`   - POST /api/books`);
            console.log(`   - GET  /api/orders`);
            console.log(`   - POST /api/orders`);
            console.log(`   - GET  /api/dashboard/stats`);
            console.log(`   - GET  /health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;