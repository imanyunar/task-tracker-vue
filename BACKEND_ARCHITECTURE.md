# Backend Laravel - Architecture & Setup Documentation

Dokumentasi lengkap struktur backend Laravel untuk Task Tracker.

## 📦 Backend Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Controller.php         # Base controller
│   │   │   └── API/
│   │   │       ├── AuthController.php
│   │   │       ├── TaskController.php
│   │   │       ├── ProjectController.php
│   │   │       ├── UserController.php
│   │   │       ├── DepartmentController.php
│   │   │       ├── ProfileController.php
│   │   │       └── AttendanceController.php
│   │   └── Middleware/
│   │       ├── CheckRole.php
│   │       └── ManualTokenAuth.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Role.php
│   │   ├── Department.php
│   │   ├── Project.php
│   │   ├── Task.php
│   │   └── Attendance.php
│   └── Providers/
│       └── AppServiceProvider.php
├── database/
│   ├── migrations/         # Database schema
│   │   ├── *_create_roles_table.php
│   │   ├── *_create_departments_table.php
│   │   ├── *_create_users_table.php
│   │   ├── *_create_projects_table.php
│   │   ├── *_create_project_user_table.php
│   │   ├── *_create_tasks_table.php
│   │   └── *_create_attendances_table.php
│   ├── factories/
│   │   └── UserFactory.php
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── RoleSeeder.php
│       └── DepartmentSeeder.php
├── routes/
│   ├── api.php             # API routes
│   ├── web.php             # Web routes
│   └── console.php         # Console commands
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── database.php
│   ├── cors.php
│   └── ...
├── .env                    # Environment variables
├── artisan                 # Artisan CLI
├── composer.json           # PHP dependencies
└── README.md              # Backend documentation
```

## 🔐 Database Schema

### Users Table
```sql
id          - Primary key
name        - User full name
email       - Email (unique)
password    - Hashed password
department_id - Foreign key to departments
role_id     - Foreign key to roles
api_token   - API token (hashed)
created_at  - Created timestamp
updated_at  - Updated timestamp
```

### Roles Table
```sql
id          - Primary key
name        - Role name (Admin, Manager, Employee)
created_at  - Created timestamp
```

### Departments Table
```sql
id          - Primary key
name        - Department name
created_at  - Created timestamp
```

### Projects Table
```sql
id          - Primary key
name        - Project name
description - Project description
start_date  - Project start date
end_date    - Project end date
created_at  - Created timestamp
updated_at  - Updated timestamp
```

### Project_User Table (Pivot)
```sql
id          - Primary key
project_id  - Foreign key to projects
user_id     - Foreign key to users
created_at  - Created timestamp
```

### Tasks Table
```sql
id          - Primary key
name/title  - Task name
description - Task description
status      - Status (todo, review, doing, done, pending, completed, in-progress)
priority    - Priority (low, medium, high, urgent)
project_id  - Foreign key to projects
user_id     - Foreign key to users (assigned to)
due_date    - Due date
created_at  - Created timestamp
updated_at  - Updated timestamp
```

### Attendances Table
```sql
id          - Primary key
user_id     - Foreign key to users
check_in    - Check in time
check_out   - Check out time
date        - Attendance date
created_at  - Created timestamp
updated_at  - Updated timestamp
```

## 🔌 Controllers Overview

### AuthController
**Endpoints:**
- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /logout` - Logout user

**Features:**
- Email validation
- Password hashing with Hash facade
- Token generation (SHA256)
- User profile return after login

### TaskController
**Endpoints:**
- `GET /tasks` - Get all tasks (filtered by role)
- `GET /tasks/{id}` - Get task by ID
- `POST /tasks` - Create task
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task
- `GET /projects/{projectId}/tasks` - Get tasks by project
- `GET /dashboard-stats` - Get dashboard statistics
- `GET /dashboard-stats` - Get KPI statistics

**Features:**
- Role-based filtering (employees only see assigned tasks)
- Relationship loading (with project, user)
- Dashboard statistics

### ProjectController
**Endpoints:**
- `GET /projects` - Get all projects
- `GET /projects/{id}` - Get project by ID
- `POST /projects` - Create project
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project
- `GET /projects/search` - Search projects
- `POST /projects/{id}/add-member` - Add member to project

**Features:**
- Project member many-to-many relationship
- Search functionality
- Member management

### UserController
**Endpoints:**
- `GET /users` - Get all users
- `GET /users/{id}` - Get user by ID
- `POST /users` - Create user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

**Features:**
- User CRUD operations
- User relationships (department, role)

### DepartmentController
**Endpoints:**
- `GET /departments` - Get all departments
- `GET /departments/{id}` - Get department by ID
- `POST /departments` - Create department
- `PUT /departments/{id}` - Update department
- `DELETE /departments/{id}` - Delete department

**Features:**
- Department CRUD operations

### ProfileController
**Endpoints:**
- `GET /profile` - Get current user profile

**Features:**
- Returns authenticated user with relationships
- Department and role information

## 🔑 Authentication & Authorization

### Token-Based Auth
1. User registers/logs in
2. Backend generates random token
3. Token hashed with SHA256
4. Plain token sent to frontend
5. Frontend stores token in localStorage
6. Each request includes token in Authorization header
7. Backend verifies token on protected routes

### Middleware
- `auth` - Laravel built-in middleware for API
- `CheckRole` - Custom middleware for role checking
- `ManualTokenAuth` - Custom middleware for token validation

### Role-Based Access
- Admin (1) - Full access
- Manager (2) - Project management access
- Employee (3) - Limited access (can only see assigned tasks/projects)

## 📡 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["error message"]
  }
}
```

## 🛠️ Setup & Installation

### Prerequisites
- PHP 8.1+
- MySQL 5.7+
- Composer
- Git

### Installation Steps

```bash
# 1. Navigate to backend folder
cd backend

# 2. Install PHP dependencies
composer install

# 3. Copy environment file
cp .env.example .env

# 4. Generate application key
php artisan key:generate

# 5. Configure database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=task_tracker
DB_USERNAME=root
DB_PASSWORD=

# 6. Run migrations
php artisan migrate

# 7. Seed database (optional)
php artisan db:seed

# 8. Start server
php artisan serve
```

## 📊 Models & Relationships

### User Model
```php
hasMany: tasks, attendances
belongsTo: department, role
belongsToMany: projects (through project_user)
```

### Project Model
```php
hasMany: tasks
belongsToMany: users (through project_user)
```

### Task Model
```php
belongsTo: project, user
```

### Department Model
```php
hasMany: users
```

### Role Model
```php
hasMany: users
```

## 🔄 Key Features

### 1. Authentication
- Register with email/password
- Login with credentials
- API token generation
- Logout functionality

### 2. User Management
- Create/read/update/delete users
- Assign roles and departments
- Profile management

### 3. Project Management
- Create projects with dates
- Add/remove team members
- Track project tasks
- Search projects

### 4. Task Management
- Create/assign tasks
- Status tracking (todo, doing, done, etc.)
- Due date management
- Project association
- Role-based filtering

### 5. Dashboard
- Task statistics
- Project count
- Completion metrics
- KPI tracking

### 6. Attendance
- Check-in/out tracking
- Daily attendance records

## 🧪 Testing

```bash
# Run all tests
php artisan test

# Run specific test
php artisan test --filter=TaskTest

# Run with coverage
php artisan test --coverage
```

## 🚀 Deployment

### Environment Setup
```bash
# Production .env
APP_DEBUG=false
APP_ENV=production
DB_HOST=production-db-host
DB_PASSWORD=strong-password
```

### Migration on Server
```bash
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

## 📝 Common Commands

```bash
# Migrations
php artisan make:migration create_table_name
php artisan migrate
php artisan migrate:rollback
php artisan migrate:refresh

# Models
php artisan make:model ModelName -m   # With migration
php artisan make:model ModelName -c   # With controller
php artisan make:model ModelName -a   # With all

# Controllers
php artisan make:controller ControllerName

# Seeders
php artisan make:seeder SeederName
php artisan db:seed
php artisan db:seed --class=SeederName

# Tinker (Interactive shell)
php artisan tinker

# Testing
php artisan test
php artisan test --filter=TestClass

# Cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Maintenance
php artisan down       # Put app in maintenance mode
php artisan up         # Take app up
```

## 🔍 Debugging

### Enable Debug Mode
```env
APP_DEBUG=true
```

### Log Files
- `storage/logs/laravel.log`

### Tinker for Quick Testing
```bash
php artisan tinker

> User::all()
> Task::with('project')->get()
> $user = auth()->user()
```

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| "Class not found" | Run `composer autoload` or `composer install` |
| Database connection error | Verify .env database credentials |
| Token not working | Regenerate: `php artisan key:generate` |
| CORS errors | Check `config/cors.php` configuration |
| Migration errors | Check migration files and run `php artisan migrate:reset` |

## 📚 Useful Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Eloquent ORM](https://laravel.com/docs/eloquent)
- [API Resources](https://laravel.com/docs/eloquent-resources)
- [Testing](https://laravel.com/docs/testing)

## 🎯 Best Practices

1. **Always validate input** in controllers
2. **Use Eloquent relationships** instead of raw queries
3. **Return consistent API responses**
4. **Handle errors gracefully**
5. **Use database transactions** for related operations
6. **Add proper logging** for debugging
7. **Keep business logic** in models
8. **Use services** for complex operations
9. **Write tests** for critical functionality
10. **Document API** thoroughly

---

For API endpoint details, see [API_DOCUMENTATION.md](../API_DOCUMENTATION.md)

For full setup guide, see [SETUP.md](../SETUP.md)
