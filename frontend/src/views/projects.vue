<script setup>
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { projectService } from '../services'

const authStore = useAuthStore()
const projects = ref([])
const loading = ref(false)
const searchQuery = ref('')
const showModal = ref(false)
const editingProject = ref(null)

const formData = ref({
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  status: 'planned'
})

const user = computed(() => authStore.user)
const isAdmin = computed(() => user.value?.role_id === 1)
const isManager = computed(() => user.value?.role_id === 2)
const canCreate = computed(() => isAdmin.value || isManager.value)
const canDelete = computed(() => isAdmin.value || isManager.value)

const filteredProjects = computed(() => {
  return projects.value.filter(project =>
    project.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const getStatusColor = (status) => {
  const colors = {
    planned: '#9ca3af',
    on_progress: '#3b82f6',
    completed: '#10b981'
  }
  return colors[status] || '#6b7280'
}

const getStatusLabel = (status) => {
  const labels = {
    planned: 'Planned',
    on_progress: 'In Progress',
    completed: 'Completed'
  }
  return labels[status] || status
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await projectService.getAllProjects()
    projects.value = res.data.data || res.data || []
  } catch (error) {
    console.error('Error loading projects:', error)
  } finally {
    loading.value = false
  }
})

const openModal = (project = null) => {
  if (project) {
    editingProject.value = project
    formData.value = { ...project }
  } else {
    editingProject.value = null
    formData.value = {
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'planned'
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingProject.value = null
}

const saveProject = async () => {
  if (!formData.value.name) {
    alert('Project name is required')
    return
  }

  try {
    if (editingProject.value) {
      await projectService.updateProject(editingProject.value.id, formData.value)
    } else {
      await projectService.createProject(formData.value)
    }
    closeModal()
    // Reload projects
    const res = await projectService.getAllProjects()
    projects.value = res.data.data || res.data || []
  } catch (error) {
    alert('Error saving project: ' + (error.response?.data?.message || error.message))
  }
}

const deleteProject = async (id) => {
  if (!confirm('Are you sure? This action cannot be undone.')) return

  try {
    await projectService.deleteProject(id)
    projects.value = projects.value.filter(p => p.id !== id)
  } catch (error) {
    alert('Error deleting project: ' + (error.response?.data?.message || error.message))
  }
}

const getTaskCount = (project) => {
  return project.tasks?.length || 0
}

const getMemberCount = (project) => {
  return project.members?.length || 0
}
</script>

<template>
  <div class="projects-container">
    <!-- Header -->
    <div class="projects-header">
      <div class="header-content">
        <h1>🗂️ Projects</h1>
        <p class="subtitle">Manage and track your projects</p>
      </div>
      <button v-if="canCreate" @click="openModal()" class="btn-create">✨ New Project</button>
    </div>

    <!-- Search -->
    <div class="search-section">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="🔍 Search projects..."
        class="search-input"
      />
    </div>

    <!-- Projects Grid -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading projects...</p>
    </div>

    <div v-else-if="filteredProjects.length === 0" class="empty-state">
      <p>📭 No projects found</p>
      <p v-if="canCreate" class="text-muted">Click "New Project" to create your first project</p>
    </div>

    <div v-else class="projects-grid">
      <div v-for="project in filteredProjects" :key="project.id" class="project-card">
        <!-- Header -->
        <div class="project-header">
          <div>
            <h3 class="project-name">{{ project.name }}</h3>
            <span class="status-badge" :style="{ backgroundColor: getStatusColor(project.status) }">
              {{ getStatusLabel(project.status) }}
            </span>
          </div>
          <div class="project-actions" v-if="canCreate || canDelete">
            <button v-if="canCreate" @click="openModal(project)" class="btn-icon" title="Edit">✎</button>
            <button v-if="canDelete" @click="deleteProject(project.id)" class="btn-icon btn-danger" title="Delete">✕</button>
          </div>
        </div>

        <!-- Description -->
        <p class="project-description">{{ project.description || '—' }}</p>

        <!-- Stats -->
        <div class="project-stats">
          <div class="stat">
            <span class="stat-label">📋 Tasks</span>
            <span class="stat-value">{{ getTaskCount(project) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">👥 Members</span>
            <span class="stat-value">{{ getMemberCount(project) }}</span>
          </div>
        </div>

        <!-- Dates -->
        <div class="project-dates">
          <div v-if="project.start_date" class="date-item">
            <span>📅 Start:</span>
            <span>{{ project.start_date }}</span>
          </div>
          <div v-if="project.end_date" class="date-item">
            <span>📅 End:</span>
            <span>{{ project.end_date }}</span>
          </div>
        </div>

        <!-- Members Preview -->
        <div v-if="project.members && project.members.length > 0" class="members-preview">
          <span class="members-label">Team:</span>
          <div class="members-list">
            <span v-for="member in project.members.slice(0, 3)" :key="member.id" class="member-badge">
              {{ member.name.split(' ')[0] }}
            </span>
            <span v-if="project.members.length > 3" class="member-badge more">
              +{{ project.members.length - 3 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h2>{{ editingProject ? '✎ Edit Project' : '✨ Create New Project' }}</h2>
          <button @click="closeModal" class="btn-close">✕</button>
        </div>

        <!-- Form -->
        <form @submit.prevent="saveProject" class="form">
          <div class="form-group">
            <label>Project Name *</label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="Enter project name"
              required
              class="input"
            />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea
              v-model="formData.description"
              placeholder="Project description (optional)"
              rows="3"
              class="input"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Start Date</label>
              <input v-model="formData.start_date" type="date" class="input" />
            </div>
            <div class="form-group">
              <label>End Date</label>
              <input v-model="formData.end_date" type="date" class="input" />
            </div>
          </div>

          <div class="form-group">
            <label>Status</label>
            <select v-model="formData.status" class="input">
              <option value="planned">📋 Planned</option>
              <option value="on_progress">⚙️ In Progress</option>
              <option value="completed">✅ Completed</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeModal" class="btn-cancel">Cancel</button>
            <button type="submit" class="btn-submit">{{ editingProject ? 'Update Project' : 'Create Project' }}</button>
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

.projects-container {
  padding: 2rem 0;
  min-height: 100vh;
}

/* Header */
.projects-header {
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

/* Search */
.search-section {
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  max-width: 400px;
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
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.project-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.project-name {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 700;
}

.status-badge {
  display: inline-block;
  padding: 0.35rem 0.7rem;
  border-radius: 6px;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.project-actions {
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

.project-description {
  color: #6b7280;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  line-height: 1.5;
  flex: 1;
}

/* Stats */
.project-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid #f3f4f6;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 1rem;
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  color: #9ca3af;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 700;
}

/* Dates */
.project-dates {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

.date-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #6b7280;
}

.date-item span:first-child {
  font-weight: 500;
}

.date-item span:last-child {
  color: #1f2937;
  font-weight: 600;
}

/* Members */
.members-preview {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.members-label {
  display: block;
  color: #9ca3af;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.members-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.member-badge {
  background: #f3f4f6;
  color: #1f2937;
  padding: 0.35rem 0.7rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.member-badge.more {
  background: #e5e7eb;
  color: #6b7280;
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
  .projects-header {
    flex-direction: column;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .search-input {
    width: 100%;
  }
}
</style>
