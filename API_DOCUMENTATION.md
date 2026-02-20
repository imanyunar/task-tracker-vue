# Task Tracker API Documentation

Dokumentasi lengkap API endpoints untuk Task Tracker Backend (Laravel).

## Base URL

```
http://localhost:8000/api
```

## Authentication

Aplikasi menggunakan API Token Bearer authentication.

### Request Headers

Setiap request (kecuali login/register) harus include:

```
Authorization: Bearer {api_token}
Content-Type: application/json
Accept: application/json
```

### Response Format

Semua response dalam format JSON.

## Endpoints

---

## 1. Authentication

### Register User

**Endpoint:** `POST /register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "department_id": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Berhasil registrasi",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "department_id": 1,
    "role_id": 3,
    "created_at": "2026-02-20T08:00:00Z"
  },
  "api_token": "generated_token_here"
}
```

### Login

**Endpoint:** `POST /login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Berhasil login",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "department_id": 1,
    "role_id": 3
  },
  "api_token": "generated_token_here"
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Email atau password salah"
}
```

### Logout

**Endpoint:** `POST /logout`

**Headers:** Require authentication

**Response (200):**
```json
{
  "success": true,
  "message": "Logout berhasil"
}
```

---

## 2. Dashboard

### Get Dashboard Statistics

**Endpoint:** `GET /dashboard-stats`

**Headers:** Require authentication

**Response (200):**
```json
{
  "totalTasks": 45,
  "completedTasks": 18,
  "pendingTasks": 27,
  "totalProjects": 8
}
```

---

## 3. Tasks

### Get All Tasks

**Endpoint:** `GET /tasks`

**Headers:** Require authentication

**Query Parameters:**
- `page` (optional) - Pagination page
- `per_page` (optional) - Items per page (default: 15)

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Complete API Integration",
    "description": "Integrate Vue frontend with Laravel backend",
    "status": "in-progress",
    "due_date": "2026-02-28",
    "project_id": 2,
    "user_id": 1,
    "project": {
      "id": 2,
      "name": "Task Tracker",
      "description": "Full-stack task management application"
    },
    "created_at": "2026-02-20T08:00:00Z"
  }
]
```

### Get Task by ID

**Endpoint:** `GET /tasks/{id}`

**Headers:** Require authentication

**Response (200):**
```json
{
  "id": 1,
  "name": "Complete API Integration",
  "description": "Integrate Vue frontend with Laravel backend",
  "status": "in-progress",
  "due_date": "2026-02-28",
  "project_id": 2,
  "user_id": 1
}
```

**Error (404):**
```json
{
  "message": "Task not found"
}
```

### Create Task

**Endpoint:** `POST /tasks`

**Headers:** Require authentication

**Request:**
```json
{
  "name": "New Task",
  "description": "Task description",
  "status": "pending",
  "due_date": "2026-03-01",
  "project_id": 1,
  "user_id": 1
}
```

**Response (201):**
```json
{
  "id": 2,
  "name": "New Task",
  "description": "Task description",
  "status": "pending",
  "due_date": "2026-03-01",
  "project_id": 1,
  "user_id": 1,
  "created_at": "2026-02-20T09:00:00Z"
}
```

### Update Task

**Endpoint:** `PUT /tasks/{id}`

**Headers:** Require authentication

**Request:**
```json
{
  "name": "Updated Task Name",
  "status": "completed"
}
```

**Response (200):**
```json
{
  "id": 2,
  "name": "Updated Task Name",
  "status": "completed",
  "updated_at": "2026-02-20T10:00:00Z"
}
```

### Delete Task

**Endpoint:** `DELETE /tasks/{id}`

**Headers:** Require authentication

**Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

### Get Tasks by Project

**Endpoint:** `GET /projects/{projectId}/tasks`

**Headers:** Require authentication

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Task 1",
    "status": "in-progress",
    "project_id": 1
  },
  {
    "id": 2,
    "name": "Task 2",
    "status": "completed",
    "project_id": 1
  }
]
```

---

## 4. Projects

### Get All Projects

**Endpoint:** `GET /projects`

**Headers:** Require authentication

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Task Tracker",
    "description": "Full-stack task management system",
    "start_date": "2026-02-01",
    "end_date": "2026-03-31",
    "created_at": "2026-02-20T08:00:00Z",
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      }
    ]
  }
]
```

### Get Project by ID

**Endpoint:** `GET /projects/{id}`

**Headers:** Require authentication

**Response (200):**
```json
{
  "id": 1,
  "name": "Task Tracker",
  "description": "Full-stack task management system",
  "start_date": "2026-02-01",
  "end_date": "2026-03-31"
}
```

### Create Project

**Endpoint:** `POST /projects`

**Headers:** Require authentication

**Request:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "start_date": "2026-03-01",
  "end_date": "2026-04-30"
}
```

**Response (201):**
```json
{
  "id": 2,
  "name": "New Project",
  "description": "Project description",
  "start_date": "2026-03-01",
  "end_date": "2026-04-30",
  "created_at": "2026-02-20T10:00:00Z"
}
```

### Update Project

**Endpoint:** `PUT /projects/{id}`

**Headers:** Require authentication

**Request:**
```json
{
  "name": "Updated Project Name",
  "end_date": "2026-05-31"
}
```

**Response (200):**
```json
{
  "id": 2,
  "name": "Updated Project Name",
  "end_date": "2026-05-31",
  "updated_at": "2026-02-20T11:00:00Z"
}
```

### Delete Project

**Endpoint:** `DELETE /projects/{id}`

**Headers:** Require authentication

**Response (200):**
```json
{
  "message": "Project deleted successfully"
}
```

### Search Projects

**Endpoint:** `GET /projects/search`

**Headers:** Require authentication

**Query Parameters:**
- `q` - Search query (required)

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Task Tracker",
    "description": "Matching projects..."
  }
]
```

### Add Member to Project

**Endpoint:** `POST /projects/{id}/add-member`

**Headers:** Require authentication

**Request:**
```json
{
  "user_id": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Member added to project"
}
```

---

## 5. Users

### Get All Users

**Endpoint:** `GET /users`

**Headers:** Require authentication

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "department_id": 1,
    "role_id": 2,
    "created_at": "2026-02-20T08:00:00Z"
  }
]
```

### Get User by ID

**Endpoint:** `GET /users/{id}`

**Headers:** Require authentication

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "department_id": 1,
  "role_id": 2
}
```

### Get Current User Profile

**Endpoint:** `GET /profile`

**Headers:** Require authentication

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "department_id": 1,
  "role_id": 2,
  "department": {
    "id": 1,
    "name": "IT Department"
  },
  "role": {
    "id": 2,
    "name": "Manager"
  },
  "created_at": "2026-02-20T08:00:00Z"
}
```

### Create User

**Endpoint:** `POST /users`

**Headers:** Require authentication

**Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "department_id": 1,
  "role_id": 3
}
```

**Response (201):**
```json
{
  "id": 2,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "department_id": 1,
  "role_id": 3,
  "created_at": "2026-02-20T11:00:00Z"
}
```

### Update User

**Endpoint:** `PUT /users/{id}`

**Headers:** Require authentication

**Request:**
```json
{
  "name": "Jane Updated",
  "email": "jane.updated@example.com"
}
```

**Response (200):**
```json
{
  "id": 2,
  "name": "Jane Updated",
  "email": "jane.updated@example.com",
  "updated_at": "2026-02-20T12:00:00Z"
}
```

### Delete User

**Endpoint:** `DELETE /users/{id}`

**Headers:** Require authentication

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

## 6. Departments

### Get All Departments

**Endpoint:** `GET /departments`

**Headers:** Require authentication

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "IT Department",
    "created_at": "2026-02-20T08:00:00Z"
  },
  {
    "id": 2,
    "name": "HR Department",
    "created_at": "2026-02-20T08:00:00Z"
  }
]
```

### Get Department by ID

**Endpoint:** `GET /departments/{id}`

**Headers:** Require authentication

**Response (200):**
```json
{
  "id": 1,
  "name": "IT Department"
}
```

### Create Department

**Endpoint:** `POST /departments`

**Headers:** Require authentication

**Request:**
```json
{
  "name": "Finance Department"
}
```

**Response (201):**
```json
{
  "id": 3,
  "name": "Finance Department",
  "created_at": "2026-02-20T12:00:00Z"
}
```

### Update Department

**Endpoint:** `PUT /departments/{id}`

**Headers:** Require authentication

**Request:**
```json
{
  "name": "Updated Finance Department"
}
```

**Response (200):**
```json
{
  "id": 3,
  "name": "Updated Finance Department",
  "updated_at": "2026-02-20T13:00:00Z"
}
```

### Delete Department

**Endpoint:** `DELETE /departments/{id}`

**Headers:** Require authentication

**Response (200):**
```json
{
  "message": "Department deleted successfully"
}
```

---

## Error Handling

### Common Error Responses

**400 - Bad Request:**
```json
{
  "message": "Invalid request parameters"
}
```

**401 - Unauthorized:**
```json
{
  "message": "Unauthenticated"
}
```

**403 - Forbidden:**
```json
{
  "message": "Akses ditolak"
}
```

**404 - Not Found:**
```json
{
  "message": "Resource not found"
}
```

**422 - Validation Error:**
```json
{
  "success": false,
  "errors": {
    "email": ["Email sudah terdaftar"],
    "password": ["Password minimal 6 karakter"]
  }
}
```

**500 - Server Error:**
```json
{
  "message": "Internal server error"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Unprocessable Entity (Validation Error) |
| 500 | Internal Server Error |

---

## Testing with Postman

1. Import collection atau create manual requests
2. Set `Authorization` header dengan `Bearer {token}`
3. Set `Content-Type` header ke `application/json`
4. Test setiap endpoint

---

## Default Data

Setelah seeding, berikut data default:

### Roles
- 1: Admin
- 2: Manager
- 3: Employee

### Departments
- 1: IT
- 2: HR
- 3: Finance
- 4: Marketing

---

## Rate Limiting

Tidak ada rate limiting di-implement saat ini. Bisa di-add di future untuk production.

---

## Changelog

- v1.0 (2026-02-20) - Initial API release with all endpoints
