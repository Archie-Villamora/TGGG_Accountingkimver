import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from todos.models import TaskGroup, TaskGroupMember
from accounts.models import CustomUser
from todos.views import group_remove_member
from rest_framework.test import APIRequestFactory
from rest_framework.test import force_authenticate

group = TaskGroup.objects.exclude(members=None).first()
if not group:
    print("No groups with members found.")
else:
    member = group.members.first()
    leader = group.leader
    print(f"Testing removing {member.user.email} from group {group.name} by leader {leader.email}")
    
    factory = APIRequestFactory()
    request = factory.delete(f'/api/todos/groups/{group.id}/members/{member.user.id}/')
    force_authenticate(request, user=leader)
    
    try:
        response = group_remove_member(request, group_id=str(group.id), user_id=str(member.user.id))
        print("STATUS:", response.status_code)
        if hasattr(response, 'data'):
            print("DATA:", response.data)
    except Exception as e:
        import traceback
        traceback.print_exc()
