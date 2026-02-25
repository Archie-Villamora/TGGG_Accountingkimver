import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from todos.models import TaskGroup, Todo
from accounts.models import CustomUser
from todos.views import todos_list_create, todo_detail
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

# Find a leader
group = TaskGroup.objects.first()
if not group:
    print("No group found.")
else:
    leader = group.leader
    print(f"Testing with leader: {leader.email} (ID: {leader.id})")
    
    factory = APIRequestFactory()
    
    # 1. Leader creates a task assigned to themselves
    data = {
        'task': 'Test self-assigned task',
        'todo_type': 'assigned',
        'assigned_to': leader.id
    }
    request = factory.post(f'/api/todos/', data, format='json')
    force_authenticate(request, user=leader)
    
    response = todos_list_create(request)
    print("Create task response:", response.status_code)
    
    if response.status_code == 201:
        todo_data = response.data
        todo_id = todo_data['id']
        print(f"Created task ID: {todo_id}")
        
        try:
            put_data = {'completed': True}
            put_request = factory.put(f'/api/todos/{todo_id}/', put_data, format='json')
            force_authenticate(put_request, user=leader)
            put_response = todo_detail(put_request, todo_id=str(todo_id))
            print("Complete task response:", put_response.status_code)
            if hasattr(put_response, 'data'):
                print("DATA:", put_response.data)
        except Exception as e:
            import traceback
            traceback.print_exc()
            
        # Clean up
        Todo.objects.filter(id=todo_id).delete()
