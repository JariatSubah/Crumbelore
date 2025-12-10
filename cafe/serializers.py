from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Category, Product, Customer, Cart, CartItem,
    Order, OrderItem, Booking, Book, Event
)

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'icon', 'product_count', 'created_at']
    
    def get_product_count(self, obj):
        return obj.products.count()

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'category', 'category_name', 'product_type',
            'description', 'price', 'image', 'icon', 'ingredients',
            'calories', 'is_available', 'is_featured', 'rating',
            'created_at', 'updated_at'
        ]

class CustomerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Customer
        fields = [
            'id', 'username', 'email', 'full_name', 'phone',
            'address', 'city', 'postal_code', 'loyalty_points',
            'books_read', 'favorite_genre', 'created_at'
        ]
    
    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_name', 'product_price', 'quantity', 'subtotal', 'added_at']
    
    def get_subtotal(self, obj):
        return obj.get_subtotal()

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total', 'is_active', 'created_at', 'updated_at']
    
    def get_total(self, obj):
        return obj.get_total()

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'subtotal']
    
    def get_subtotal(self, obj):
        return obj.get_subtotal()

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_id', 'customer', 'customer_name', 'status',
            'delivery_option', 'delivery_address', 'payment_method',
            'subtotal', 'delivery_fee', 'discount', 'total',
            'notes', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['order_id']
    
    def get_customer_name(self, obj):
        return obj.customer.user.get_full_name() or obj.customer.user.username

class BookingSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'booking_id', 'customer', 'customer_name', 'booking_type',
            'date', 'time', 'duration', 'party_size', 'status',
            'special_requests', 'created_at'
        ]
        read_only_fields = ['booking_id']
    
    def get_customer_name(self, obj):
        return obj.customer.user.get_full_name() or obj.customer.user.username

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'genre', 'isbn', 'description',
            'pages', 'published_year', 'status', 'rating', 'created_at'
        ]

class EventSerializer(serializers.ModelSerializer):
    available_spots = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'name', 'event_type', 'description', 'date', 'time',
            'duration', 'max_participants', 'current_participants',
            'available_spots', 'price', 'status', 'created_at'
        ]
    
    def get_available_spots(self, obj):
        return obj.max_participants - obj.current_participants

class UserSerializer(serializers.ModelSerializer):
    customer_profile = CustomerSerializer(source='customer_profile', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'customer_profile']
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)
    phone = serializers.CharField(max_length=20)
    
    def create(self, validated_data):
        phone = validated_data.pop('phone')
        user = User.objects.create_user(**validated_data)
        Customer.objects.create(user=user, phone=phone)
        return user