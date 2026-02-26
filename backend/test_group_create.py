import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import CustomUser
from todos.views import groups_list_create
from django.test import RequestFactory

print("Finding a test user...")
user = CustomUser.objects.filter(is_leader=True).exclude(role__in=['studio_head', 'admin']).first()
if not user:
    print("No such user found. Let's make one.")
    user = CustomUser.objects.first()
    user.is_leader = True
    user.role = 'employee'
    user.save()

print(f"Testing with user: {user.email} (is_leader={user.is_leader}, role={user.role})")

factory = RequestFactory()
request = factory.post('/api/todos/groups/', {'name': 'Test Group by Script'}, content_type='application/json')
request.user = user

try:
    response = groups_list_create(request)
    print('STATUS:', response.status_code)
    print('DATA:', response.data)
except Exception as e:
    import traceback
    traceback.print_exc()
