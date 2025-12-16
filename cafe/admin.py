from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import (
    Category, Product, Customer, Cart, CartItem, 
    Order, OrderItem, Booking, Book, Event
)

# Inline classes for related models
class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 1
    readonly_fields = ('added_at',)

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('get_subtotal_display',)
    
    def get_subtotal_display(self, obj):
        # Handle cases where obj is None or has None values
        if obj is None or obj.pk is None:
            return "৳0.00"
        
        # Check if quantity or price is None before multiplication
        if obj.quantity is None or obj.price is None:
            return "৳0.00"
        
        try:
            return f"৳{obj.get_subtotal()}"
        except (TypeError, ValueError):
            return "৳0.00"
    
    get_subtotal_display.short_description = 'Subtotal'

class CustomerInline(admin.StackedInline):
    model = Customer
    can_delete = False
    verbose_name_plural = 'Customer Profile'
    fields = ('phone', 'address', 'city', 'postal_code', 'loyalty_points', 'books_read', 'favorite_genre')

# Enhanced User Admin
class UserAdmin(BaseUserAdmin):
    inlines = (CustomerInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
    search_fields = ('username', 'first_name', 'last_name', 'email')

# Unregister default User admin and register enhanced version
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# Category Admin
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon', 'product_count', 'created_at')
    search_fields = ('name', 'description')
    list_filter = ('created_at',)
    ordering = ('name',)
    
    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Products'

# Product Admin
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'category', 'product_type', 'price', 
        'is_available', 'is_featured', 'rating', 'created_at'
    )
    list_filter = ('product_type', 'category', 'is_available', 'is_featured', 'created_at')
    search_fields = ('name', 'description', 'ingredients')
    list_editable = ('is_available', 'is_featured', 'price')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'category', 'product_type', 'description')
        }),
        ('Pricing & Availability', {
            'fields': ('price', 'is_available', 'is_featured', 'rating')
        }),
        ('Details', {
            'fields': ('ingredients', 'calories', 'icon', 'image')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_available', 'mark_as_unavailable', 'mark_as_featured']
    
    def mark_as_available(self, request, queryset):
        queryset.update(is_available=True)
    mark_as_available.short_description = "Mark selected products as available"
    
    def mark_as_unavailable(self, request, queryset):
        queryset.update(is_available=False)
    mark_as_unavailable.short_description = "Mark selected products as unavailable"
    
    def mark_as_featured(self, request, queryset):
        queryset.update(is_featured=True)
    mark_as_featured.short_description = "Mark selected products as featured"

# Customer Admin
@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = (
        'get_full_name', 'get_email', 'phone', 
        'city', 'loyalty_points', 'books_read', 'created_at'
    )
    search_fields = ('user__username', 'user__email', 'user__first_name', 'user__last_name', 'phone')
    list_filter = ('city', 'created_at', 'favorite_genre')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Contact Details', {
            'fields': ('phone', 'address', 'city', 'postal_code')
        }),
        ('Customer Stats', {
            'fields': ('loyalty_points', 'books_read', 'favorite_genre')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    get_full_name.short_description = 'Full Name'
    
    def get_email(self, obj):
        return obj.user.email
    get_email.short_description = 'Email'

# Cart Admin
@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'item_count', 'get_total_display', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [CartItemInline]
    
    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = 'Items'
    
    def get_total_display(self, obj):
        return f"৳{obj.get_total()}"
    get_total_display.short_description = 'Total'

# Order Admin
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_id', 'customer', 'status', 'delivery_option', 
        'payment_method', 'total', 'created_at'
    )
    list_filter = ('status', 'delivery_option', 'payment_method', 'created_at')
    search_fields = ('order_id', 'customer__user__username', 'customer__user__email')
    readonly_fields = ('order_id', 'created_at', 'updated_at')
    inlines = [OrderItemInline]
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Order Information', {
            'fields': ('order_id', 'customer', 'status')
        }),
        ('Delivery Details', {
            'fields': ('delivery_option', 'delivery_address')
        }),
        ('Payment', {
            'fields': ('payment_method', 'subtotal', 'delivery_fee', 'discount', 'total')
        }),
        ('Additional Info', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_confirmed', 'mark_as_preparing', 'mark_as_completed']
    
    def mark_as_confirmed(self, request, queryset):
        queryset.update(status='confirmed')
    mark_as_confirmed.short_description = "Mark selected orders as confirmed"
    
    def mark_as_preparing(self, request, queryset):
        queryset.update(status='preparing')
    mark_as_preparing.short_description = "Mark selected orders as preparing"
    
    def mark_as_completed(self, request, queryset):
        queryset.update(status='completed')
    mark_as_completed.short_description = "Mark selected orders as completed"

# Booking Admin
@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'booking_id', 'customer', 'booking_type', 'date', 
        'time', 'duration', 'party_size', 'status', 'created_at'
    )
    list_filter = ('booking_type', 'status', 'date', 'created_at')
    search_fields = ('booking_id', 'customer__user__username', 'customer__user__email')
    readonly_fields = ('booking_id', 'created_at')
    date_hierarchy = 'date'
    ordering = ('-date', '-time')
    
    fieldsets = (
        ('Booking Information', {
            'fields': ('booking_id', 'customer', 'booking_type', 'status')
        }),
        ('Schedule', {
            'fields': ('date', 'time', 'duration', 'party_size')
        }),
        ('Special Requests', {
            'fields': ('special_requests',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_confirmed', 'mark_as_completed']
    
    def mark_as_confirmed(self, request, queryset):
        queryset.update(status='confirmed')
    mark_as_confirmed.short_description = "Mark selected bookings as confirmed"
    
    def mark_as_completed(self, request, queryset):
        queryset.update(status='completed')
    mark_as_completed.short_description = "Mark selected bookings as completed"

# Book Admin
@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'author', 'genre', 'status', 
        'rating', 'pages', 'published_year', 'created_at'
    )
    list_filter = ('genre', 'status', 'published_year', 'created_at')
    search_fields = ('title', 'author', 'isbn', 'description')
    list_editable = ('status',)
    readonly_fields = ('created_at',)
    ordering = ('title',)
    
    fieldsets = (
        ('Book Information', {
            'fields': ('title', 'author', 'genre', 'isbn')
        }),
        ('Details', {
            'fields': ('description', 'pages', 'published_year', 'rating')
        }),
        ('Availability', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_available', 'mark_as_borrowed']
    
    def mark_as_available(self, request, queryset):
        queryset.update(status='available')
    mark_as_available.short_description = "Mark selected books as available"
    
    def mark_as_borrowed(self, request, queryset):
        queryset.update(status='borrowed')
    mark_as_borrowed.short_description = "Mark selected books as borrowed"

# Event Admin
@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'event_type', 'date', 'time', 
        'duration', 'current_participants', 'max_participants', 
        'price', 'status', 'created_at'
    )
    list_filter = ('event_type', 'status', 'date', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at',)
    date_hierarchy = 'date'
    ordering = ('-date', '-time')
    
    fieldsets = (
        ('Event Information', {
            'fields': ('name', 'event_type', 'description', 'status')
        }),
        ('Schedule', {
            'fields': ('date', 'time', 'duration')
        }),
        ('Participants', {
            'fields': ('max_participants', 'current_participants')
        }),
        ('Pricing', {
            'fields': ('price',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_upcoming', 'mark_as_completed']
    
    def mark_as_upcoming(self, request, queryset):
        queryset.update(status='upcoming')
    mark_as_upcoming.short_description = "Mark selected events as upcoming"
    
    def mark_as_completed(self, request, queryset):
        queryset.update(status='completed')
    mark_as_completed.short_description = "Mark selected events as completed"

# Customize admin site header and title
admin.site.site_header = "Crumbelore Administration"
admin.site.site_title = "Crumbelore Admin Portal"
admin.site.index_title = "Welcome to Crumbelore Admin Panel"