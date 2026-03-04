"""
Business logic services for accounts app.
Handles authentication, user management, and user profiles.
"""
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.db import transaction

from .models import CustomUser, Department, ROLE_CHOICES
from supabase import create_client, Client
import uuid

ALLOWED_ROLES = [
    'accounting', 'employee', 'bim_specialist', 'intern', 'junior_architect',
    'president', 'site_engineer', 'site_coordinator', 'studio_head', 'admin'
]

ROLE_LABEL_TO_KEY = {label.lower(): key for key, label in ROLE_CHOICES}
ROLE_FILTER_ALIASES = {
    'interns': 'intern',
    'junior designer': 'junior_architect',
}


class AuthenticationService:
    """Handle login/registration and token generation."""

    @staticmethod
    def login(email, password):
        """Authenticate user and generate JWT tokens."""
        if not email or not password:
            raise ValueError('Email and password are required')

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise ValueError('Invalid credentials')

        if not user.check_password(password):
            raise ValueError('Invalid credentials')

        if not user.is_active:
            raise PermissionError('Account not yet approved by Studio Head/Admin.')

        if user.role not in ALLOWED_ROLES:
            raise PermissionError('Your role is not permitted to login.')

        refresh = RefreshToken.for_user(user)
        return {
            'success': True,
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'user': AuthenticationService._build_user_response(user),
        }

    @staticmethod
    def register(email, password, first_name='', last_name=''):
        """Create a new user account (inactive until approved)."""
        if not email or not password:
            raise ValueError('Email and password are required')

        if CustomUser.objects.filter(email=email).exists():
            raise ValueError('Email already registered')

        user = CustomUser.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            username=email.split('@')[0],
            is_active=False,  # Always inactive until approved
        )

        return {
            'success': True,
            'message': 'Registration submitted. Your account will be verified by a Studio Head or Admin.',
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        }

    @staticmethod
    def _build_user_response(user):
        """Build standardized user response object."""
        return {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'employee_id': user.employee_id,
            'department': user.department.id if user.department else None,
            'department_name': user.department.name if user.department else None,
            'role': user.role if user.role else None,
            'role_name': user.get_role_display() if user.role else None,
            'permissions': user.permissions or [],
            'profile_picture': user.profile_picture or None
        }


class UserProfileService:
    """Handle user profile retrieval and management."""

    @staticmethod
    def get_profile(user):
        """Get current user's profile."""
        return {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'employee_id': user.employee_id,
            'phone_number': user.phone_number,
            'department': user.department.id if user.department else None,
            'department_name': user.department.name if user.department else None,
            'role': user.role if user.role else None,
            'role_name': user.get_role_display() if user.role else None,
            'profile_picture': user.profile_picture,
            'permissions': user.permissions or []
        }

    @staticmethod
    def upload_profile_picture(user, profile_pic):
        """Upload profile picture to Supabase Storage."""
        if not profile_pic:
            raise ValueError('No image provided.')

        supabase_url = getattr(settings, 'SUPABASE_URL', None)
        supabase_key = getattr(settings, 'SUPABASE_KEY', None)

        if not supabase_url or not supabase_key:
            raise ValueError('Supabase configuration is missing in the backend.')

        try:
            supabase = create_client(supabase_url, supabase_key)
            
            # Generate unique filename
            file_extension = profile_pic.name.split('.')[-1]
            file_path = f"{user.id}/avatar_{uuid.uuid4().hex}.{file_extension}"

            # Upload to Supabase
            file_content = profile_pic.read()
            supabase.storage.from_('profile_picture').upload(
                file=file_content,
                path=file_path,
                file_options={'content-type': profile_pic.content_type, 'upsert': 'true'}
            )

            # Get public URL
            public_url = supabase.storage.from_('profile_picture').get_public_url(file_path)

            # Remove old picture
            if user.profile_picture and "supabase.co/storage/v1/object/public/profile_picture/" in user.profile_picture:
                try:
                    old_path = user.profile_picture.split("profile_picture/")[-1]
                    supabase.storage.from_('profile_picture').remove([old_path])
                except Exception as e:
                    print(f"Failed to delete old profile picture: {e}")

            # Update user
            user.profile_picture = public_url
            user.save()

            return {
                'success': True,
                'message': 'Profile picture updated successfully.',
                'profile_picture': public_url
            }
        except Exception as e:
            raise ValueError(str(e))


class UserApprovalService:
    """Handle user approval workflow."""

    @staticmethod
    def get_pending_users():
        """Get all pending approval users."""
        return CustomUser.objects.filter(is_active=False).select_related('department').order_by('-created_at')

    @staticmethod
    def approve_user(user_id, role, permissions=None, department_id=None):
        """Approve a pending user and assign role/department."""
        if not role or role not in ALLOWED_ROLES:
            raise ValueError('Valid role is required')

        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            raise ValueError('User not found')

        department = None
        if department_id:
            try:
                department = Department.objects.get(id=department_id)
            except Department.DoesNotExist:
                raise ValueError('Department not found')

        user.department = department
        user.role = role
        user.permissions = permissions or []
        user.is_active = True
        user.save()

        # Send approval email
        email_sent = False
        try:
            email_message = f"""
Hello {user.first_name} {user.last_name},

Your account has been successfully verified and approved!

Account Details:
- Email: {user.email}
- Department: {user.department.name if user.department else 'N/A'}
- Role: {user.get_role_display()}

You can now log in to the Triple G using your email and password.

If you have any questions, please contact your administrator.

Best regards,
Triple G Admin
            """.strip()
            send_mail(
                subject='Your Account Has Been Verified - Triple G',
                message=email_message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None),
                recipient_list=[user.email],
                fail_silently=False,
            )
            email_sent = True
        except Exception as e:
            print(f"Email sending failed: {str(e)}")

        return {
            'success': True,
            'email_sent': email_sent,
            'user': {
                'id': user.id,
                'email': user.email,
                'department': user.department.id if user.department else None,
                'department_name': user.department.name if user.department else None,
                'role': user.role,
            }
        }


class UserManagementService:
    """Handle user CRUD operations."""

    @staticmethod
    def list_all_users():
        """Get all users."""
        return CustomUser.objects.select_related('department').order_by('last_name', 'first_name', 'email')

    @staticmethod
    def update_user(user_id, update_data):
        """Update user fields."""
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            raise ValueError('User not found')

        fields_updated = []

        if 'first_name' in update_data:
            user.first_name = str(update_data.get('first_name')).strip()
            fields_updated.append('first_name')

        if 'last_name' in update_data:
            user.last_name = str(update_data.get('last_name')).strip()
            fields_updated.append('last_name')

        if 'role' in update_data:
            role = update_data.get('role')
            if role not in ALLOWED_ROLES:
                raise ValueError('Invalid role')
            user.role = role
            fields_updated.append('role')

        if 'department_id' in update_data:
            dept_id = update_data.get('department_id')
            if dept_id in [None, '', 'null', 'None']:
                user.department = None
            else:
                try:
                    user.department = Department.objects.get(id=dept_id)
                except Department.DoesNotExist:
                    raise ValueError('Department not found')
            fields_updated.append('department')

        if 'is_active' in update_data:
            is_active = update_data.get('is_active')
            if isinstance(is_active, str):
                is_active = is_active.lower() in ['1', 'true', 'yes', 'on']
            user.is_active = bool(is_active)
            fields_updated.append('is_active')

        if not fields_updated:
            raise ValueError('No valid fields to update')

        user.save(update_fields=fields_updated)
        return user

    @staticmethod
    def delete_user(user_id, requester_id):
        """Delete a user (not self)."""
        if user_id == requester_id:
            raise PermissionError('You cannot delete your own account.')
        
        try:
            user = CustomUser.objects.get(id=user_id)
            user.delete()
            return True
        except CustomUser.DoesNotExist:
            raise ValueError('User not found')


class AccountingEmployeeService:
    """Handle accounting department employee management."""

    @staticmethod
    def get_employees(active_only=True, role=None, department=None):
        """Get accounting employees with optional filters."""
        from payroll.models import SalaryStructure

        users_qs = CustomUser.objects.select_related('department', 'salary_structure').order_by('last_name', 'first_name')
        
        if active_only:
            users_qs = users_qs.filter(is_active=True)
        
        if department:
            users_qs = users_qs.filter(department__name__iexact=department)
        
        if role:
            normalized_role = ROLE_FILTER_ALIASES.get(role.lower(), role.lower())
            if normalized_role in ROLE_LABEL_TO_KEY:
                normalized_role = ROLE_LABEL_TO_KEY[normalized_role]
            if normalized_role in ALLOWED_ROLES:
                users_qs = users_qs.filter(role=normalized_role)

        data = []
        for user in users_qs:
            salary = 0
            if hasattr(user, 'salary_structure') and user.salary_structure:
                salary = float(user.salary_structure.base_salary)

            status_text = 'Active' if user.is_active else 'Inactive'

            data.append({
                'id': user.id,
                'name': f"{user.first_name} {user.last_name}".strip(),
                'email': user.email,
                'phone': user.phone_number or '',
                'department': user.department.name if user.department else 'Unassigned',
                'position': user.get_role_display() if user.role else 'Unassigned',
                'status': status_text,
                'joinDate': user.date_hired.strftime('%Y-%m-%d') if user.date_hired else '',
                'salary': salary,
                'location': 'Head Office',
                'avatar': user.profile_picture,
                'manager': 'N/A',
                'skills': [],
            })
        
        return data

    @staticmethod
    def create_employee(email, first_name, last_name, phone, department_name, position_role,
                       temporary_password, salary_amount, start_date):
        """Create a new employee."""
        from payroll.models import SalaryStructure

        if not email or not first_name or not last_name:
            raise ValueError('Email, first name, and last name are required')
        
        if not temporary_password or len(temporary_password) < 8:
            raise ValueError('Temporary password is required and must be at least 8 characters')

        if CustomUser.objects.filter(email=email).exists():
            raise ValueError('User with this email already exists')

        try:
            with transaction.atomic():
                dept = None
                if department_name:
                    dept = Department.objects.filter(name=department_name).first()

                # Normalize role
                role_key = 'employee'
                position_lower = position_role.lower() if position_role else 'employee'
                position_lower = ROLE_FILTER_ALIASES.get(position_lower, position_lower)
                if position_lower in ALLOWED_ROLES:
                    role_key = position_lower
                elif position_lower in ROLE_LABEL_TO_KEY:
                    mapped = ROLE_LABEL_TO_KEY[position_lower]
                    if mapped in ALLOWED_ROLES:
                        role_key = mapped

                # Generate unique username
                username_base = email.split('@')[0] if '@' in email else email
                username = username_base
                suffix = 1
                while CustomUser.objects.filter(username=username).exists():
                    username = f"{username_base}{suffix}"
                    suffix += 1

                user = CustomUser.objects.create(
                    email=email,
                    username=username,
                    first_name=first_name,
                    last_name=last_name,
                    phone_number=phone,
                    department=dept,
                    role=role_key,
                    is_active=False,
                    date_hired=start_date,
                )
                user.set_password(temporary_password)
                user.save()

                if salary_amount:
                    SalaryStructure.objects.create(
                        employee=user,
                        base_salary=salary_amount,
                        frequency='monthly'
                    )

                return {
                    'user': user,
                    'email_sent': AccountingEmployeeService._send_creation_email(
                        user, first_name, last_name, email, dept, temporary_password
                    )
                }
        except Exception as e:
            raise ValueError(str(e))

    @staticmethod
    def update_employee(user_id, update_data):
        """Update an employee."""
        from payroll.models import SalaryStructure

        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            raise ValueError('Employee not found')

        try:
            with transaction.atomic():
                if 'first_name' in update_data:
                    user.first_name = str(update_data.get('first_name')).strip()
                if 'last_name' in update_data:
                    user.last_name = str(update_data.get('last_name')).strip()
                if 'email' in update_data:
                    normalized_email = str(update_data.get('email')).strip().lower()
                    if not normalized_email:
                        raise ValueError('Email cannot be empty')
                    if CustomUser.objects.filter(email=normalized_email).exclude(id=user.id).exists():
                        raise ValueError('User with this email already exists')
                    user.email = normalized_email
                if 'phone' in update_data:
                    user.phone_number = str(update_data.get('phone')).strip()
                if 'startDate' in update_data:
                    user.date_hired = update_data.get('startDate')
                if 'status' in update_data:
                    user.is_active = (update_data.get('status') == 'Active')
                if 'department' in update_data:
                    dept_name = str(update_data.get('department')).strip()
                    if not dept_name:
                        user.department = None
                    else:
                        dept = Department.objects.filter(name=dept_name).first()
                        user.department = dept
                if 'position' in update_data:
                    position_lower = str(update_data.get('position')).strip().lower()
                    position_lower = ROLE_FILTER_ALIASES.get(position_lower, position_lower)
                    next_role = None
                    if position_lower in ALLOWED_ROLES:
                        next_role = position_lower
                    elif position_lower in ROLE_LABEL_TO_KEY:
                        mapped = ROLE_LABEL_TO_KEY[position_lower]
                        if mapped in ALLOWED_ROLES:
                            next_role = mapped
                    if next_role is None:
                        raise ValueError('Invalid role/position')
                    user.role = next_role

                user.save()

                if 'salary' in update_data and update_data.get('salary'):
                    salary_obj, created = SalaryStructure.objects.get_or_create(
                        employee=user,
                        defaults={'base_salary': update_data.get('salary'), 'frequency': 'monthly'}
                    )
                    if not created:
                        salary_obj.base_salary = float(update_data.get('salary'))
                        salary_obj.save()

                return user
        except Exception as e:
            raise ValueError(str(e))

    @staticmethod
    def _send_creation_email(user, first_name, last_name, email, dept, temporary_password):
        """Send employee creation email."""
        try:
            email_message = f"""
Hello {first_name} {last_name},

Your Triple G account has been created by the Accounting Department.

Account Details:
- Email: {email}
- Temporary Password: {temporary_password}
- Department: {dept.name if dept else 'N/A'}
- Role: {user.get_role_display() if user.role else 'N/A'}

Important:
Your account is currently pending verification. You cannot log in yet until a Studio Head or Admin approves your account.
You will receive another confirmation once your account is activated.

Best regards,
Triple G Admin
            """.strip()
            send_mail(
                subject='Triple G Account Created - Pending Verification',
                message=email_message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', None),
                recipient_list=[email],
                fail_silently=False,
            )
            return True
        except Exception as e:
            print(f"Account creation email failed: {str(e)}")
            return False
