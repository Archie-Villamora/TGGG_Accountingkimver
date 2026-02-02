# Quick Setup Guide for Collaborators

## What Changed?

This project has been converted from **TypeScript to pure JavaScript**:

- ✅ All `.tsx` files → `.jsx` files
- ✅ Removed TypeScript dependencies (@types/*, typescript)
- ✅ Using Vite + React (JavaScript only)
- ✅ Django backend for secure data handling

---

## First Time Setup

### 1️⃣ Install Node.js Dependencies

```bash
npm install
```

This will install all the packages from `package.json`:
- React 18
- Vite (build tool)
- Tailwind CSS
- shadcn/ui components
- All UI libraries (Radix UI, Recharts, etc.)

### 2️⃣ Install Python Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install packages
pip install -r requirements.txt
```

This installs:
- Django (web framework)
- Django REST Framework (API)
- Django CORS Headers (frontend-backend communication)

### 3️⃣ Setup Django Database

```bash
python manage.py migrate
python manage.py createsuperuser
```

---

## Running the Project

### Start Frontend (Terminal 1)
```bash
npm run dev
```
→ Opens at http://localhost:3000

### Start Backend (Terminal 2)
```bash
python manage.py runserver
```
→ Opens at http://localhost:8000

---

## Daily Development Workflow

```bash
# Pull latest changes
git pull

# If package.json changed, reinstall
npm install

# If requirements.txt changed, reinstall
pip install -r requirements.txt

# If new Django models, run migrations
python manage.py migrate

# Start both servers
npm run dev                    # Terminal 1
python manage.py runserver     # Terminal 2
```

---

## Common Commands

### Frontend
```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm install       # Install new packages
```

### Backend
```bash
python manage.py runserver          # Start server
python manage.py makemigrations     # Create migrations
python manage.py migrate            # Apply migrations
python manage.py createsuperuser    # Create admin
```

---

## File Extensions
- ✅ Use `.jsx` for React components
- ✅ Use `.js` for JavaScript utilities
- ✅ Use `.py` for Django/Python code
- ❌ NO `.tsx` or `.ts` files (TypeScript removed)

---

## Need Help?
- React: https://react.dev/
- Vite: https://vitejs.dev/
- Django: https://docs.djangoproject.com/
- Tailwind: https://tailwindcss.com/
