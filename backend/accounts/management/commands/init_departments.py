from django.core.management.base import BaseCommand
from accounts.models import Department, ROLE_CHOICES, PERMISSION_CHOICES

class Command(BaseCommand):
    help = 'Initialize departments and show available role/permission options'

    def handle(self, *args, **options):
        # Create Departments
        departments_data = [
            {'name': 'Accounting Department', 'description': 'Handles financial records, accounting, and reporting'},
            {'name': 'Design Department', 'description': 'Creative design and UI/UX services'},
            {'name': 'Engineering Department', 'description': 'Software development and technical infrastructure'},
            {'name': 'Planning Department', 'description': 'Project planning and resource management'},
            {'name': 'IT Department', 'description': 'Information technology and systems management'},
        ]

        for dept_data in departments_data:
            dept, created = Department.objects.get_or_create(
                name=dept_data['name'],
                defaults={'description': dept_data['description']}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created department: {dept.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Department already exists: {dept.name}'))

        self.stdout.write(self.style.SUCCESS('Available roles:'))
        for role_value, role_label in ROLE_CHOICES:
            self.stdout.write(f' - {role_value}: {role_label}')

        self.stdout.write(self.style.SUCCESS('Available permissions:'))
        for perm_value, perm_label in PERMISSION_CHOICES:
            self.stdout.write(f' - {perm_value}: {perm_label}')

        self.stdout.write(self.style.SUCCESS('Successfully initialized departments!'))
