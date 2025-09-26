// bookSystem.js - Book management and reservation system
class BookSystem {
    constructor() {
        this.books = this.loadBooks();
        this.reservations = this.loadReservations();
        this.initializeBooks();
    }

    initializeBooks() {
        // Initialize with some books if none exist
        if (this.books.length === 0) {
            this.books = [
                {
                    id: 'silent-patient',
                    title: 'The Silent Patient',
                    author: 'Alex Michaelides',
                    genre: 'Mystery & Thriller',
                    description: 'A gripping psychological thriller about a woman\'s act of violence against her husband and the psychotherapist obsessed with treating her.',
                    totalCopies: 3,
                    availableCopies: 2,
                    rating: 4.8,
                    isbn: '978-1250301697',
                    pages: 336,
                    year: 2019,
                    icon: 'fas fa-search',
                    tags: ['psychological', 'thriller', 'mystery']
                },
                {
                    id: 'evelyn-hugo',
                    title: 'The Seven Husbands of Evelyn Hugo',
                    author: 'Taylor Jenkins Reid',
                    genre: 'Romance',
                    description: 'In this entrancing novel, reclusive Hollywood icon Evelyn Hugo finally decides to tell her life story—but only to unknown journalist Monique Grant.',
                    totalCopies: 2,
                    availableCopies: 1,
                    rating: 4.9,
                    isbn: '978-1501139239',
                    pages: 400,
                    year: 2017,
                    icon: 'fas fa-heart',
                    tags: ['hollywood', 'romance', 'lgbtq']
                },
                {
                    id: 'project-hail-mary',
                    title: 'Project Hail Mary',
                    author: 'Andy Weir',
                    genre: 'Science Fiction',
                    description: 'Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish.',
                    totalCopies: 2,
                    availableCopies: 2,
                    rating: 4.6,
                    isbn: '978-0593135204',
                    pages: 496,
                    year: 2021,
                    icon: 'fas fa-rocket',
                    tags: ['space', 'science', 'adventure']
                },
                {
                    id: 'atomic-habits',
                    title: 'Atomic Habits',
                    author: 'James Clear',
                    genre: 'Self-Help',
                    description: 'A comprehensive guide to building good habits and breaking bad ones, with practical strategies for personal and professional growth.',
                    totalCopies: 4,
                    availableCopies: 3,
                    rating: 4.8,
                    isbn: '978-0735211292',
                    pages: 320,
                    year: 2018,
                    icon: 'fas fa-brain',
                    tags: ['productivity', 'habits', 'self-improvement']
                }
            ];
            this.saveBooks();
        }
    }

    loadBooks() {
        try {
            const saved = localStorage.getItem('crumbelore_books');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading books:', error);
            return [];
        }
    }

    saveBooks() {
        try {
            localStorage.setItem('crumbelore_books', JSON.stringify(this.books));
        } catch (error) {
            console.error('Error saving books:', error);
        }
    }

    loadReservations() {
        try {
            const saved = localStorage.getItem('crumbelore_reservations');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading reservations:', error);
            return [];
        }
    }

    saveReservations() {
        try {
            localStorage.setItem('crumbelore_reservations', JSON.stringify(this.reservations));
        } catch (error) {
            console.error('Error saving reservations:', error);
        }
    }

    // Book search and filtering
    searchBooks(query, genre = null) {
        let filteredBooks = [...this.books];
        
        if (query && query.trim()) {
            const searchTerm = query.toLowerCase();
            filteredBooks = filteredBooks.filter(book =>
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm) ||
                book.genre.toLowerCase().includes(searchTerm) ||
                book.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        
        if (genre && genre !== 'all') {
            filteredBooks = filteredBooks.filter(book =>
                book.genre.toLowerCase().includes(genre.toLowerCase())
            );
        }
        
        return filteredBooks;
    }

    getBookById(bookId) {
        return this.books.find(book => book.id === bookId);
    }

    // Reservation system
    async reserveBook(bookId, reservationData) {
        try {
            // Check authentication
            if (!window.authSystem || !window.authSystem.isAuthenticated()) {
                throw new Error('Please log in to reserve books');
            }

            const user = window.authSystem.getCurrentUser();
            const book = this.getBookById(bookId);

            if (!book) {
                throw new Error('Book not found');
            }

            if (book.availableCopies <= 0) {
                throw new Error('No copies available for reservation');
            }

            // Check if user already has this book reserved
            const existingReservation = this.reservations.find(r => 
                r.bookId === bookId && 
                r.userId === user.id && 
                r.status === 'active'
            );

            if (existingReservation) {
                throw new Error('You already have this book reserved');
            }

            // Create reservation
            const reservation = {
                id: 'RES-' + Date.now(),
                bookId: bookId,
                userId: user.id,
                userEmail: user.email,
                userName: user.name,
                bookTitle: book.title,
                bookAuthor: book.author,
                reservationDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString(), // 7 days
                status: 'active',
                notes: reservationData?.notes || ''
            };

            // Update book availability
            book.availableCopies--;
            
            // Add reservation
            this.reservations.push(reservation);

            // Save changes
            this.saveBooks();
            this.saveReservations();

            // Try to sync with server
            this.syncWithServer();

            return { 
                success: true, 
                reservationId: reservation.id,
                expiryDate: reservation.expiryDate
            };

        } catch (error) {
            console.error('Reservation failed:', error);
            return { success: false, error: error.message };
        }
    }

    cancelReservation(reservationId) {
        try {
            const reservation = this.reservations.find(r => r.id === reservationId);
            if (!reservation) {
                throw new Error('Reservation not found');
            }

            // Check if user owns this reservation
            const user = window.authSystem.getCurrentUser();
            if (reservation.userId !== user.id) {
                throw new Error('Unauthorized to cancel this reservation');
            }

            // Update reservation status
            reservation.status = 'cancelled';
            reservation.cancelledDate = new Date().toISOString();

            // Return book to available copies
            const book = this.getBookById(reservation.bookId);
            if (book) {
                book.availableCopies++;
            }

            this.saveBooks();
            this.saveReservations();

            return { success: true };

        } catch (error) {
            console.error('Cancellation failed:', error);
            return { success: false, error: error.message };
        }
    }

    getUserReservations(userId = null) {
        if (!userId && window.authSystem) {
            const user = window.authSystem.getCurrentUser();
            userId = user?.id;
        }

        if (!userId) return [];

        return this.reservations
            .filter(r => r.userId === userId)
            .sort((a, b) => new Date(b.reservationDate) - new Date(a.reservationDate));
    }

    // Book availability check
    isBookAvailable(bookId) {
        const book = this.getBookById(bookId);
        return book && book.availableCopies > 0;
    }

    // Admin functions
    addBook(bookData) {
        const book = {
            id: bookData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            title: bookData.title,
            author: bookData.author,
            genre: bookData.genre,
            description: bookData.description || '',
            totalCopies: parseInt(bookData.copies) || 1,
            availableCopies: parseInt(bookData.copies) || 1,
            rating: 0,
            isbn: bookData.isbn || '',
            pages: parseInt(bookData.pages) || 0,
            year: parseInt(bookData.year) || new Date().getFullYear(),
            icon: this.getGenreIcon(bookData.genre),
            tags: bookData.tags || []
        };

        this.books.push(book);
        this.saveBooks();
        return book;
    }

    updateBook(bookId, updates) {
        const book = this.getBookById(bookId);
        if (!book) return null;

        Object.keys(updates).forEach(key => {
            if (key in book && updates[key] !== undefined) {
                book[key] = updates[key];
            }
        });

        this.saveBooks();
        return book;
    }

    deleteBook(bookId) {
        const index = this.books.findIndex(b => b.id === bookId);
        if (index === -1) return false;

        // Cancel all active reservations for this book
        this.reservations.forEach(reservation => {
            if (reservation.bookId === bookId && reservation.status === 'active') {
                reservation.status = 'cancelled';
                reservation.cancelledDate = new Date().toISOString();
            }
        });

        this.books.splice(index, 1);
        this.saveBooks();
        this.saveReservations();
        return true;
    }

    getGenreIcon(genre) {
        const iconMap = {
            'Mystery & Thriller': 'fas fa-search',
            'Romance': 'fas fa-heart',
            'Science Fiction': 'fas fa-rocket',
            'Fantasy': 'fas fa-magic',
            'Self-Help': 'fas fa-brain',
            'Biography': 'fas fa-user',
            'History': 'fas fa-landmark',
            'Poetry': 'fas fa-feather-alt',
            'Young Adult': 'fas fa-star'
        };
        return iconMap[genre] || 'fas fa-book';
    }

    // Server synchronization (when backend is available)
    async syncWithServer() {
        try {
            const apiURL = window.location.hostname === 'localhost' ? 
                'http://localhost:3000/api' : '/api';

            // Sync books
            await fetch(`${apiURL}/books/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ books: this.books })
            });

            // Sync reservations
            await fetch(`${apiURL}/reservations/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ reservations: this.reservations })
            });

            console.log('Data synced with server');
        } catch (error) {
            console.log('Server sync failed, continuing offline:', error);
        }
    }

    // Statistics
    getStats() {
        return {
            totalBooks: this.books.length,
            totalCopies: this.books.reduce((sum, book) => sum + book.totalCopies, 0),
            availableCopies: this.books.reduce((sum, book) => sum + book.availableCopies, 0),
            activeReservations: this.reservations.filter(r => r.status === 'active').length,
            genreDistribution: this.getGenreDistribution()
        };
    }

    getGenreDistribution() {
        const distribution = {};
        this.books.forEach(book => {
            distribution[book.genre] = (distribution[book.genre] || 0) + 1;
        });
        return distribution;
    }
}

// Initialize book system
window.bookSystem = new BookSystem();

// Updated functions for library.html
function reserveBook(bookTitle) {
    const book = window.bookSystem.books.find(b => b.title === bookTitle);
    if (!book) {
        if (typeof showNotification === 'function') {
            showNotification('Book not found', 'error');
        }
        return;
    }

    const button = event.target;
    const originalText = button.innerHTML;
    
    button.innerHTML = '<span class="loading-spinner"></span>';
    button.disabled = true;
    
    window.bookSystem.reserveBook(book.id, {})
        .then(result => {
            if (result.success) {
                button.innerHTML = 'Reserved!';
                button.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
                
                if (typeof showNotification === 'function') {
                    const expiryDate = new Date(result.expiryDate).toLocaleDateString();
                    showNotification(`"${bookTitle}" reserved successfully! Pick up by ${expiryDate}`, 'success');
                }
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    button.innerHTML = 'Check Availability';
                    button.style.background = 'linear-gradient(135deg, #654321, #8B4513)';
                    button.disabled = false;
                }, 3000);
            } else {
                if (typeof showNotification === 'function') {
                    showNotification(result.error, 'error');
                }
                button.innerHTML = originalText;
                button.disabled = false;
            }
        });
}

// Search functionality for library page
function setupLibrarySearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value;
            const activeGenre = document.querySelector('.genre-btn.active')?.textContent?.toLowerCase() || 'all';
            performBookSearch(query, activeGenre);
        });
    }
}

function performBookSearch(query, genre) {
    const results = window.bookSystem.searchBooks(query, genre);
    updateLibraryDisplay(results);
}

function updateLibraryDisplay(books) {
    // This would update the library display with filtered books
    console.log('Displaying books:', books);
}

// Initialize on library page
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('library.html')) {
        setupLibrarySearch();
    }
});