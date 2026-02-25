import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from todos.models import TaskGroup
from todos.serializers import TaskGroupSerializer

# Get the first group that has members
group = TaskGroup.objects.exclude(members=None).first()
if group:
    serializer = TaskGroupSerializer(group)
    print("Serialized group with members:")
    print(serializer.data)
else:
    print("No groups with members found in DB.")
