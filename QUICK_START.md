# Quick Start Guide - Task Tracker

Panduan singkat untuk memulai Task Tracker dalam 5 menit!

## Prerequisites

Pastikan sudah install:
- PHP 8.1+ dengan MySQL driver
- Node.js 20+
- Composer
- npm

## Quick Setup

### Step 1: Backend Setup (3 menit)

```bash
cd backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env

# Generate key
php artisan key:generate

# Run migrations
php artisan migrate

# (Optional) Seed data
php artisan db:seed

# Start server
php artisan serve
```

✅ Backend running di: http://localhost:8000

### Step 2: Frontend Setup (2 menit)

Di terminal baru:

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

✅ Frontend running di: http://localhost:5173

## Access Application

1. Buka browser: http://localhost:5173
2. **Register** akun baru
3. **Login** dan mulai gunakan!

## Quick Test

### Login Test
- Email: `admin@example.com`
- Password: `password`
(Jika sudah seed database)

### Create Task
1. Go to "Tasks" menu
2. Click "+ New Task"
3. Fill form dan submit

### Create Project
1. Go to "Projects" menu
2. Click "+ New Project"
3. Fill form dan submit

## Troubleshooting

**Port Already in Use?**
```bash
# Backend (port 8000)
php artisan serve --port 8001

# Frontend (port 5173)
npm run dev -- --port 3000
```

**Database Error?**
1. Check MySQL running
2. Verify DB credentials di backend/.env
3. Run: `php artisan migrate`

**API 404 Error?**
1. Check backend URL di frontend/.env
2. Restart both servers
3. Check browser console

## Next Steps

- Read [SETUP.md](./SETUP.md) untuk dokumentasi lengkap
- Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) untuk API reference
- Customize sesuai kebutuhan Anda

## File Structure

```
task-tracker-vue/
├── backend/       → Laravel backend
├── frontend/      → Vue frontend
├── SETUP.md       → Full setup guide
├── API_DOCUMENTATION.md → API reference
└── README.md      → Project overview
```

## Development Commands

```bash
# Terminal 1: Start Backend
cd backend
php artisan serve

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

## Production Build

```bash
cd frontend
npm run build
```

Output di folder `dist/` siap untuk deploy.

---

**Happy coding! 🚀**

Untuk bantuan lebih lanjut, baca dokumentasi lengkap atau cek API reference.
