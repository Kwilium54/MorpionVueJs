<script>
export default {
  name: 'ErrorMessage',
  props: {
    errors: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<template>
  <div v-if="errors.length > 0" class="error-container">
    <div v-for="(error, index) in errors" :key="index" class="error-message">
      <span class="error-icon">⚠️</span>
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<style scoped>
.error-container {
  margin-bottom: 1rem;
}

.error-message {
  background-color: #fee;
  color: var(--danger-color);
  padding: 12px;
  border-radius: var(--border-radius);
  margin-bottom: 0.5rem;
  border-left: 4px solid var(--danger-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.error-icon {
  font-size: 1.2rem;
}
</style>
