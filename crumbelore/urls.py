"""
URL configuration for crumbelore project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def home(request):
    """API home endpoint"""
    return JsonResponse({
        'message': 'Welcome to Crumbelore API',
        'version': '1.0.0',
        'endpoints': {
            'admin': '/admin/',
            'api': '/api/',
            'products': '/api/products/',
            'categories': '/api/categories/',
            'books': '/api/books/',
            'events': '/api/events/',
            'orders': '/api/orders/',
            'bookings': '/api/bookings/',
            'cart': '/api/cart/',
            'auth': {
                'login': '/api/auth/login/',
                'logout': '/api/auth/logout/',
                'register': '/api/auth/register/',
                'me': '/api/auth/me/',
            }
        },
        'status': 'active'
    })

urlpatterns = [
    path('', home, name='home'),  # Homepage
    path('admin/', admin.site.urls),
    path('api/', include('cafe.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)