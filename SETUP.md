# Task Tracker - Full Setup Guide

Panduan lengkap untuk setup dan menjalankan Task Tracker (Backend Laravel + Frontend Vue).

## Prerequisites

Pastikan Anda sudah install:
- **PHP >= 8.1** (untuk Laravel)
- **Node.js >= 20.19.0 atau >= 22.12.0** (untuk Vue)
- **Composer** (PHP package manager)
- **npm atau yarn** (Node package manager)
- **MySQL/PostgreSQL** (Database)
- **Git** (Version control)

## Struktur Project

```
task-tracker-vue/
├── backend/          # Laravel Backend
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/
│   ├── .env
│   ├── artisan
│   └── composer.json
└── frontend/         # Vue Frontend
    ├── src/
    ├── public/
    ├── package.json
    ├── vite.config.js
    └── .env
```

## Backend Setup (Laravel)

### 1. Navigate ke Backend Folder

```bash
cd backend
```

### 2. Install PHP Dependencies

```bash
composer install
```

### 3. Setup Environment File

Copy `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Edit `.env` dengan konfigurasi database Anda:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=task_tracker
DB_USERNAME=root
DB_PASSWORD=your_password

APP_URL=http://localhost:8000
```

### 4. Generate Application Key

```bash
php artisan key:generate
```

### 5. Run Database Migrations

```bash
php artisan migrate
```

### 6. Run Database Seeders (Optional)

Untuk populate database dengan data sample:

```bash
php artisan db:seed
```

### 7. Start Backend Server

```bash
php artisan serve
```

Backend akan berjalan di: **http://localhost:8000**

## Frontend Setup (Vue)

### 1. Navigate ke Frontend Folder (di terminal baru)

```bash
cd frontend
```

### 2. Install Node Dependencies

```bash
npm install
```

### 3. Verify Environment File

Pastikan `frontend/.env` ada dan berisi:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 4. Start Development Server

```bash
npm run dev
```

Frontend akan berjalan di: **http://localhost:5173** (atau port lain)

## Access Application

1. Buka browser dan go to `http://localhost:5173`
2. Anda akan di-redirect ke login page
3. **Register** akun baru atau login dengan credentials yang existing

## Troubleshooting

### Backend Issues

**Error: "Class 'PDO' not found"**
- Pastikan PHP extensions sudah install (pdo_mysql, dll)
- Windows: Check `php.ini` dan uncomment extension yang diperlukan

**Error: Database connection failed**
- Pastikan MySQL/PostgreSQL running
- Verify database credentials di `.env`
- Run migration: `php artisan migrate`

**CORS Error di Frontend**
- Backend harus expect request dari frontend URL
- Check `config/cors.php` jika ada atau add CORS middleware

**Error: Unknown column 'api_token'**
- Run migrations: `php artisan migrate`
- Check migration file di `database/migrations/`

### Frontend Issues

**Error: Cannot find module 'vue-router'**
- Run: `npm install vue-router`
- Verify `package.json` memiliki semua dependencies

**Blank page / API calls failing**
- Check `.env` - `VITE_API_BASE_URL` must match backend URL
- Open DevTools > Network tab untuk lihat API requests
- Check browser console untuk error messages

**Port 5173 already in use**
- Vite otomatis cari port lain, cek output di terminal
- Atau specify port: `npm run dev -- --port 3000`

## API Testing

Untuk test API endpoints, gunakan Postman:

1. Create new request
2. Use endpoint: `http://localhost:8000/api/...`
3. Add header: `Authorization: Bearer {api_token}`

Contoh:
```
POST http://localhost:8000/api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

## Build untuk Production

### Frontend Build

```bash
cd frontend
npm run build
```

Output akan tersimpan di `frontend/dist/`

### Backend Deployment

Untuk Laravel deployment, refer ke [Laravel Deployment Guide](https://laravel.com/docs/deployment)

## Development Workflow

1. **Backend Development**
   - Edit controllers di `app/Http/Controllers/API/`
   - Edit models di `app/Models/`
   - Edit routes di `routes/api.php`
   - Test dengan Postman

2. **Frontend Development**
   - Edit components di `src/views/` dan `src/components/`
   - Edit services di `src/services/`
   - Edit stores di `src/stores/`
   - Changes auto-reload dengan Vite

3. **Testing**
   - Run backend tests: `php artisan test`
   - Run frontend tests: `npm run test` (jika configured)

## Database Schema

### Tables
- `users` - User accounts
- `roles` - User roles
- `departments` - Company departments
- `projects` - Projects
- `project_user` - Project members
- `tasks` - Tasks/todos
- `attendances` - Attendance records

### Key Relationships
- User -> Department (many-to-one)
- User -> Role (many-to-one)
- Task -> Project (many-to-one)
- Task -> User (many-to-one)
- Project -> User (many-to-many)

## API Authentication

Aplikasi menggunakan API Token authentication:

1. User login dengan email & password
2. Server return plain token (akan di-hash di backend)
3. Frontend store token di localStorage
4. Setiap request include token di header: `Authorization: Bearer {token}`
5. Backend verify token sebelum process request

## File Permissions (Linux/Mac)

Jika running di Linux/Mac, set permissions:

```bash
# Backend
cd backend
chmod -R 755 storage bootstrap/cache
chmod -R 777 storage bootstrap/cache

# Frontend
cd ../frontend
chmod -R 755 node_modules
```

## CLI Commands Reference

### Backend

```bash
# Navigate to backend
cd backend

# Create migration
php artisan make:migration create_table_name

# Run migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Seed database
php artisan db:seed

# Create model with migration
php artisan make:model ModelName -m

# Create controller
php artisan make:controller ControllerName

# Run tests
php artisan test

# Start server
php artisan serve
```

### Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Next Steps

1. ✅ Setup backend dan database
2. ✅ Setup frontend
3. ✅ Test login functionality
4. ✅ Create sample projects & tasks
5. Development dan customization sesuai kebutuhan

## Support & Debugging

**Debug Mode**
- Backend: Set `APP_DEBUG=true` di `.env`
- Frontend: Open DevTools (F12)

**Useful Tools**
- Postman - API testing
- Laravel WebStack - Backend debugging
- Vue DevTools - Frontend debugging
- Network tab di browser - Monitor API requests

## License

MIT License

---

Untuk pertanyaan lebih lanjut, check documentation atau contact administrator.
