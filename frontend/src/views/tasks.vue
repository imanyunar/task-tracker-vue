<script setup>
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { taskService, projectService, userService } from '../services'

const authStore = useAuthStore()
const tasks = ref([])
const projects = ref([])
const users = ref([])
const loading = ref(false)
const searchQuery = ref('')
const showModal = ref(false)
const editingTask = ref(null)
const filterStatus = ref('')

const formData = ref({
  title: '',
  description: '',
  priority: 'medium',
  status: 'todo',
  project_id: '',
  user_id: '',
  due_date: ''
})

const user = computed(() => authStore.user)
const isAdmin = computed(() => user.value?.role_id === 1)
const isManager = computed(() => user.value?.role_id === 2)
const isEmployee = computed(() => user.value?.role_id === 3)
const canCreate = computed(() => isAdmin.value || isManager.value)
const canDelete = computed(() => isAdmin.value || isManager.value)
const canEditAll = computed(() => isAdmin.value || isManager.value)

const filteredTasks = computed(() => {
  let result = tasks.value.filter(task => 
    task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
  
  if (filterStatus.value) {
    result = result.filter(t => t.status === filterStatus.value)
  }
  
  return result
})

const getPriorityColor = (priority) => {
  const colors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    urgent: '#7c3aed'
  }
  return colors[priority] || '#6b7280'
}

const getStatusColor = (status) => {
  const colors = {
    todo: '#6b7280',
    doing: '#3b82f6',
    review: '#f59e0b',
    done: '#10b981'
  }
  return colors[status] || '#6b7280'
}

const getStatusLabel = (status) => {
  const labels = {
    todo: 'To Do',
    doing: 'Doing',
    review: 'Review',
    done: 'Done'
  }
  return labels[status] || status
}

onMounted(async () => {
  loading.value = true
  try {
    // Load tasks, projects, and users in parallel
    const [tasksRes, projectsRes, usersRes] = await Promise.all([
      taskService.getAllTasks(),
      projectService.getAllProjects(),
      userService.getAllUsers()
    ])
    
    tasks.value = tasksRes.data.data || tasksRes.data || []
    projects.value = projectsRes.data.data || projectsRes.data || []
    users.value = usersRes.data.data || usersRes.data || []
  } catch (error) {
    console.error('Error loading data:', error)
  } finally {
    loading.value = false
  }
})

const openModal = (task = null) => {
  if (task) {
    editingTask.value = task
    formData.value = { 
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      project_id: task.project_id,
      user_id: task.user_id,
      due_date: task.due_date
    }
  } else {
    editingTask.value = null
    formData.value = {
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      project_id: '',
      user_id: user.value?.id || '',
      due_date: ''
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingTask.value = null
}

const saveTask = async () => {
  if (!formData.value.title) {
    alert('Title is required')
    return
  }

  try {
    if (editingTask.value) {
      if (isEmployee.value) {
        // Employees can only update status
        await taskService.updateTask(editingTask.value.id, { status: formData.value.status })
      } else {
        await taskService.updateTask(editingTask.value.id, formData.value)
      }
    } else {
      await taskService.createTask(formData.value)
    }
    closeModal()
    // Reload tasks
    const tasksRes = await taskService.getAllTasks()
    tasks.value = tasksRes.data.data || tasksRes.data || []
  } catch (error) {
    alert('Error saving task: ' + (error.response?.data?.message || error.message))
  }
}

const deleteTask = async (id) => {
  if (!confirm('Are you sure? This action cannot be undone.')) return
  
  try {
    await taskService.deleteTask(id)
    tasks.value = tasks.value.filter(t => t.id !== id)
  } catch (error) {
    alert('Error deleting task: ' + (error.response?.data?.message || error.message))
  }
}

const canEditTask = (task) => {
  return canEditAll.value || (isEmployee.value && task.project?.members?.some(m => m.id === user.value?.id))
}
</script>

<template>
  <div class="tasks-container">
    <!-- Header -->
    <div class="tasks-header">
      <div class="header-content">
        <h1>📋 Tasks Management</h1>
        <p class="subtitle">Manage and track your project tasks - Role: <strong>{{ user?.role?.name }}</strong></p>
      </div>
      <button v-if="canCreate" @click="openModal()" class="btn-create">✨ New Task</button>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="🔍 Search tasks..." 
          class="search-input" 
        />
      </div>
      <div class="filter-box">
        <select v-model="filterStatus" class="filter-select">
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="doing">Doing</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
      </div>
    </div>

    <!-- Tasks Grid -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading tasks...</p>
    </div>

    <div v-else-if="filteredTasks.length === 0" class="empty-state">
      <p>📭 No tasks found</p>
      <p v-if="canCreate" class="text-muted">Click "New Task" to create your first task</p>
    </div>

    <div v-else class="tasks-grid">
      <div v-for="task in filteredTasks" :key="task.id" class="task-card">
        <!-- Top Bar -->
        <div class="task-top">
          <div class="badges">
            <span class="priority-badge" :style="{ backgroundColor: getPriorityColor(task.priority) }">
              {{ task.priority.toUpperCase() }}
            </span>
            <span class="status-badge" :style="{ backgroundColor: getStatusColor(task.status) }">
              {{ getStatusLabel(task.status) }}
            </span>
          </div>
          <div class="task-menu" v-if="canEditTask(task) || canDelete">
            <button 
              v-if="canEditTask(task)"
              @click="openModal(task)" 
              class="btn-icon" 
              title="Edit"
            >✎</button>
            <button 
              v-if="canDelete"
              @click="deleteTask(task.id)" 
              class="btn-icon btn-danger" 
              title="Delete"
            >✕</button>
          </div>
        </div>

        <!-- Content -->
        <h3 class="task-title">{{ task.title }}</h3>
        <p class="task-description">{{ task.description || '—' }}</p>

        <!-- Meta Info -->
        <div class="task-meta">
          <div class="meta-item">
            <span class="meta-label">📁 Project:</span>
            <span class="meta-value">{{ task.project?.name || 'N/A' }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">👤 Assigned:</span>
            <span class="meta-value">{{ task.user?.name || 'N/A' }}</span>
          </div>
          <div v-if="task.due_date" class="meta-item">
            <span class="meta-label">📅 Due:</span>
            <span class="meta-value">{{ task.due_date }}</span>
          </div>
        </div>

        <!-- Action Bar -->
        <div v-if="isEmployee && canEditTask(task)" class="action-bar">
          <select 
            :value="task.status" 
            @change="(e) => {
              const newTask = { ...task, status: e.target.value };
              openModal(newTask);
            }"
            class="status-select"
          >
            <option value="todo">To Do</option>
            <option value="doing">Doing</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h2>{{ editingTask ? '✎ Edit Task' : '✨ Create New Task' }}</h2>
          <button @click="closeModal" class="btn-close">✕</button>
        </div>

        <!-- Form -->
        <form @submit.prevent="saveTask" class="form">
          <div class="form-group">
            <label>Title *</label>
            <input 
              v-model="formData.title" 
              type="text" 
              placeholder="Task title" 
              required 
              class="input"
            />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea 
              v-model="formData.description" 
              placeholder="Task description (optional)" 
              rows="3"
              class="input"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Priority</label>
              <select v-model="formData.priority" class="input">
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
                <option value="urgent">⚫ Urgent</option>
              </select>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select v-model="formData.status" class="input">
                <option value="todo">To Do</option>
                <option value="doing">Doing</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Due Date</label>
              <input 
                v-model="formData.due_date" 
                type="date" 
                class="input"
              />
            </div>
            <div class="form-group">
              <label>Project</label>
              <select v-model="formData.project_id" class="input" required>
                <option value="">Select project</option>
                <option v-for="proj in projects" :key="proj.id" :value="proj.id">
                  {{ proj.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Assign To</label>
            <select v-model="formData.user_id" class="input" required>
              <option value="">Select user</option>
              <option v-for="usr in users" :key="usr.id" :value="usr.id">
                {{ usr.name }} ({{ usr.role?.name }})
              </option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-cancel">Cancel</button>
            <button type="submit" class="btn-submit">{{ editingTask ? 'Update Task' : 'Create Task' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.tasks-container {
  padding: 2rem 0;
  min-height: 100vh;
}

/* Header */
.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content h1 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 2rem;
}

.subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.btn-create {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-create:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
}

/* Filters */
.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

/* Loading & Empty */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  border: 2px dashed #e5e7eb;
}

.empty-state p {
  margin: 0.5rem 0;
  color: #6b7280;
  font-size: 1rem;
}

.text-muted {
  color: #9ca3af !important;
  font-size: 0.9rem;
}

/* Grid */
.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.task-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.task-top {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1.25rem;
  gap: 1rem;
}

.badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.priority-badge,
.status-badge {
  display: inline-block;
  padding: 0.35rem 0.7rem;
  border-radius: 6px;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.task-menu {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: #e5e7eb;
  transform: scale(1.05);
}

.btn-icon.btn-danger:hover {
  background: #fee2e2;
  color: #dc2626;
}

.task-title {
  margin: 0 0 0.75rem 0;
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.4;
}

.task-description {
  color: #6b7280;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 0;
  border-top: 1px solid #f3f4f6;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 1rem;
  flex: 1;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.meta-label {
  color: #9ca3af;
  font-weight: 500;
}

.meta-value {
  color: #1f2937;
  font-weight: 600;
}

.action-bar {
  margin-top: auto;
}

.status-select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  background: #f9fafb;
  transition: all 0.3s;
}

.status-select:focus {
  outline: none;
  border-color: #667eea;
  background: white;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8f9ff 0%, #f3f4f6 100%);
}

.modal-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s;
}

.btn-close:hover {
  color: #1f2937;
}

.form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #1f2937;
  font-weight: 600;
  font-size: 0.9rem;
}

.input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  transition: all 0.3s;
  background: #fff;
}

.input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  color: #1f2937;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .tasks-header {
    flex-direction: column;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .search-input,
  .filter-select {
    width: 100%;
  }

  .filters-section {
    flex-direction: column;
  }
}
</style>
