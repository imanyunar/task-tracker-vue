# PostgreSQL Database Setup - Commands Reference

## 🗄️ Database Configuration

File `.env` sudah configure PostgreSQL dengan credentials:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=pelacaktugas
DB_USERNAME=postgres
DB_PASSWORD=Astana123
```

## ⚡ Quick Setup Commands

Jalankan di terminal untuk complete database setup:

```bash
# Navigate ke backend
cd E:\task-tracker-vue\backend

# 1. Fresh migration (reset all & run fresh)
php artisan migrate:fresh --seed

# Atau langkah-langkah terpisah:

# 2a. Rollback semua migrations (jika ada)
php artisan migrate:rollback

# 2b. Run migrations
php artisan migrate

# 2c. Seed database dengan sample data
php artisan db:seed
```

## 🎯 Migration Commands

### Basic Commands

```bash
# Run migrations
php artisan migrate

# Rollback last batch
php artisan migrate:rollback

# Rollback all migrations
php artisan migrate:reset

# Fresh migration (reset all & run)
php artisan migrate:fresh

# Fresh migration dengan seeding
php artisan migrate:fresh --seed

# Run specific seeder
php artisan db:seed --class=RoleSeeder
```

### With PostgreSQL

```bash
# Untuk PostgreSQL spesifik
php artisan migrate --database=pgsql --seed
```

## 📋 Tables Yang Akan Dibuat

Setelah migration:

```
1. migrations              - Track migration history
2. roles                   - Admin, Manager, Employee
3. departments             - Company departments
4. users                   - User accounts
5. failed_jobs             - Queue failures
6. password_reset_tokens   - Password reset
7. sessions                - Session data
8. personal_access_tokens  - API tokens (Sanctum)
9. projects                - Projects
10. project_user           - Project members (pivot)
11. tasks                  - Tasks/Todos
12. attendances            - Attendance records
```

## 🌱 Sample Data (Seeders)

Setelah seeding, database akan berisi:

### Roles
- ID 1: Admin
- ID 2: Manager  
- ID 3: Employee

### Departments
- IT
- HR
- Finance
- Marketing

### Sample Users
- Will be created based on factory

### Sample Tasks & Projects
- Will be created if seeder available

## ✅ Verification Steps

### 1. Check Database Connection
```bash
php artisan tinker
> DB::connection()->getPdo()
# If successful, PDOConnection object akan ditampilkan
```

### 2. Check Tables
```bash
php artisan tinker
> DB::select('SELECT table_name FROM information_schema.tables WHERE table_schema = public')
# Will list all tables
```

### 3. Check Roles
```bash
php artisan tinker
> \App\Models\Role::all()
# Will show all roles
```

### 4. Check Departments
```bash
php artisan tinker
> \App\Models\Department::all()
# Will show all departments
```

## 🚨 Common Issues & Solutions

### Error: "SQLSTATE[08006]"
```
Masalah: Cannot connect to PostgreSQL
Solusi:
1. Pastikan PostgreSQL service running
   - Windows: Services > PostgreSQL running
   - Or: pgAdmin open
2. Verify .env credentials:
   - Host: 127.0.0.1 (bukan localhost)
   - Port: 5432 (default)
   - Database: pelacaktugas
   - Username: postgres
3. Test connection:
   psql -U postgres -h 127.0.0.1
```

### Error: "SQLSTATE[42P01] relation does not exist"
```
Masalah: Tables belum ada
Solusi:
php artisan migrate
```

### Error: "Access denied for user 'postgres'"
```
Masalah: Password salah
Solusi:
1. Update .env DB_PASSWORD dengan password yang benar
2. Or reset PostgreSQL password
```

### Error: "could not translate host name"
```
Masalah: Host salah
Solusi: 
Gunakan 127.0.0.1 bukan localhost
```

## 🔄 Reset Database

Jika ingin start fresh:

```bash
# 1. Rollback all migrations
php artisan migrate:rollback

# 2. Fresh migrations dengan seed
php artisan migrate:fresh --seed

# Or one command:
php artisan migrate:fresh --seed --force
```

## 📊 Database Relationships

After migrations, relationships:

```
User
  ├─ belongsTo: Department
  ├─ belongsTo: Role
  ├─ hasMany: Tasks
  ├─ hasMany: Attendances
  └─ belongsToMany: Projects

Department
  └─ hasMany: Users

Role
  └─ hasMany: Users

Project
  ├─ hasMany: Tasks
  └─ belongsToMany: Users (via project_user)

Task
  ├─ belongsTo: Project
  └─ belongsTo: User

Attendance
  └─ belongsTo: User
```

## 🎯 After Migration

### Credentials untuk Testing

Default test account (jika ada):
```
Email: test@example.com
Password: password
```

Atau register account baru di UI:
1. Open http://localhost:5173
2. Click "Sign up here"
3. Register dengan email & password

### API Testing

Gunakan Postman:

```
1. POST /api/register
   Body: { name, email, password, password_confirmation, department_id }

2. POST /api/login
   Body: { email, password }
   Response: { token, user }

3. Use token in future requests:
   Header: Authorization: Bearer {token}
```

## 📝 Full Setup Sequence

```bash
# 1. Ensure backend dependencies installed
cd E:\task-tracker-vue\backend
composer install

# 2. Setup environment
# Already done: .env is configured

# 3. Generate app key (already done)
# php artisan key:generate

# 4. Run migrations & seeds
php artisan migrate:fresh --seed

# 5. Start server
php artisan serve

# Output: http://127.0.0.1:8000
```

## 🔗 Frontend Integration

Frontend sudah configured untuk connect:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Jika backend di port berbeda, update di:
`frontend/.env`

## ✨ Success Indicators

Jika semuanya success:
✅ No database connection errors
✅ All tables created
✅ No migration errors
✅ Frontend login form appear
✅ Can register & login
✅ Dashboard load dengan data

## 📚 More Info

- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Laravel Migrations](https://laravel.com/docs/migrations)
- [Laravel Tinker](https://laravel.com/docs/tinker)

---

**SIAP UNTUK DEVELOPMENT! 🚀**

Run: `php artisan migrate:fresh --seed` untuk start!
