from django.core.management.base import BaseCommand
from cafe.models import Category, Product
import os

class Command(BaseCommand):
    help = 'Loads the default menu items into the database'
    
    def handle(self, *args, **kwargs):
        # Create categories
        categories = {}
        for cat_name in ['Coffee', 'Desserts', 'Book', 'Combo']:
            category, created = Category.objects.get_or_create(
                name=cat_name,
                defaults={'description': f'{cat_name} category'}
            )
            categories[cat_name] = category
            self.stdout.write(self.style.SUCCESS(f'Category: {cat_name}'))
        
        # All products data WITH CORRECT IMAGE NAMES
        all_products = [
            # Coffee
            {
                "name": "Classic Espresso",
                "category": "Coffee",
                "product_type": "coffee",
                "price": "180.00",
                "description": "Rich, full-bodied espresso shot extracted from our signature blend of Ethiopian and Colombian beans.",
                "ingredients": "Ethiopian Coffee Beans, Colombian Beans, Pure Water",
                "calories": 5,
                "is_featured": True,
                "rating": "4.80",
                "is_available": True,
                "image": "products/classic-espresso.jpg"
            },
            {
                "name": "Vanilla Dream Latte",
                "category": "Coffee", 
                "product_type": "coffee",
                "price": "280.00",
                "description": "Smooth espresso with steamed milk and a touch of Madagascar vanilla, topped with silky microfoam.",
                "ingredients": "Espresso, Steamed Milk, Madagascar Vanilla, Microfoam",
                "calories": 220,
                "is_featured": False,
                "rating": "4.60",
                "is_available": True,
                "image": "products/vanilla-latte.jpg"
            },
            {
                "name": "Caramel Macchiato",
                "category": "Coffee",
                "product_type": "coffee",
                "price": "320.00",
                "description": "Espresso marked with steamed milk and finished with our house-made caramel drizzle.",
                "ingredients": "Espresso, Steamed Milk, House Caramel, Vanilla Syrup",
                "calories": 250,
                "is_featured": False,
                "rating": "4.70",
                "is_available": True,
                "image": "products/caramel-macchiato.jpg"
            },
            # Desserts
            {
                "name": "Red Velvet Romance",
                "category": "Desserts",
                "product_type": "dessert", 
                "price": "450.00",
                "description": "Moist red velvet cake layered with cream cheese frosting and a hint of cocoa, garnished with fresh berries.",
                "ingredients": "Red Velvet Sponge, Cream Cheese, Cocoa Powder, Fresh Berries, Butter",
                "calories": 380,
                "is_featured": True,
                "rating": "4.90",
                "is_available": True,
                "image": "products/red-velvet-cake.jpg"
            },
            {
                "name": "Dark Chocolate Mystery Tart",
                "category": "Desserts",
                "product_type": "dessert",
                "price": "420.00",
                "description": "Decadent dark chocolate tart with silky ganache filling and a buttery almond crust.",
                "ingredients": "Dark Chocolate (70%), Heavy Cream, Almond Flour, Butter, Sugar",
                "calories": 320,
                "is_featured": False,
                "rating": "4.75",
                "is_available": True,
                "image": "products/chocolate-tart.jpg"
            },
            {
                "name": "Cosmic Brownies", 
                "category": "Desserts",
                "product_type": "dessert",
                "price": "350.00",
                "description": "Fudgy brownies with chunks of dark chocolate and a sprinkle of edible gold stars.",
                "ingredients": "Dark Chocolate, Cocoa Powder, Butter, Brown Sugar, Edible Gold Stars",
                "calories": 290,
                "is_featured": False,
                "rating": "4.65",
                "is_available": True,
                "image": "products/cosmic-brownies.jpg"
            },
            # Book Specials
            {
                "name": "Philosopher's Blend",
                "category": "Book",
                "product_type": "book",
                "price": "300.00",
                "description": "A thoughtful medium roast blend with notes of hazelnut and vanilla, designed for deep contemplation.",
                "ingredients": "Medium Roast Beans, Hazelnut Notes, Vanilla Essence, Steamed Milk",
                "calories": 180,
                "is_featured": True,
                "rating": "4.85",
                "is_available": True,
                "image": "products/philosopher-blend.jpg"
            },
            {
                "name": "Fantasy Forest Latte",
                "category": "Book",
                "product_type": "book",
                "price": "380.00",
                "description": "Matcha-infused latte with hints of mint and honey, topped with emerald-colored foam art.",
                "ingredients": "Premium Matcha, Fresh Mint, Wildflower Honey, Oat Milk, Natural Green Coloring",
                "calories": 260,
                "is_featured": False,
                "rating": "4.80",
                "is_available": True,
                "image": "products/fantasy-forest-latte.jpg"
            },
            {
                "name": "Poet's Inspiration",
                "category": "Book",
                "product_type": "book",
                "price": "320.00",
                "description": "Light roast with floral notes of jasmine and bergamot, served in our vintage teacup collection.",
                "ingredients": "Light Roast Coffee, Jasmine Essence, Bergamot Oil, Rose Petals",
                "calories": 200,
                "is_featured": False,
                "rating": "4.70",
                "is_available": True,
                "image": "products/Poets-inspiration.jpg"  # Note: Capital P
            },
            # Literary Pairings
            {
                "name": "Romance Reader's Delight",
                "category": "Combo",
                "product_type": "combo",
                "price": "650.00",
                "description": "Vanilla Dream Latte + Red Velvet Romance + A curated romance novel from our collection.",
                "ingredients": "Vanilla Dream Latte, Red Velvet Romance Cake, Romance Novel, Complimentary Bookmark",
                "calories": 600,
                "is_featured": True,
                "rating": "4.95",
                "is_available": True,
                "image": "products/romance-delight.jpg"
            },
            {
                "name": "Mystery Solver's Kit",
                "category": "Combo", 
                "product_type": "combo",
                "price": "580.00",
                "description": "Classic Espresso + Dark Chocolate Mystery Tart + A gripping mystery novel to solve.",
                "ingredients": "Classic Espresso, Dark Chocolate Tart, Mystery Novel, Detective's Notebook",
                "calories": 500,
                "is_featured": False,
                "rating": "4.85",
                "is_available": True,
                "image": "products/mystery-solver-kit.jpg"
            },
            {
                "name": "Sci-Fi Explorer's Pack",
                "category": "Combo",
                "product_type": "combo",
                "price": "620.00",
                "description": "Fantasy Forest Latte + Cosmic Brownies + A mind-bending sci-fi adventure.",
                "ingredients": "Fantasy Forest Latte, Cosmic Brownies, Sci-Fi Novel, Galaxy Bookmark",
                "calories": 550,
                "is_featured": False,
                "rating": "4.90",
                "is_available": True,
                "image": "products/scifi-explorer-pack.jpg"
            }
        ]
        
        # Copy images from static to media
        self.copy_images_to_media()
        
        # Add products to database WITH IMAGES
        for product_data in all_products:
            category_name = product_data.pop('category')
            category = categories[category_name]
            
            # Get image if provided
            image_file = product_data.pop('image', None)
            
            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                defaults={
                    'category': category,
                    'product_type': product_data['product_type'],
                    'description': product_data['description'],
                    'price': product_data['price'],
                    'ingredients': product_data.get('ingredients', ''),
                    'calories': product_data.get('calories'),
                    'is_featured': product_data.get('is_featured', False),
                    'rating': product_data.get('rating', 0.00),
                    'is_available': product_data.get('is_available', True)
                }
            )
            
            # Add image if it exists
            if image_file and not product.image:
                product.image = image_file
                product.save()
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'✓ Added: {product.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'✓ Exists: {product.name}'))
        
        self.stdout.write(self.style.SUCCESS(f'Successfully loaded {len(all_products)} menu items!'))
    
    def copy_images_to_media(self):
        """Copy images from static/Images to media/products/"""
        import shutil
        import os
        
        # Create media/products directory
        media_products_dir = 'media/products'
        os.makedirs(media_products_dir, exist_ok=True)
        
        # List of images to copy
        images_to_copy = [
            ('classic-espresso.jpg', 'classic-espresso.jpg'),
            ('vanilla-latte.jpg', 'vanilla-latte.jpg'),
            ('caramel-macchiato.jpg', 'caramel-macchiato.jpg'),
            ('red-velvet-cake.jpg', 'red-velvet-cake.jpg'),
            ('chocolate-tart.jpg', 'chocolate-tart.jpg'),
            ('cosmic-brownies.jpg', 'cosmic-brownies.jpg'),
            ('philosopher-blend.jpg', 'philosopher-blend.jpg'),
            ('fantasy-forest-latte.jpg', 'fantasy-forest-latte.jpg'),
            ('Poets-inspiration.jpg', 'Poets-inspiration.jpg'),
            ('romance-delight.jpg', 'romance-delight.jpg'),
            ('mystery-solver-kit.jpg', 'mystery-solver-kit.jpg'),
            ('scifi-explorer-pack.jpg', 'scifi-explorer-pack.jpg'),
        ]
        
        for source_name, dest_name in images_to_copy:
            source_path = f'static/Images/{source_name}'
            dest_path = f'{media_products_dir}/{dest_name}'
            
            if os.path.exists(source_path):
                shutil.copy2(source_path, dest_path)
                self.stdout.write(self.style.SUCCESS(f'✓ Copied: {source_name}'))
            else:
                self.stdout.write(self.style.WARNING(f'⚠️ Missing: {source_name}'))
        
        self.stdout.write(self.style.SUCCESS('Images copied to media/products/'))
