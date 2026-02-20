<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <h2>Page Not Found</h2>
      <p>Sorry, the page you are looking for does not exist.</p>
      <button @click="router.push('/')" class="btn-home">Go to Home</button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.not-found-content {
  text-align: center;
}

.error-code {
  font-size: 5rem;
  font-weight: bold;
  color: #667eea;
  margin: 0;
  line-height: 1;
}

.not-found-content h2 {
  margin: 1rem 0 0.5rem 0;
  color: #333;
}

.not-found-content p {
  color: #666;
  margin: 0 0 2rem 0;
}

.btn-home {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
}

.btn-home:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}
</style>
