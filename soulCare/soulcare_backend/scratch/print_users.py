import os
import sys
import django

# Add the parent directory of scratch to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'soulcare_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

print("Existing Users:")
for user in User.objects.all():
    print(f"ID: {user.id}, Username: {user.username}, Email: {user.email}, Role: {user.role}, IsVerified: {user.is_verified}")
