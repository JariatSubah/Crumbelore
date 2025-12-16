from datetime import datetime
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import (
    Category, Product, Customer, Cart, CartItem,
    Order, OrderItem, Booking, Book, Event
)
from .serializers import (
    CategorySerializer, ProductSerializer, CustomerSerializer,
    CartSerializer, CartItemSerializer, OrderSerializer, OrderItemSerializer,
    BookingSerializer, BookSerializer, EventSerializer,
    UserSerializer, UserRegistrationSerializer
)

# Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def user_login(request):
    """User login endpoint with token authentication"""
    username = request.data.get('username') or request.data.get('email')
    password = request.data.get('password')
    
    print(f"Login attempt: username={username}")
    
    if not username or not password:
        return Response({
            'success': False,
            'error': 'Username/Email and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Try to authenticate with username
    user = authenticate(request, username=username, password=password)
    
    # If authentication fails, try with email
    if not user:
        try:
            user_obj = User.objects.get(email=username)
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass
    
    if user:
        # Create or get token for the user
        token, created = Token.objects.get_or_create(user=user)
        
        # Login user (optional, for session auth)
        login(request, user)
        
        # Get customer profile
        try:
            customer = Customer.objects.get(user=user)
        except Customer.DoesNotExist:
            # Create customer profile if it doesn't exist
            customer = Customer.objects.create(
                user=user,
                phone='',
                city='Chattogram',
                loyalty_points=100,
                books_read=0
            )
        
        return Response({
            'success': True,
            'message': 'Login successful',
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            },
            'customer': {
                'id': customer.id,
                'phone': customer.phone,
                'city': customer.city,
                'loyalty_points': customer.loyalty_points,
                'books_read': customer.books_read
            }
        })
    else:
        return Response({
            'success': False,
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_logout(request):
    """User logout endpoint"""
    logout(request)
    return Response({
        'success': True,
        'message': 'Logged out successfully'
    })


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def user_register(request):
    """User registration endpoint"""
    print("Registration attempt with data:", request.data)
    
    # Check if username already exists
    username = request.data.get('username') or request.data.get('email')
    email = request.data.get('email')
    
    if User.objects.filter(username=username).exists():
        return Response({
            'success': False,
            'error': 'Username already exists'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(email=email).exists():
        return Response({
            'success': False,
            'error': 'Email already exists'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate required fields
    required_fields = ['username', 'email', 'password']
    for field in required_fields:
        if not request.data.get(field):
            return Response({
                'success': False,
                'error': f'{field} is required'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=request.data.get('password'),
            first_name=request.data.get('first_name', ''),
            last_name=request.data.get('last_name', '')
        )
        
        # Create Customer profile
        customer = Customer.objects.create(
            user=user,
            phone=request.data.get('phone', ''),
            city=request.data.get('city', 'Chattogram'),
            loyalty_points=100,
            books_read=0,
            favorite_genre=request.data.get('favorite_genre', '')
        )
        
        # Create token for auto-login
        token, created = Token.objects.get_or_create(user=user)
        
        # Login user
        login(request, user)
        
        return Response({
            'success': True,
            'message': 'Registration successful',
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff
            },
            'customer': {
                'id': customer.id,
                'phone': customer.phone,
                'city': customer.city,
                'loyalty_points': customer.loyalty_points,
                'books_read': customer.books_read,
                'favorite_genre': customer.favorite_genre
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print("Registration error:", str(e))
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_dashboard(request):
    """Get customer dashboard data"""
    try:
        customer = Customer.objects.get(user=request.user)
        
        # Get recent orders
        orders = Order.objects.filter(customer=customer).order_by('-created_at')[:5]
        order_serializer = OrderSerializer(orders, many=True)
        
        # Get upcoming bookings
        bookings = Booking.objects.filter(
            customer=customer, 
            status__in=['pending', 'confirmed']
        ).order_by('date', 'time')[:5]
        booking_serializer = BookingSerializer(bookings, many=True)
        
        return Response({
            'success': True,
            'customer': CustomerSerializer(customer).data,
            'recent_orders': order_serializer.data,
            'upcoming_bookings': booking_serializer.data,
            'stats': {
                'total_orders': Order.objects.filter(customer=customer).count(),
                'total_spent': sum(order.total for order in Order.objects.filter(customer=customer) if order.total),
                'books_read': customer.books_read,
                'loyalty_points': customer.loyalty_points
            }
        })
        
    except Customer.DoesNotExist:
        # Create customer profile if it doesn't exist
        customer = Customer.objects.create(
            user=request.user,
            phone='',
            city='Chattogram',
            loyalty_points=100,
            books_read=0
        )
        
        return Response({
            'success': True,
            'customer': CustomerSerializer(customer).data,
            'recent_orders': [],
            'upcoming_bookings': [],
            'stats': {
                'total_orders': 0,
                'total_spent': 0,
                'books_read': 0,
                'loyalty_points': 100
            },
            'message': 'New customer profile created'
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """Get current authenticated user"""
    serializer = UserSerializer(request.user)
    return Response({
        'success': True,
        'user': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_stats(request):
    """Get customer statistics"""
    try:
        customer = Customer.objects.get(user=request.user)
        
        # Calculate stats
        total_orders = Order.objects.filter(customer=customer).count()
        orders = Order.objects.filter(customer=customer)
        total_spent = sum([order.total for order in orders if order.total])
        
        return Response({
            'success': True,
            'stats': {
                'books_read': customer.books_read,
                'loyalty_points': customer.loyalty_points,
                'total_orders': total_orders,
                'total_spent': total_spent,
                'books_this_month': 4,
                'favorite_item': 'Vanilla Dream Latte',
                'next_event': 'Mystery Night - Friday 7PM',
                'events_attended': 8,
            }
        })
    except Customer.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Customer profile not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_orders(request):
    """Get customer orders"""
    try:
        customer = Customer.objects.get(user=request.user)
        orders = Order.objects.filter(customer=customer).order_by('-created_at')[:10]
        serializer = OrderSerializer(orders, many=True)
        
        return Response({
            'success': True,
            'orders': serializer.data
        })
    except Customer.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Customer profile not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_reservations(request):
    """Get customer reservations"""
    try:
        customer = Customer.objects.get(user=request.user)
        reservations = Booking.objects.filter(customer=customer).order_by('-date')[:10]
        serializer = BookingSerializer(reservations, many=True)
        
        return Response({
            'success': True,
            'reservations': serializer.data
        })
    except Customer.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Customer profile not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_reading(request):
    """Get customer reading progress"""
    try:
        customer = Customer.objects.get(user=request.user)
        
        reading_data = {
            'current_book': {
                'title': 'The Silent Patient',
                'author': 'Alex Michaelides',
                'description': 'A gripping psychological thriller...',
                'progress': 70,
                'pages': 350,
                'current_page': 245
            }
        }
        
        return Response({
            'success': True,
            'reading': reading_data
        })
    except Customer.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Customer profile not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })


# ViewSets
class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for Category model"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]


class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet for Product model"""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = Product.objects.all()
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category__id=category)
        
        # Filter by product type
        product_type = self.request.query_params.get('type', None)
        if product_type:
            queryset = queryset.filter(product_type=product_type)
        
        # Filter by availability
        is_available = self.request.query_params.get('available', None)
        if is_available:
            queryset = queryset.filter(is_available=True)
        
        # Filter featured
        is_featured = self.request.query_params.get('featured', None)
        if is_featured:
            queryset = queryset.filter(is_featured=True)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured products"""
        products = Product.objects.filter(is_featured=True)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)


class BookViewSet(viewsets.ModelViewSet):
    """ViewSet for Book model"""
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = Book.objects.all()
        
        # Filter by genre
        genre = self.request.query_params.get('genre', None)
        if genre:
            queryset = queryset.filter(genre=genre)
        
        # Filter by status
        book_status = self.request.query_params.get('status', None)
        if book_status:
            queryset = queryset.filter(status=book_status)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get available books"""
        books = Book.objects.filter(status='available')
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)


class EventViewSet(viewsets.ModelViewSet):
    """ViewSet for Event model"""
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = Event.objects.all()
        
        # Filter by event type
        event_type = self.request.query_params.get('type', None)
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        # Filter by status
        event_status = self.request.query_params.get('status', None)
        if event_status:
            queryset = queryset.filter(status=event_status)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming events"""
        events = Event.objects.filter(status='upcoming')
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)


class CartViewSet(viewsets.ModelViewSet):
    """ViewSet for Cart model"""
    queryset = Cart.objects.all()
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Get or create cart for user
        cart, created = Cart.objects.get_or_create(
            user=self.request.user,
            is_active=True,
            defaults={'user': self.request.user, 'is_active': True}
        )
        return Cart.objects.filter(user=self.request.user, is_active=True)
    
    def get_object(self):
        """Get the current user's active cart"""
        cart, created = Cart.objects.get_or_create(
            user=self.request.user,
            is_active=True,
            defaults={'user': self.request.user, 'is_active': True}
        )
        return cart
    
    def create(self, request, *args, **kwargs):
        """Create a new cart (or get existing one)"""
        cart, created = Cart.objects.get_or_create(
            user=request.user,
            is_active=True,
            defaults={'user': request.user, 'is_active': True}
        )
        
        serializer = self.get_serializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        """Add item to cart"""
        cart = self.get_object()
        product_id = request.data.get('product')
        quantity = int(request.data.get('quantity', 1))
        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if item already exists in cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        # Return the cart item details
        cart_item_serializer = CartItemSerializer(cart_item)
        return Response({
            'success': True,
            'message': f'{product.name} added to cart',
            'cart_item': cart_item_serializer.data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['delete'])
    def remove_item(self, request, pk=None):
        """Remove item from cart"""
        cart = self.get_object()
        item_id = request.data.get('item_id')
        
        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.delete()
            return Response({
                'success': True,
                'message': 'Item removed from cart'
            })
        except CartItem.DoesNotExist:
            return Response({
                'error': 'Item not found in cart'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get'])
    def items(self, request, pk=None):
        """Get all items in cart"""
        cart = self.get_object()
        items = cart.items.all()
        serializer = CartItemSerializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def total(self, request, pk=None):
        """Get cart total"""
        cart = self.get_object()
        return Response({
            'total': cart.get_total(),
            'item_count': cart.items.count()
        })


class CartItemViewSet(viewsets.ModelViewSet):
    """ViewSet for CartItem model"""
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Get user's active cart items
        cart, created = Cart.objects.get_or_create(
            user=self.request.user,
            is_active=True,
            defaults={'user': self.request.user, 'is_active': True}
        )
        return CartItem.objects.filter(cart=cart)
    
    def create(self, request, *args, **kwargs):
        """Add item to cart (simplified version)"""
        product_id = request.data.get('product')
        quantity = int(request.data.get('quantity', 1))
        
        # Get or create cart
        cart, created = Cart.objects.get_or_create(
            user=request.user,
            is_active=True,
            defaults={'user': request.user, 'is_active': True}
        )
        
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if item already exists
        cart_item, item_created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        
        if not item_created:
            cart_item.quantity += quantity
            cart_item.save()
        
        serializer = self.get_serializer(cart_item)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def update(self, request, *args, **kwargs):
        """Update item quantity"""
        instance = self.get_object()
        quantity = request.data.get('quantity')
        
        if quantity is not None:
            instance.quantity = int(quantity)
            instance.save()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """Remove item from cart"""
        instance = self.get_object()
        product_name = instance.product.name
        instance.delete()
        
        return Response({
            'success': True,
            'message': f'{product_name} removed from cart'
        })


class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for Order model"""
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(customer__user=self.request.user)
    
    def perform_create(self, serializer):
        customer = Customer.objects.get(user=self.request.user)
        serializer.save(customer=customer)


class BookingViewSet(viewsets.ModelViewSet):
    """ViewSet for Booking model"""
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Booking.objects.all()
        return Booking.objects.filter(customer__user=self.request.user)
    
    def perform_create(self, serializer):
        customer = Customer.objects.get(user=self.request.user)
        serializer.save(customer=customer)
        # In your Django views.py (for customer dashboard)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_current_reading(request):
    """Get current reading data for authenticated customer"""
    try:
        # FIX: Use Customer.objects.get() instead of request.user.customer
        customer = Customer.objects.get(user=request.user)
        
        # Return demo data
        data = {
            "success": True,
            "book": {
                "title": "The Silent Patient",
                "author": "Alex Michaelides",
                "description": "A gripping psychological thriller about a woman's act of violence against her husband.",
                "progress": 70,
                "total_pages": 350,
                "current_page": 245,
                "status": "reading"
            }
        }
        return Response(data)
    except Customer.DoesNotExist:
        # Create customer profile if it doesn't exist
        customer = Customer.objects.create(
            user=request.user,
            phone='',
            city='Chattogram',
            loyalty_points=100,
            books_read=0
        )
        data = {
            "success": True,
            "book": {
                "title": "The Silent Patient",
                "author": "Alex Michaelides",
                "description": "A gripping psychological thriller about a woman's act of violence against her husband.",
                "progress": 70,
                "total_pages": 350,
                "current_page": 245,
                "status": "reading"
            }
        }
        return Response(data)