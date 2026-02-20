# Frontend Vue - Component & Architecture Documentation

Dokumentasi lengkap struktur frontend Vue untuk Task Tracker.

## 📦 Project Structure

```
frontend/
├── src/
│   ├── services/
│   │   ├── api.js              # Axios configuration with interceptors
│   │   └── index.js            # API service methods
│   ├── stores/
│   │   ├── auth.js             # Authentication store (Pinia)
│   │   └── index.js            # Other stores (tasks, projects, users, departments)
│   ├── router/
│   │   └── index.js            # Vue Router configuration
│   ├── views/
│   │   ├── login.vue           # Login page (public)
│   │   ├── register.vue        # Register page (public)
│   │   ├── dashboard.vue       # Dashboard (protected)
│   │   ├── tasks.vue           # Tasks list & management
│   │   ├── projects.vue        # Projects list & management
│   │   ├── profile.vue         # User profile
│   │   └── not-found.vue       # 404 page
│   ├── App.vue                 # Root component with navigation
│   ├── main.js                 # Application entry point
│   └── assets/                 # Static files
├── index.html                  # HTML template
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
├── .env                        # Environment variables
├── .env.example                # Environment example
└── README.md                   # Frontend documentation
```

## 🔧 Core Services

### api.js
**Purpose:** Axios HTTP client configuration

**Features:**
- API base URL configuration
- Request/response interceptors
- Automatic token injection
- 401 error handling with auto-redirect

**Usage:**
```javascript
import api from '@/services/api'

// GET request
const response = await api.get('/tasks')

// POST request with data
const response = await api.post('/tasks', {
  name: 'New Task',
  description: 'Task desc'
})

// PUT request
const response = await api.put(`/tasks/${id}`, data)

// DELETE request
await api.delete(`/tasks/${id}`)
```

### index.js (Services)
**Purpose:** API service methods for each feature

**Services:**
- `authService` - Register, login, logout
- `taskService` - CRUD operations for tasks
- `projectService` - CRUD operations for projects
- `userService` - CRUD operations for users
- `departmentService` - CRUD operations for departments
- `profileService` - User profile operations

**Usage:**
```javascript
import { taskService, projectService } from '@/services'

// Get all tasks
const response = await taskService.getAllTasks()

// Create task
await taskService.createTask(taskData)

// Get projects
const projects = await projectService.getAllProjects()
```

## 📊 Pinia Stores

### auth.js
**Purpose:** Authentication state management

**State:**
- `user` - Current logged-in user
- `token` - API token
- `loading` - Loading state
- `error` - Error messages

**Actions:**
- `register(userData)` - Register new user
- `login(credentials)` - Login user
- `logout()` - Logout user

**Computed:**
- `isAuthenticated` - Check if user is authenticated

**Usage:**
```javascript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Check authentication
if (authStore.isAuthenticated) {
  console.log('User:', authStore.user)
}

// Login
await authStore.login({ email, password })

// Logout
await authStore.logout()
```

### index.js (Stores)
**Purpose:** Other state management stores

**Stores:**
- `useTaskStore` - Tasks management
- `useProjectStore` - Projects management
- `useUserStore` - Users & profile
- `useDepartmentStore` - Departments

**Example - Task Store:**
```javascript
import { useTaskStore } from '@/stores'

const taskStore = useTaskStore()

// Fetch all tasks
await taskStore.fetchTasks()

// Access tasks
console.log(taskStore.tasks)

// Create task
await taskStore.createTask(taskData)

// Update task
await taskStore.updateTask(id, updatedData)

// Delete task
await taskStore.deleteTask(id)
```

## 🛣️ Vue Router

**Purpose:** Client-side routing configuration

**Routes:**
```
/                → Redirect to /dashboard
/login          → Login page (public)
/register       → Register page (public)
/dashboard      → Dashboard (protected)
/tasks          → Tasks management (protected)
/projects       → Projects management (protected)
/profile        → User profile (protected)
/*              → 404 Not Found
```

**Route Protection:**
- Public routes: `/login`, `/register`
- Protected routes: Require authentication
- Auto-redirect unauthenticated users to login
- Auto-redirect authenticated users from login to dashboard

**Usage:**
```javascript
import router from '@/router'

// Navigate programmatically
router.push('/dashboard')
router.push({ name: 'Tasks' })

// Get current route
const route = useRoute()
console.log(route.path, route.params, route.query)
```

## 🎨 Views/Pages

### login.vue
**Purpose:** User login page

**Features:**
- Email & password form
- Error display
- Loading state
- Link to register page
- Auto-redirect to dashboard if already logged in

**Form Validation:**
- Email format
- Password required

### register.vue
**Purpose:** New user registration page

**Features:**
- Name, email, password form
- Department selection
- Password confirmation
- Form validation
- Link to login page

**Form Validation:**
- All fields required
- Email unique check
- Password min 6 characters
- Password confirmation match

### dashboard.vue
**Purpose:** Main dashboard page

**Features:**
- Welcome message with user name
- 4 stat cards (total tasks, completed, pending, projects)
- Recent tasks list
- Loading state
- Dashboard statistics from API

**Data:**
- totalTasks
- completedTasks
- pendingTasks
- totalProjects
- recentTasks

### tasks.vue
**Purpose:** Task management page

**Features:**
- List all tasks in card layout
- Search/filter functionality
- Create new task button
- Modal for create/edit task
- Status badge with color coding
- Edit & delete actions
- Responsive grid layout

**Status Colors:**
- Pending: Yellow
- In Progress: Blue
- Completed: Green

**Modal Features:**
- Task name input
- Description textarea
- Status dropdown (pending, in-progress, completed)
- Due date picker
- Create/Update buttons

### projects.vue
**Purpose:** Project management page

**Features:**
- List all projects in card layout
- Search/filter functionality
- Create new project button
- Modal for create/edit project
- Start/end date display
- Member count
- Edit & delete actions

**Modal Features:**
- Project name input
- Description textarea
- Start date picker
- End date picker
- Create/Update buttons

### profile.vue
**Purpose:** User profile page

**Features:**
- View mode showing profile info
- Edit mode for updating profile
- Avatar placeholder with initials
- Show/edit toggle
- Name, email, role, department display
- Join date display

**Edit Features:**
- Name input
- Email input
- Save/Cancel buttons

### not-found.vue
**Purpose:** 404 page for invalid routes

**Features:**
- 404 error code display
- "Page not found" message
- Go to home button
- Centered layout

## 🔐 Authentication Flow

```
1. User visits /login or /register
   ↓
2. Fill form and submit
   ↓
3. Frontend calls API (register or login)
   ↓
4. Backend validates and returns token
   ↓
5. Frontend stores token in localStorage
   ↓
6. Auto-redirect to dashboard
   ↓
7. Token added to all future requests in Authorization header
   ↓
8. If token invalid (401), redirect to login
```

## 🎯 State Management Flow

```
View Component
       ↓
   [Dispatch Action in Store]
       ↓
   [Store Action]
       ↓
   [Call API Service]
       ↓
   [API Service]
       ↓
   [Backend Response]
       ↓
   [Update Store State]
       ↓
   [Component Watch/Subscribe Update]
       ↓
   [UI React to State Changes]
```

## 📡 API Integration

### Request Flow
1. Component calls service method
2. Service calls `api.request()`
3. Axios interceptor adds token header
4. API request sent to backend
5. Backend processes and responds
6. Response interceptor handles errors
7. Service returns formatted response
8. Component updates UI

### Error Handling
- Network errors: Caught in try-catch
- 401 Unauthorized: Redirect to login
- Validation errors: Show user-friendly messages
- Server errors: Display error message

## 🏗️ Component Lifecycle Example

```vue
<script setup>
import { onMounted, ref, reactive } from 'vue'
import { useTaskStore } from '@/stores'

const taskStore = useTaskStore()
const tasks = ref([])
const loading = ref(false)

// Lifecycle: Component mounted
onMounted(async () => {
  loading.value = true
  try {
    await taskStore.fetchTasks()
    tasks.value = taskStore.tasks
  } catch (error) {
    console.error('Error loading tasks:', error)
  } finally {
    loading.value = false
  }
})
</script>
```

## 🎨 Styling

### Design System
- Primary color: #667eea (Purple)
- Secondary color: #764ba2 (Dark Purple)
- Success: #10b981 (Green)
- Warning: #f59e0b (Orange)
- Danger: #ef4444 (Red)
- Background: #f5f5f5 (Light Gray)

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### CSS Patterns
```css
/* Grid layout */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Modal overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
}

/* Button styles */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}
```

## 📦 Dependencies

```json
{
  "vue": "^3.5.28",          // Vue framework
  "vue-router": "^4.4.5",    // Client-side routing
  "pinia": "^2.2.4",         // State management
  "axios": "^1.7.9"          // HTTP client
}
```

## 🔄 Development Workflow

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🐛 Debugging

### Browser DevTools
- **Vue DevTools**: Inspect components and state
- **Network Tab**: Monitor API requests
- **Console**: View JavaScript errors
- **Application Tab**: Check localStorage

### Common Issues

| Issue | Solution |
|-------|----------|
| Component not updating | Check store subscription, use computed() for reactive data |
| API call failing | Verify token in localStorage, check network tab |
| Modal not closing | Ensure closeModal() is called |
| Search not working | Check input binding and filter logic |

## 📝 Best Practices

1. **Always use Pinia stores** for shared state
2. **Use services** for API calls (don't call API directly)
3. **Add error handling** to all async operations
4. **Show loading states** for better UX
5. **Validate form inputs** before submission
6. **Use computed properties** for derived data
7. **Add comments** to complex logic
8. **Keep components focused** on single responsibility

## 🚀 Component Creation Checklist

- [ ] Create `.vue` file in appropriate folder
- [ ] Add `<script setup>` section
- [ ] Import necessary composables/stores
- [ ] Add template with proper structure
- [ ] Add scoped styles
- [ ] Test all functionality
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Add comments for clarity
- [ ] Ensure responsive design

---

For more information, see main [README.md](./README.md) or [SETUP.md](./SETUP.md)
