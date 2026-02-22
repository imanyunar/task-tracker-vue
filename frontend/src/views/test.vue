<template>
  <div class="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-white mb-4">✓ TEST PAGE WORKS!</h1>
      <p class="text-slate-300 text-lg">Vue rendering is functional</p>
      <p class="text-slate-400 text-sm mt-4">If you see this dark background with white text, the Vue app is rendering correctly.</p>
      
      <div class="mt-8 space-y-2">
        <div class="px-6 py-3 bg-green-600 text-white rounded-lg inline-block">
          ✓ Styling loaded
        </div>
        <div class="px-6 py-3 bg-blue-600 text-white rounded-lg inline-block ml-4">
          ✓ Tailwind working
        </div>
      </div>

      <router-link to="/login" class="mt-8 inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
        Go to Login
      </router-link>
    </div>
  </div>
</template>

<script setup>
</script>
