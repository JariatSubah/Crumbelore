"""
Complete setup script for Crumbelore Django backend
Run this after creating the project structure
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crumbelore.settings')
django.setup()

from django.contrib.auth.models import User
from cafe.models import Category, Product, Customer, Book, Event

def create_superuser():
    """Create superuser for admin panel"""
    print("\n=== Creating Superuser ===")
    
    if User.objects.filter(username='admin').exists():
        print("✓ Superuser 'admin' already exists")
        return
    
    user = User.objects.create_superuser(
        username='admin',
        email='admin@crumbelore.com',
        password='admin123',  # Change this in production!
        first_name='Admin',
        last_name='User'
    )
    print(f"✓ Superuser created: {user.username}")
    print(f"  Email: {user.email}")
    print(f"  Password: admin123 (CHANGE THIS!)")

def create_demo_users():
    """Create demo customer users"""
    print("\n=== Creating Demo Users ===")
    
    # Customer user
    if not User.objects.filter(username='customer').exists():
        customer_user = User.objects.create_user(
            username='customer',
            email='customer@crumbelore.com',
            password='customer123',
            first_name='Customer',
            last_name='User'
        )
        Customer.objects.create(
            user=customer_user,
            phone='+880-123-456-7890',
            address='123 Literary Lane',
            city='Chattogram',
            postal_code='4000',
            loyalty_points=2340,
            books_read=47,
            favorite_genre='Mystery'
        )
        print(f"✓ Customer user created: customer@crumbelore.com / customer123")
    else:
        print("✓ Customer user already exists")

def create_categories():
    """Create product categories"""
    print("\n=== Creating Categories ===")
    
    categories_data = [
        {'name': 'Artisan Coffee', 'icon': 'fas fa-coffee', 'description': 'Premium coffee blends'},
        {'name': 'Sweet Creations', 'icon': 'fas fa-birthday-cake', 'description': 'Handcrafted desserts'},
        {'name': 'Literary Specials', 'icon': 'fas fa-book', 'description': 'Book-themed beverages'},
        {'name': 'Combo Deals', 'icon': 'fas fa-gift', 'description': 'Special combination offers'},
    ]
    
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults=cat_data
        )
        if created:
            print(f"✓ Created category: {category.name}")
        else:
            print(f"  Category exists: {category.name}")

def create_products():
    """Create sample products"""
    print("\n=== Creating Products ===")
    
    # Get categories
    coffee_cat = Category.objects.get(name='Artisan Coffee')
    dessert_cat = Category.objects.get(name='Sweet Creations')
    literary_cat = Category.objects.get(name='Literary Specials')
    combo_cat = Category.objects.get(name='Combo Deals')
    
    products_data = [
        {
            'name': 'Classic Espresso',
            'category': coffee_cat,
            'product_type': 'coffee',
            'description': 'Rich, full-bodied espresso shot extracted from our signature blend of Ethiopian and Colombian beans.',
            'price': 180,
            'icon': 'fas fa-coffee',
            'ingredients': 'Ethiopian Coffee Beans, Colombian Beans, Pure Water',
            'calories': 5,
            'is_featured': True,
            'rating': 4.6
        },
        {
            'name': 'Vanilla Dream Latte',
            'category': coffee_cat,
            'product_type': 'coffee',
            'description': 'Smooth espresso with steamed milk and a touch of Madagascar vanilla.',
            'price': 280,
            'icon': 'fas fa-mug-hot',
            'ingredients': 'Espresso, Steamed Milk, Madagascar Vanilla, Microfoam',
            'calories': 220,
            'is_featured': True,
            'rating': 4.8
        },
        {
            'name': 'Caramel Macchiato',
            'category': coffee_cat,
            'product_type': 'coffee',
            'description': 'Espresso marked with steamed milk and finished with house-made caramel drizzle.',
            'price': 320,
            'icon': 'fas fa-coffee',
            'ingredients': 'Espresso, Steamed Milk, House Caramel, Vanilla Syrup',
            'calories': 250,
            'rating': 4.7
        },
        {
            'name': 'Red Velvet Romance',
            'category': dessert_cat,
            'product_type': 'dessert',
            'description': 'Moist red velvet cake layered with cream cheese frosting.',
            'price': 450,
            'icon': 'fas fa-birthday-cake',
            'ingredients': 'Red Velvet Sponge, Cream Cheese, Cocoa Powder, Fresh Berries, Butter',
            'calories': 380,
            'is_featured': True,
            'rating': 4.9
        },
        {
            'name': 'Dark Chocolate Mystery Tart',
            'category': dessert_cat,
            'product_type': 'dessert',
            'description': 'Decadent dark chocolate tart with silky ganache filling.',
            'price': 420,
            'icon': 'fas fa-cookie-bite',
            'ingredients': 'Dark Chocolate (70%), Heavy Cream, Almond Flour, Butter, Sugar',
            'calories': 320,
            'rating': 4.8
        },
        {
            'name': 'Cosmic Brownies',
            'category': dessert_cat,
            'product_type': 'dessert',
            'description': 'Fudgy brownies with chunks of dark chocolate and edible gold stars.',
            'price': 350,
            'icon': 'fas fa-cookie',
            'ingredients': 'Dark Chocolate, Cocoa Powder, Butter, Brown Sugar, Edible Gold Stars',
            'calories': 290,
            'rating': 4.7
        },
        {
            'name': 'Philosopher\'s Blend',
            'category': literary_cat,
            'product_type': 'coffee',
            'description': 'Thoughtful medium roast blend with notes of hazelnut and vanilla.',
            'price': 300,
            'icon': 'fas fa-brain',
            'ingredients': 'Medium Roast Beans, Hazelnut Notes, Vanilla Essence, Steamed Milk',
            'calories': 180,
            'rating': 4.6
        },
        {
            'name': 'Fantasy Forest Latte',
            'category': literary_cat,
            'product_type': 'coffee',
            'description': 'Matcha-infused latte with hints of mint and honey.',
            'price': 380,
            'icon': 'fas fa-leaf',
            'ingredients': 'Premium Matcha, Fresh Mint, Wildflower Honey, Oat Milk',
            'calories': 260,
            'rating': 4.7
        },
        {
            'name': 'Romance Reader\'s Delight',
            'category': combo_cat,
            'product_type': 'combo',
            'description': 'Vanilla Dream Latte + Red Velvet Romance + Romance Novel.',
            'price': 650,
            'icon': 'fas fa-heart',
            'ingredients': 'Vanilla Latte, Red Velvet Cake, Romance Novel, Bookmark',
            'calories': 600,
            'is_featured': True,
            'rating': 4.9
        },
        {
            'name': 'Mystery Solver\'s Kit',
            'category': combo_cat,
            'product_type': 'combo',
            'description': 'Classic Espresso + Dark Chocolate Tart + Mystery Novel.',
            'price': 580,
            'icon': 'fas fa-search',
            'ingredients': 'Espresso, Dark Chocolate Tart, Mystery Novel, Detective Notebook',
            'calories': 500,
            'rating': 4.8
        },
    ]
    
    for product_data in products_data:
        product, created = Product.objects.get_or_create(
            name=product_data['name'],
            defaults=product_data
        )
        if created:
            print(f"✓ Created product: {product.name}")
        else:
            print(f"  Product exists: {product.name}")

def create_books():
    """Create sample books"""
    print("\n=== Creating Books ===")
    
    books_data = [
        {
            'title': 'The Silent Patient',
            'author': 'Alex Michaelides',
            'genre': 'mystery',
            'isbn': '9781250301697',
            'description': 'A gripping psychological thriller about a woman\'s act of violence.',
            'pages': 336,
            'published_year': 2019,
            'status': 'available',
            'rating': 4.8
        },
        {
            'title': 'Project Hail Mary',
            'author': 'Andy Weir',
            'genre': 'sci-fi',
            'isbn': '9780593135204',
            'description': 'A lone astronaut must save humanity.',
            'pages': 496,
            'published_year': 2021,
            'status': 'available',
            'rating': 4.6
        },
        {
            'title': 'The House in the Cerulean Sea',
            'author': 'TJ Klune',
            'genre': 'fantasy',
            'isbn': '9781250217318',
            'description': 'A heartwarming fantasy about magical children.',
            'pages': 394,
            'published_year': 2020,
            'status': 'borrowed',
            'rating': 4.7
        },
    ]
    
    for book_data in books_data:
        book, created = Book.objects.get_or_create(
            isbn=book_data['isbn'],
            defaults=book_data
        )
        if created:
            print(f"✓ Created book: {book.title}")
        else:
            print(f"  Book exists: {book.title}")

def create_events():
    """Create sample events"""
    print("\n=== Creating Events ===")
    
    from datetime import date, time
    
    events_data = [
        {
            'name': 'Mystery Lovers Book Club',
            'event_type': 'book-club',
            'description': 'Dive deep into thrilling mysteries with fellow enthusiasts.',
            'date': date(2024, 12, 20),
            'time': time(18, 30),
            'duration': 2,
            'max_participants': 12,
            'current_participants': 8,
            'price': 0,
            'status': 'upcoming'
        },
        {
            'name': 'Creative Writing Workshop',
            'event_type': 'workshop',
            'description': 'Learn storytelling fundamentals with local author.',
            'date': date(2024, 12, 15),
            'time': time(14, 0),
            'duration': 3,
            'max_participants': 15,
            'current_participants': 12,
            'price': 800,
            'status': 'upcoming'
        },
    ]
    
    for event_data in events_data:
        event, created = Event.objects.get_or_create(
            name=event_data['name'],
            defaults=event_data
        )
        if created:
            print(f"✓ Created event: {event.name}")
        else:
            print(f"  Event exists: {event.name}")

def main():
    """Main setup function"""
    print("=" * 60)
    print("CRUMBELORE BACKEND SETUP")
    print("=" * 60)
    
    try:
        create_superuser()
        create_demo_users()
        create_categories()
        create_products()
        create_books()
        create_events()
        
        print("\n" + "=" * 60)
        print("✓ SETUP COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print("\nAdmin Panel Access:")
        print("  URL: http://127.0.0.1:8000/admin/")
        print("  Username: admin")
        print("  Password: admin123")
        print("\nCustomer Login:")
        print("  Email: customer@crumbelore.com")
        print("  Password: customer123")
        print("\nNext Steps:")
        print("  1. Run: python manage.py runserver")
        print("  2. Open: http://127.0.0.1:8000/admin/")
        print("  3. Login with admin credentials")
        print("  4. Start managing your products, users, and orders!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n✗ Error during setup: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()