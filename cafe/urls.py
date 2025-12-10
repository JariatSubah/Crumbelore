"""
URL configuration for cafe app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'books', views.BookViewSet, basename='book')
router.register(r'events', views.EventViewSet, basename='event')
router.register(r'orders', views.OrderViewSet, basename='order')
router.register(r'bookings', views.BookingViewSet, basename='booking')
router.register(r'cart', views.CartViewSet, basename='cart')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('rest_framework.urls')),
    path('auth/login/', views.user_login, name='login'),
    path('auth/logout/', views.user_logout, name='logout'),
    path('auth/register/', views.user_register, name='register'),
    path('auth/me/', views.get_current_user, name='current-user'),
]
