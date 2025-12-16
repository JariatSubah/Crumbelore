from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class Category(models.Model):
    """Product categories (Coffee, Desserts, Books, etc.)"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Product(models.Model):
    """Products available in the café"""
    PRODUCT_TYPES = [
        ('coffee', 'Coffee'),
        ('dessert', 'Dessert'),
        ('book', 'Book'),
        ('combo', 'Combo'),
    ]
    
    name = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPES)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True)
    ingredients = models.TextField(blank=True, help_text="Comma-separated list")
    calories = models.IntegerField(blank=True, null=True)
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(0.00), MaxValueValidator(5.00)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - ৳{self.price}"

class Customer(models.Model):
    """Customer information"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer')
    phone = models.CharField(max_length=20)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, default='Chattogram')
    postal_code = models.CharField(max_length=10, blank=True)
    loyalty_points = models.IntegerField(default=0)
    books_read = models.IntegerField(default=0)
    favorite_genre = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"

class Cart(models.Model):
    """Shopping cart"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='carts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Cart {self.id} - {self.user.username}"
    
    def get_total(self):
        return sum(item.get_subtotal() for item in self.items.all())

class CartItem(models.Model):
    """Items in shopping cart"""
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.quantity}x {self.product.name}"
    
    def get_subtotal(self):
        return self.quantity * self.product.price

class Order(models.Model):
    """Customer orders"""
    ORDER_STATUS = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    DELIVERY_OPTIONS = [
        ('pickup', 'Pickup'),
        ('delivery', 'Delivery'),
        ('dine-in', 'Dine In'),
    ]
    
    PAYMENT_METHODS = [
        ('card', 'Credit/Debit Card'),
        ('bkash', 'bKash'),
        ('cash', 'Cash'),
    ]
    
    order_id = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default='pending')
    delivery_option = models.CharField(max_length=20, choices=DELIVERY_OPTIONS)
    delivery_address = models.TextField(blank=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order {self.order_id} - {self.customer.user.username}"

class OrderItem(models.Model):
    """Items in an order"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.quantity}x {self.product.name}"
    
    def get_subtotal(self):
        return self.quantity * self.price

class Booking(models.Model):
    """Table and space bookings"""
    BOOKING_TYPES = [
        ('table', 'Table Reservation'),
        ('reading-corner', 'Reading Corner'),
        ('study-room', 'Study Room'),
        ('events', 'Special Event'),
    ]
    
    BOOKING_STATUS = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    booking_id = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='bookings')
    booking_type = models.CharField(max_length=20, choices=BOOKING_TYPES)
    date = models.DateField()
    time = models.TimeField()
    duration = models.IntegerField(help_text="Duration in hours")
    party_size = models.IntegerField()
    status = models.CharField(max_length=20, choices=BOOKING_STATUS, default='pending')
    special_requests = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date', '-time']
    
    def __str__(self):
        return f"Booking {self.booking_id} - {self.customer.user.username}"

class Book(models.Model):
    """Books in library"""
    BOOK_GENRES = [
        ('mystery', 'Mystery & Thriller'),
        ('romance', 'Romance'),
        ('fantasy', 'Fantasy'),
        ('sci-fi', 'Science Fiction'),
        ('non-fiction', 'Non-Fiction'),
        ('biography', 'Biography'),
        ('poetry', 'Poetry'),
        ('young-adult', 'Young Adult'),
    ]
    
    BOOK_STATUS = [
        ('available', 'Available'),
        ('borrowed', 'Borrowed'),
        ('reserved', 'Reserved'),
    ]
    
    title = models.CharField(max_length=300)
    author = models.CharField(max_length=200)
    genre = models.CharField(max_length=20, choices=BOOK_GENRES)
    isbn = models.CharField(max_length=13, unique=True, blank=True)
    description = models.TextField()
    pages = models.IntegerField()
    published_year = models.IntegerField()
    status = models.CharField(max_length=20, choices=BOOK_STATUS, default='available')
    rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0.00,
        validators=[MinValueValidator(0.00), MaxValueValidator(5.00)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['title']
    
    def __str__(self):
        return f"{self.title} by {self.author}"

class Event(models.Model):
    """Café events"""
    EVENT_TYPES = [
        ('book-club', 'Book Club'),
        ('author-event', 'Author Event'),
        ('workshop', 'Workshop'),
        ('social', 'Social Event'),
    ]
    
    EVENT_STATUS = [
        ('upcoming', 'Upcoming'),
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    name = models.CharField(max_length=200)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    description = models.TextField()
    date = models.DateField()
    time = models.TimeField()
    duration = models.IntegerField(help_text="Duration in hours")
    max_participants = models.IntegerField()
    current_participants = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=EVENT_STATUS, default='upcoming')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['date', 'time']
    
    def __str__(self):
        return f"{self.name} - {self.date}"