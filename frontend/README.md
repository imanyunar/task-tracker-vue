# Task Tracker - Vue Frontend

Frontend Vue untuk Task Tracker - Aplikasi manajemen proyek dan tugas dengan backend Laravel.

## Persyaratan

- Node.js >= 20.19.0 atau >= 22.12.0
- npm atau yarn
- Backend Laravel berjalan di `http://localhost:8000`

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Konfigurasi Environment

File `.env` sudah ada. Edit jika backend berjalan di port berbeda:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. Jalankan Development Server

```bash
npm run dev
```

Akses di `http://localhost:5173`

### 4. Build untuk Production

```bash
npm run build
```

## Struktur Project

```
src/
├── components/      # Reusable components
├── services/        # API service layer
│   ├── api.js
│   └── index.js
├── stores/          # Pinia state management
│   ├── auth.js
│   └── index.js
├── router/          # Vue Router
│   └── index.js
├── views/           # Page components
├── App.vue
└── main.js
```

## Features

✅ Authentication (Login/Register)
✅ Dashboard dengan statistik
✅ Task Management (CRUD)
✅ Project Management (CRUD)
✅ User Profile
✅ Search & Filter
✅ Responsive Design

## API Endpoints

Semua endpoint sudah di-integrate dengan backend:
- Authentication: `/api/login`, `/api/register`, `/api/logout`
- Dashboard: `/api/dashboard-stats`
- Tasks: `/api/tasks`
- Projects: `/api/projects`
- Users: `/api/users`
- Departments: `/api/departments`

## IDE Setup (VS Code)

- Install extension: [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- Disable Vetur jika ada

## Recommended Browser Extensions

- [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- [Network DevTools](https://chromewebstore.google.com/detail/network-chrome-extension/) untuk debugging API

## Troubleshooting

### CORS Error
Pastikan backend configure CORS untuk allow frontend URL

### Connection Error
Cek `.env` - `VITE_API_BASE_URL` harus sesuai backend URL

## Tech Stack

- Vue 3
- Vite
- Vue Router 4
- Pinia
- Axios

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
