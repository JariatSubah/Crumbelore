// server.js - Fixed version with proper error handling
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8080'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

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
        
        let users = await readJsonFile('users.json');
        let user = users.find(u => u.email === email);
        
        if (!user) {
            // Create new user for demo
            user = {
                id: Date.now(),
                email,
                name: email.split('@')[0],
                type: userType || 'customer',
                createdAt: new Date().toISOString()
            };
            users.push(user);
            await writeJsonFile('users.json', users);
        }

        // Generate token
        const token = Buffer.from(`${user.id}-${Date.now()}`).toString('base64');
        
        res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name, type: user.type }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
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

// Dashboard stats
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
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;