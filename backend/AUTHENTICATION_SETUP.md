# Authentication & Department Routing Setup Guide

## Overview
This system implements user authentication with department-based routing. Users log in with their email/password and are automatically redirected to their department's dashboard.

## Backend Setup

### 1. Run Django Migrations
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### 2. Initialize Departments, Roles & Permissions
```bash
python manage.py init_departments
```

This creates:
- **5 Departments**: Accounting, Design, Engineering, Planning, IT
- **5 Roles**: Admin, Manager, Supervisor, Employee, Intern
- **9 Permissions**: Various view/edit permissions

### 3. Create a Superuser (Admin Account)
```bash
python manage.py createsuperuser
# Follow the prompts to create your admin account
```

### 4. Access Django Admin
1. Start the server: `python manage.py runserver`
2. Go to: http://localhost:8000/admin
3. Log in with your superuser credentials
4. Create test users in the admin panel by:
   - Going to Users
   - Adding new users with email, password, and assigning them to a department

## API Endpoints

### Authentication
- **POST** `/api/accounts/login/` - Login with email/password
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **GET** `/api/accounts/profile/` - Get current user profile (requires token)

- **GET** `/api/accounts/departments/` - Get all departments

### Response Format (Login)
```json
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "employee_id": "EMP001",
    "department": 1,
    "department_name": "Engineering Department",
    "role": "employee",
    "permissions": ["view_attendance", "view_payroll"]
  }
}
```

## Frontend Setup

### 1. Install Axios (if not already installed)
```bash
cd frontend
npm install axios
```

### 2. Environment Configuration
Create a `.env` file in the frontend folder if needed:
```
VITE_API_URL=http://localhost:8000
```

### 3. Features Implemented
- **Login Page**: Email/password authentication
- **Department Dashboards**: 5 separate dashboards for each department
- **Session Management**: Token stored in localStorage
- **Automatic Logout**: Button to clear session
- **Error Handling**: Display login errors

### 4. Supported Departments
Users are routed based on their assigned department:

| Department | Features |
|------------|----------|
| Accounting Department | Chart of Accounts, Journal Entries, General Ledger, Financial Reports |
| Design Department | Design Projects, Asset Management, Design Guidelines, Team Collaboration |
| Engineering Department | Technical Documentation, Build & Deployment, Performance Monitoring, Infrastructure |
| Planning Department | Project Planning, Timeline Management, Resource Allocation, Progress Tracking |
| IT Department | System Administration, Network Management, Support Ticketing, Security & Compliance |

## Testing

### Test User Creation via Django Admin

1. Go to http://localhost:8000/admin
2. Click "Users" → "Add User"
3. Fill in:
   - Email: `test.accounting@example.com`
   - First Name: `John`
   - Last Name: `Doe`
   - Department: Select "Accounting Department"
   - Role: Select "employee"
   - Set password
4. Click Save

### Test Login
1. Go to http://localhost:3000 (frontend)
2. Enter: 
   - Email: `test.accounting@example.com`
   - Password: (the password you set)
3. Should redirect to Accounting Dashboard

## Database Structure

### Users Table (CustomUser)
- email (unique)
- first_name, last_name
- employee_id (unique)
- department (FK)
- role (FK)
- permissions (M2M)
- phone_number
- is_active
- date_hired
- created_at, updated_at

### Departments Table
- name (unique)
- description
- created_at, updated_at

### Roles Table
- name (choices: admin, manager, supervisor, employee, intern)
- description
- created_at, updated_at

### Permissions Table
- name (choices: view_*, edit_*, manage_*)
- description
- created_at

## Environment Variables

### Backend (.env)
```
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgresql://user:password@localhost/dbname
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

## Troubleshooting

### CORS Issues
If you get CORS errors, make sure `django-cors-headers` is installed and configured in `settings.py`:
```python
INSTALLED_APPS = [
    ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
]
```

### Login Not Working
1. Check if user exists in database: http://localhost:8000/admin/accounts/customuser/
2. Verify email is case-sensitive
3. Check browser console for API errors
4. Verify token is being stored in localStorage

### Token Expired
If users get logged out unexpectedly:
1. Check token expiration time in Django settings
2. Implement token refresh on the frontend if needed

## Next Steps
- Add more features to each department dashboard
- Implement attendance tracking
- Add payroll calculations
- Create reporting features
- Set up email notifications
