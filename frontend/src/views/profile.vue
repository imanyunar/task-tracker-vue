<script setup>
import { onMounted, ref, reactive } from 'vue'
import { useUserStore } from '../stores'

const userStore = useUserStore()
const editing = ref(false)
const formData = reactive({})
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    await userStore.fetchProfile()
    if (userStore.profile) {
      Object.assign(formData, userStore.profile)
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  } finally {
    loading.value = false
  }
})

const handleEdit = () => {
  editing.value = true
}

const handleCancel = () => {
  editing.value = false
  if (userStore.profile) {
    Object.assign(formData, userStore.profile)
  }
}

const handleSave = async () => {
  try {
    await userStore.updateProfile(formData)
    editing.value = false
  } catch (error) {
    alert('Error updating profile: ' + error.message)
  }
}
</script>

<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1>My Profile</h1>
    </div>

    <div v-if="loading" class="loading">Loading profile...</div>

    <div v-else-if="userStore.profile" class="profile-card">
      <div class="profile-avatar">
        <div class="avatar-placeholder">
          {{ userStore.profile.name?.charAt(0) || 'U' }}
        </div>
      </div>

      <div class="profile-info">
        <div v-if="!editing" class="view-mode">
          <div class="info-field">
            <label>Name</label>
            <p>{{ userStore.profile.name }}</p>
          </div>
          <div class="info-field">
            <label>Email</label>
            <p>{{ userStore.profile.email }}</p>
          </div>
          <div class="info-field">
            <label>Role</label>
            <p>{{ userStore.profile.role?.name || 'N/A' }}</p>
          </div>
          <div class="info-field">
            <label>Department</label>
            <p>{{ userStore.profile.department?.name || 'N/A' }}</p>
          </div>
          <div class="info-field">
            <label>Joined</label>
            <p>{{ userStore.profile.created_at?.split('T')[0] || 'N/A' }}</p>
          </div>
          <button @click="handleEdit" class="btn-edit">Edit Profile</button>
        </div>

        <form v-else @submit.prevent="handleSave" class="edit-mode">
          <div class="form-group">
            <label for="name">Name</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Enter your name"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div class="form-actions">
            <button @click="handleCancel" type="button" class="btn-cancel">Cancel</button>
            <button type="submit" class="btn-save">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  padding: 2rem 0;
}

.profile-header {
  margin-bottom: 2rem;
}

.profile-header h1 {
  margin: 0;
  color: #333;
}

.loading {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  color: #666;
}

.profile-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
}

.profile-avatar {
  text-align: center;
  margin-bottom: 2rem;
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  margin: 0 auto;
}

.profile-info {
  width: 100%;
}

.view-mode .info-field {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.view-mode .info-field:last-child {
  border-bottom: none;
}

.view-mode .info-field label {
  display: block;
  color: #999;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.view-mode .info-field p {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.btn-edit {
  margin-top: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-cancel,
.btn-save {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-cancel {
  background: #f0f0f0;
  color: #333;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-save {
  background: #667eea;
  color: white;
}

.btn-save:hover {
  background: #5568d3;
}
</style>
