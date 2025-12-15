from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from cafe.models import Customer

class Command(BaseCommand):
    help = 'Create customer profiles for existing users'
    
    def handle(self, *args, **kwargs):
        users_without_profile = User.objects.filter(customer_profile__isnull=True)
        
        for user in users_without_profile:
            Customer.objects.get_or_create(
                user=user,
                defaults={
                    'phone': '017XXXXXXXX',
                    'city': 'Chattogram',
                    'loyalty_points': 0,
                    'books_read': 0
                }
            )
            self.stdout.write(self.style.SUCCESS(f'✓ Created profile for: {user.username}'))
        
        self.stdout.write(self.style.SUCCESS(f'Created {users_without_profile.count()} customer profiles'))
