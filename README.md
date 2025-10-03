# Crumbelore - Literary Café Web Application

A sophisticated web application for a literary-themed café that combines book browsing, food ordering, and social reading experiences.

## 🌟 Features

### Customer Features
- **Interactive Menu System** - Browse coffee, desserts, and literary-themed combinations
- **Book Library** - Discover, search, and reserve books from our curated collection
- **Event System** - Join book clubs, author events, and literary discussions  
- **Booking System** - Reserve tables, reading corners, and private study rooms
- **User Dashboard** - Track reading progress, order history, and preferences
- **Shopping Cart** - Persistent cart system with real-time updates
- **Interactive Elements** - Enhanced user experience with sound effects and animations

### Admin Features
- **Dashboard Analytics** - Sales tracking, user metrics, and inventory management
- **Content Management** - Add/edit books, menu items, and events
- **Order Management** - Process and track customer orders
- **User Management** - Customer account administration

## 🛠️ Tech Stack

### Frontend
- **HTML5/CSS3** - Modern, responsive design
- **JavaScript (ES6+)** - Interactive functionality and API integration
- **Font Awesome** - Professional iconography
- **Google Fonts** - Typography (Playfair Display, Inter)

### Backend (Current - Node.js)
- **Express.js** - RESTful API server
- **CORS** - Cross-origin resource sharing
- **JSON File Storage** - Data persistence

### Backend (Planned - Python)
- **Flask/FastAPI** - Web framework
- **SQLAlchemy** - Database ORM
- **PostgreSQL** - Production database
- **JWT** - Authentication tokens

## 📁 Project Structure

```
crumbelore/
├── index.html              # Landing page
├── menu.html               # Interactive menu
├── library.html            # Book browsing
├── event.html              # Events and book clubs
├── bookings.html           # Table/space reservations
├── checkout.html           # Order processing
├── dashboard.html          # Customer dashboard
├── admin-dashboard.html    # Admin panel
├── server.js               # Node.js backend
├── fun.js                  # Interactive features & sound effects (NEW)
├── package.json            # Dependencies and scripts
├── package-lock.json       # Lock file
├── .gitignore              # Git ignore rules
├── js/
│   ├── auth.js             # Authentication system
│   └── bookSystem.js       # Book management
├── data/                   # JSON data files
│   ├── books.json          # Book catalog
│   ├── orders.json         # Order history
│   ├── reservations.json   # Booking records
│   ├── users.json          # User accounts
│   └── users.json.backup   # User data backup
├── sounds/                 # Audio assets (NEW)
├── Images/                 # Static assets
├── Videos/                 # Video content
└── node_modules/           # Dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- Modern web browser
- Local development server

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JariatSubah/Crumbelore.git
   cd Crumbelore
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server**
   ```bash
   node server.js
   ```
   Server runs on `http://localhost:3000`

4. **Open the frontend**
   ```bash
   # Using Python's built-in server
   python -m http.server 8080
   
   # Or using Node's http-server
   npx http-server -p 8080
   ```
   Frontend accessible at `http://localhost:8080`

### Demo Credentials

**Customer Login:**
- Email: `customer@crumbelore.com`
- Password: `customer123`

**Admin Login:**
- Email: `admin@crumbelore.com`  
- Password: `admin123`

## 🎯 Key Functionality

### Authentication System
- JWT-based session management
- Role-based access control (Customer/Admin)
- Offline mode with demo data

### Shopping Cart
- Persistent storage across sessions
- Real-time price calculations
- Quantity management and validation

### Book Reservation System
- Availability tracking
- User reservation history
- Automated expiry management

### Interactive Features
- **Sound Effects** - Immersive audio feedback for user interactions
- **Dynamic Animations** - Smooth transitions and hover effects
- **Enhanced UX** - Audio-visual feedback system

### Order Processing
- Multi-step checkout flow
- Payment method selection
- Order confirmation and tracking

## 🔊 Audio Enhancement System

The newly added `fun.js` and `sounds/` directory provide:
- **Interactive Sound Effects** for button clicks and page interactions
- **User Feedback Audio** for notifications and confirmations
- **Immersive Experience** with ambient café sounds
- **Performance Optimized** audio loading and playback

## 🔧 Development

### Running in Development Mode

1. **Backend Development**
   ```bash
   # Auto-restart on changes
   npm install -g nodemon
   nodemon server.js
   ```

2. **Frontend Development**
   ```bash
   # Live reload server
   npx live-server --port=8080
   ```

### API Endpoints

```
POST /api/auth/login          # User authentication
GET  /api/user/profile        # User profile data
GET  /api/books               # Book catalog
POST /api/books               # Add book (admin)
GET  /api/orders              # Order history
POST /api/orders              # Create order
GET  /api/dashboard/stats     # Analytics data
```

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🎨 Design System

### Color Palette
- Primary: `#654321` (Warm Brown)
- Secondary: `#8B4513` (Saddle Brown)  
- Accent: `#F5E6D3` (Cream)
- Background: `#FEFDF8` (Off White)

### Typography
- Headers: Playfair Display (Serif)
- Body: Inter (Sans-serif)
- UI Elements: System fonts fallback

## 🔮 Roadmap

### Version 2.0 (Python Backend)
- [ ] Flask/FastAPI migration
- [ ] PostgreSQL database integration
- [ ] Advanced search functionality
- [ ] Email notification system
- [ ] Payment gateway integration
- [ ] Real-time inventory tracking

### Version 2.1 (Enhanced Features)
- [ ] Social reading features
- [ ] Book recommendation engine
- [ ] Mobile app development
- [ ] Advanced analytics dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 👥 Team

- **Developer**: Jariat Subah
- **Design**: Literary café theme
- **Project Type**: Academic/Portfolio Project

## 📞 Support

For support, email jariatsubah.6103@gmail.com or create an issue in this repository.

---

*Built with ❤️ for book lovers and coffee enthusiasts* ☕📚
