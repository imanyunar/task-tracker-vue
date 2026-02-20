# Task Tracker - PostgreSQL Backend Setup Complete ✅

Backend Laravel sudah berjalan dengan PostgreSQL!

## 🚀 Status

✅ **Backend Server:** Running di `http://localhost:8000`
✅ **Database:** PostgreSQL (configured)
✅ **Frontend:** Ready to run

## 📋 Konfigurasi PostgreSQL di Backend

File `.env` sudah dikonfigurasi untuk PostgreSQL:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=pelacaktugas
DB_USERNAME=postgres
DB_PASSWORD=Astana123
```

## 📝 TODO: Database Migrations

Untuk menyelesaikan setup database, Anda perlu:

### 1. Pastikan PostgreSQL Running
```bash
# Windows: Buka pgAdmin atau psql
# Atau cek di Services apakah PostgreSQL sudah running
```

### 2. Run Migrations (di terminal baru)
```bash
cd E:\task-tracker-vue\backend

# Create database jika belum ada
php artisan db:create

# Run migrations
php artisan migrate

# Seed database dengan data sample
php artisan db:seed
```

### 3. Verify Database Connection
```bash
cd E:\task-tracker-vue\backend

# Jalankan Tinker untuk test
php artisan tinker

> DB::connection()->getPdo()
# Jika berhasil, berarti database terhubung
```

## 🔧 Frontend Setup

Sekarang setup frontend Vue untuk terhubung dengan backend:

### 1. Navigate ke Frontend
```bash
cd E:\task-tracker-vue\frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
File `frontend/.env` sudah ada dengan konfigurasi:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 4. Start Development Server
```bash
npm run dev
```

Frontend akan running di `http://localhost:5173`

## 🎯 Architecture

```
┌─────────────────────────────────┐
│  Vue Frontend                     │
│  http://localhost:5173           │
└──────────────┬────────────────────┘
               │ HTTP/REST API
┌──────────────▼────────────────────┐
│  Laravel Backend                  │
│  http://localhost:8000            │
│  📊 PostgreSQL Database           │
│  🛡️ API Authentication           │
└──────────────────────────────────┘
```

## 🔗 API Endpoints

Backend sudah menyediakan endpoints:

### Public Endpoints
- `POST /api/register` - Register user
- `POST /api/login` - Login user

### Protected Endpoints (dengan token)
- `POST /api/logout` - Logout
- `GET /api/dashboard-stats` - Dashboard statistics
- `GET/POST/PUT/DELETE /api/tasks` - Task operations
- `GET/POST/PUT/DELETE /api/projects` - Project operations
- `GET/POST/PUT/DELETE /api/users` - User operations
- `GET /api/profile` - Current user profile

## 📦 Dev Terminals Setup

Jalankan di 2 terminal terpisah:

**Terminal 1 - Backend:**
```bash
cd E:\task-tracker-vue\backend
php artisan serve
# Running on http://localhost:8000
```

**Terminal 2 - Frontend:**
```bash
cd E:\task-tracker-vue\frontend
npm run dev
# Running on http://localhost:5173
```

## 🧪 Testing

### 1. Akses Frontend
Buka browser: http://localhost:5173

### 2. Test Register
- Isi form dengan credensial baru
- Backend akan create user di PostgreSQL

### 3. Test Login
- Login dengan credential yang baru dibuat
- Frontend akan store token di localStorage

### 4. Test Dashboard
- Jika login berhasil, akan redirect ke dashboard
- Dashboard menampilkan stats dari backend

## 🔐 Database Structure

Setelah migrations, database akan memiliki tables:

```sql
-- Roles
- roles (admin, manager, employee)

-- Organization
- departments

-- Users
- users (dengan role_id, department_id)

-- Projects
- projects
- project_user (pivot table - team members)

-- Tasks
- tasks (dengan project_id, user_id)

-- Attendance
- attendances
```

## 🛠️ Troubleshooting

### Error: "Could not find driver"
```
Solusi: Install PostgreSQL PDO driver di PHP
php -m | grep pdo  # Cek drivers yang terinstall
```

### Error: "SQLSTATE[08006]"
```
Solusi: Pastikan PostgreSQL running dan credentials benar
- Check .env database credentials
- Verify PostgreSQL service active
```

### Error: "Table not exist"
```
Solusi: Run migrations
php artisan migrate
php artisan db:seed
```

### API 404 atau timeout
```
Solusi: 
- Pastikan backend running di port 8000
- Check frontend .env VITE_API_BASE_URL
- Verify network tab di browser DevTools
```

## 📚 Quick Reference

| Task | Command |
|------|---------|
| Run migrations | `php artisan migrate` |
| Seed database | `php artisan db:seed` |
| Reset database | `php artisan migrate:reset` |
| Fresh migrations | `php artisan migrate:fresh --seed` |
| Tinker shell | `php artisan tinker` |
| Cache clear | `php artisan cache:clear` |

## ✅ Next Steps

1. **Setup Migrations** - Run `php artisan migrate --seed`
2. **Start Backend** - Run `php artisan serve`
3. **Start Frontend** - Run `npm run dev`
4. **Test Application** - Open http://localhost:5173
5. **Register & Login** - Test auth flow
6. **Create Data** - Add tasks & projects

## 🎉 You're All Set!

Backend + Frontend + PostgreSQL sudah siap untuk development!

Semua dokumentasi lengkap ada di:
- [SETUP.md](../SETUP.md) - Full setup guide
- [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) - API reference
- [FRONTEND_ARCHITECTURE.md](../FRONTEND_ARCHITECTURE.md) - Frontend structure
- [BACKEND_ARCHITECTURE.md](../BACKEND_ARCHITECTURE.md) - Backend structure

---

Happy Coding! 🚀

(Update `frontend/.env` jika backend running di port berbeda)
