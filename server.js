// server.js - Basic Express server for your backend
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simple file-based storage (replace with database later)
const DATA_DIR = './data';
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const BOOKS_FILE = path.join(DATA_DIR, 'books.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const RESERVATIONS_FILE = path.join(DATA_DIR, 'reservations.json');

// Initialize data directory
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Helper functions
function readJsonFile(filename) {
    try {
        if (fs.existsSync(filename)) {
            return JSON.parse(fs.readFileSync(filename, 'utf8'));
        }
        return [];
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return [];
    }
}

function writeJsonFile(filename, data) {
    try {
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filename}:`, error);
        return false;
    }
}

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
    const { email, password, userType } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
    }

    // Simple demo authentication - replace with proper auth
    const users = readJsonFile(USERS_FILE);
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
        writeJsonFile(USERS_FILE, users);
    }

    // Generate simple token (use JWT in production)
    const token = Buffer.from(`${user.id}-${Date.now()}`).toString('base64');
    
    res.json({
        token,
        user: { id: user.id, email: user.email, name: user.name, type: user.type }
    });
});

// Books endpoints
app.get('/api/books', (req, res) => {
    const books = readJsonFile(BOOKS_FILE);
    res.json(books);
});

app.post('/api/books', (req, res) => {
    const books = readJsonFile(BOOKS_FILE);
    const newBook = {
        id: req.body.id || `book-${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString()
    };
    
    books.push(newBook);
    if (writeJsonFile(BOOKS_FILE, books)) {
        res.status(201).json(newBook);
    } else {
        res.status(500).json({ message: 'Failed to save book' });
    }
});

app.get('/api/books/:id', (req, res) => {
    const books = readJsonFile(BOOKS_FILE);
    const book = books.find(b => b.id === req.params.id);
    
    if (book) {
        res.json(book);
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
});

app.post('/api/books/sync', (req, res) => {
    const { books } = req.body;
    if (writeJsonFile(BOOKS_FILE, books)) {
        res.json({ message: 'Books synced successfully' });
    } else {
        res.status(500).json({ message: 'Failed to sync books' });
    }
});

// Orders endpoints
app.post('/api/orders', (req, res) => {
    const orders = readJsonFile(ORDERS_FILE);
    const newOrder = {
        ...req.body,
        id: req.body.id || `ORD-${Date.now()}`,
        createdAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    if (writeJsonFile(ORDERS_FILE, orders)) {
        res.status(201).json({ order: newOrder });
    } else {
        res.status(500).json({ message: 'Failed to save order' });
    }
});

app.get('/api/orders', (req, res) => {
    const orders = readJsonFile(ORDERS_FILE);
    res.json(orders);
});

// Reservations endpoints
app.post('/api/reservations', (req, res) => {
    const reservations = readJsonFile(RESERVATIONS_FILE);
    const newReservation = {
        ...req.body,
        id: req.body.id || `RES-${Date.now()}`,
        createdAt: new Date().toISOString()
    };
    
    reservations.push(newReservation);
    if (writeJsonFile(RESERVATIONS_FILE, reservations)) {
        res.status(201).json(newReservation);
    } else {
        res.status(500).json({ message: 'Failed to save reservation' });
    }
});

app.post('/api/reservations/sync', (req, res) => {
    const { reservations } = req.body;
    if (writeJsonFile(RESERVATIONS_FILE, reservations)) {
        res.json({ message: 'Reservations synced successfully' });
    } else {
        res.status(500).json({ message: 'Failed to sync reservations' });
    }
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
    const orders = readJsonFile(ORDERS_FILE);
    const books = readJsonFile(BOOKS_FILE);
    const users = readJsonFile(USERS_FILE);
    
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
});

// Menu endpoints
app.get('/api/menu', (req, res) => {
    // Return default menu items for now
    const defaultMenu = [
        {
            id: 'vanilla-latte',
            name: 'Vanilla Dream Latte',
            category: 'Coffee',
            price: 280,
            description: 'Smooth espresso with steamed milk and Madagascar vanilla'
        },
        {
            id: 'mystery-kit',
            name: 'Mystery Solver\'s Kit',
            category: 'Literary Pairings',
            price: 580,
            description: 'Classic Espresso + Dark Chocolate Tart + Mystery Novel'
        }
    ];
    res.json(defaultMenu);
});

app.post('/api/menu', (req, res) => {
    // Add menu item logic here
    res.status(201).json({ message: 'Menu item added successfully' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Data directory:', DATA_DIR);
});

module.exports = app;