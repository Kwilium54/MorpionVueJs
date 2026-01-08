<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { setApiKey } from '@/api'

const router = useRouter()
const apiKey = ref('')
const error = ref('')
const isLoading = ref(false)

const login = async () => {
  if (!apiKey.value.trim()) {
    error.value = 'Veuillez saisir une API key'
    return
  }

  error.value = ''
  isLoading.value = true

  try {
    setApiKey(apiKey.value)
    
    sessionStorage.setItem('morpion_api_key', apiKey.value)
    
    router.push('/home')
  } catch (err) {
    error.value = 'Une erreur est survenue'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card card">
      <h1 class="title">🎮 Morpion</h1>
      <p class="subtitle">Saisissez votre API key pour continuer</p>

      <form @submit.prevent="login" class="login-form">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="form-group">
          <label for="apiKey">API Key</label>
          <input
            id="apiKey"
            v-model="apiKey"
            type="text"
            placeholder="Votre clé API"
            required
            :disabled="isLoading"
          />
        </div>

        <button type="submit" class="btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  text-align: center;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.title {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: var(--dark);
}

.subtitle {
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.login-form button {
  width: 100%;
}
</style>
