# Task Tracker - Full Stack Project

**Status:** ✅ Setup Complete

Aplikasi manajemen proyek dan tugas dengan backend Laravel + frontend Vue.js.

## 📋 Overview

Task Tracker adalah aplikasi web untuk:
- ✅ Manajemen user dan departemen
- ✅ Manajemen proyek dan anggota tim
- ✅ Manajemen task/todo dengan status tracking
- ✅ Dashboard dengan statistik real-time
- ✅ User authentication & authorization
- ✅ Profile management

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Vue 3)                   │
│  - SPA with Vue Router                              │
│  - Pinia for state management                       │
│  - Axios for API calls                              │
│  - Responsive design                                │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP/REST
┌──────────────────▼──────────────────────────────────┐
│                 BACKEND (Laravel)                    │
│  - RESTful API                                      │
│  - Token-based authentication                       │
│  - Database: MySQL/PostgreSQL                       │
│  - Eloquent ORM                                     │
└─────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
task-tracker-vue/
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── services/       # API services
│   │   ├── stores/         # Pinia stores
│   │   ├── router/         # Vue Router config
│   │   ├── views/          # Page components
│   │   ├── App.vue         # Root component
│   │   └── main.js         # Entry point
│   ├── public/             # Static files
│   ├── package.json        # Dependencies
│   ├── vite.config.js      # Vite config
│   ├── .env                # Environment variables
│   └── README.md           # Frontend docs
│
├── backend/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/  # API controllers
│   │   │   └── Middleware/   # Custom middleware
│   │   ├── Models/           # Eloquent models
│   │   └── Providers/        # Service providers
│   ├── database/
│   │   ├── migrations/       # Database migrations
│   │   ├── factories/        # Model factories
│   │   └── seeders/          # Database seeders
│   ├── routes/
│   │   ├── api.php           # API routes
│   │   ├── web.php           # Web routes
│   │   └── console.php       # Console commands
│   ├── config/               # Configuration files
│   ├── storage/              # Files & logs
│   ├── .env                  # Environment variables
│   ├── composer.json         # PHP dependencies
│   └── README.md             # Backend docs
│
├── SETUP.md                  # Full setup guide
├── QUICK_START.md            # Quick start (5 min)
├── API_DOCUMENTATION.md      # API reference
├── .gitignore                # Git ignore patterns
└── README.md                 # This file
```

## 🚀 Quick Start

### Installation (5 minutes)

1. **Backend**
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

2. **Frontend** (new terminal)
```bash
cd frontend
npm install
npm run dev
```

3. **Access**
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API: http://localhost:8000/api

### Full Setup Guide
Baca [SETUP.md](./SETUP.md) untuk dokumentasi lengkap.

### Rapid Start (< 5 min)
Baca [QUICK_START.md](./QUICK_START.md) untuk quick reference.

## 📚 Documentation

| File | Content |
|------|---------|
| [SETUP.md](./SETUP.md) | Panduan instalasi & konfigurasi lengkap |
| [QUICK_START.md](./QUICK_START.md) | Panduan singkat (5 menit) |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | API endpoints reference |
| [frontend/README.md](./frontend/README.md) | Frontend documentation |
| [backend/README.md](./backend/README.md) | Backend documentation |

## 🛠️ Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **Vue Router 4** - Client-side routing
- **Pinia** - State management
- **Axios** - HTTP client
- **Custom CSS** - Responsive styling

### Backend
- **Laravel 11** - PHP web framework
- **PHP 8.1+** - Server-side language
- **MySQL/PostgreSQL** - Database
- **Eloquent ORM** - Database abstraction
- **Laravel Sanctum** - API authentication

## 🔐 Authentication

- Token-based authentication
- Login/Register endpoints
- Protected routes with guards
- Auto-logout on 401
- Token stored in localStorage

## 📊 Database Schema

### Core Tables
- `users` - User accounts
- `roles` - User roles
- `departments` - Company departments
- `projects` - Projects
- `project_user` - Project members (pivot table)
- `tasks` - Tasks/todos
- `attendances` - Attendance records

### Key Relationships
```
User (many) ─── Has One ─── Department
User (many) ─── Has One ─── Role
Task (many) ─── Belongs To ─── Project
Task (many) ─── Belongs To ─── User
Project (many) ─── Belongs To Many ─── User
```

## 🔄 API Endpoints

### Public Endpoints
- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### Protected Endpoints
- `POST /api/logout` - Logout
- `GET /api/dashboard-stats` - Dashboard stats
- `GET/POST/PUT/DELETE /api/tasks` - Task CRUD
- `GET/POST/PUT/DELETE /api/projects` - Project CRUD
- `GET/POST/PUT/DELETE /api/users` - User CRUD
- `GET/POST/PUT/DELETE /api/departments` - Department CRUD
- `GET /api/profile` - Current user profile

Lihat [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) untuk detail lengkap.

## 🔧 Development

### Development Workflow

```bash
# Terminal 1: Backend
cd backend
php artisan serve

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Useful Commands

```bash
# Backend
php artisan migrate              # Run migrations
php artisan db:seed             # Seed database
php artisan tinker              # Interactive shell
php artisan test                # Run tests

# Frontend
npm run dev                      # Development server
npm run build                    # Production build
npm run preview                  # Preview build
```

## 📦 Build & Deploy

### Development
```bash
# Both services running locally
# Backend: http://localhost:8000
# Frontend: http://localhost:5173
```

### Production Build

```bash
# Frontend
cd frontend
npm run build
# Output di folder 'dist/'

# Backend
# Gunakan Laravel deployment guide
# https://laravel.com/docs/deployment
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | Use different port: `php artisan serve --port 8001` |
| Database connection error | Check MySQL running, verify .env credentials |
| API 404 | Verify backend `.env` URL di frontend |
| CORS error | Configure CORS di backend |
| Token expired | User will be redirected to login |

Lihat [SETUP.md](./SETUP.md) untuk troubleshooting lengkap.

## 📋 Checklist

- ✅ Backend API setup
- ✅ Frontend Vue setup
- ✅ Vue Router configuration
- ✅ Pinia state management
- ✅ Authentication system
- ✅ Task management UI
- ✅ Project management UI
- ✅ Dashboard page
- ✅ User profile page
- ✅ Responsive design
- ✅ Error handling
- ✅ API documentation
- ✅ Setup documentation
- ✅ .gitignore configuration

## 🤝 Contributing

Untuk kontribusi:
1. Create feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m 'Add my feature'`
3. Push to branch: `git push origin feature/my-feature`
4. Submit pull request

## 📝 License

MIT License

## 🎯 Next Steps

1. **Review Documentation**
   - Read [SETUP.md](./SETUP.md) untuk dokumentasi lengkap

2. **Setup Locally**
   - Follow [QUICK_START.md](./QUICK_START.md)

3. **Test Application**
   - Create accounts
   - Create projects
   - Test all features

4. **Customize**
   - Modify UI sesuai brand
   - Add additional features
   - Configure for production

5. **Deploy**
   - Build for production
   - Setup server
   - Configure domain

## 📞 Support

Untuk bantuan:
- Check documentation files
- Review code comments
- Check API reference
- Review error messages di console

---

**Happy coding! 🚀**

Last updated: February 20, 2026
