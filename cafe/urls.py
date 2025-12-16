# cafe/urls.py - CORRECTED VERSION
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'products', views.ProductViewSet)
router.register(r'categories', views.CategoryViewSet)
router.register(r'books', views.BookViewSet)
router.register(r'events', views.EventViewSet)
router.register(r'orders', views.OrderViewSet, basename='order')
router.register(r'bookings', views.BookingViewSet, basename='booking')
router.register(r'cart', views.CartViewSet, basename='cart')
router.register(r'cart-items', views.CartItemViewSet, basename='cartitem')

urlpatterns = [
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('auth/login/', views.user_login, name='user_login'),
    path('auth/logout/', views.user_logout, name='user_logout'),
    path('auth/register/', views.user_register, name='user_register'),
    path('auth/me/', views.get_current_user, name='get_current_user'),
    
    # Dashboard endpoints (NO /api/ prefix here!)
    path('customer/dashboard/', views.customer_dashboard, name='customer_dashboard'),
    path('customer/stats/', views.customer_stats, name='customer_stats'),
    path('customer/orders/', views.customer_orders, name='customer_orders'),
    path('customer/reservations/', views.customer_reservations, name='customer_reservations'),
    path('customer/reading/', views.customer_reading, name='customer_reading'),
    path('customer/current-reading/', views.customer_current_reading, name='customer_current_reading'),  # ADD THIS!
    
    # Health check
    path('health/', views.health_check, name='health_check'),
    
    # REMOVE THESE DUPLICATES WITH /api/ prefix:
    # path('api/customer/current-reading/', views.customer_current_reading, name='customer_current_reading'),
    # path('api/customer/dashboard/', views.customer_dashboard, name='customer_dashboard'),
    # path('api/customer/stats/', views.customer_stats, name='customer_stats'),
    # path('api/customer/orders/', views.customer_orders, name='customer_orders'),
]