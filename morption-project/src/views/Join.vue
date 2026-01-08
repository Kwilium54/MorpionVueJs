<script>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import api from '@/api'
import ErrorMessage from '@/components/ErrorMessage.vue'
import { extractErrors } from '@/utils/errorHandler'

export default {
  components: {
    ErrorMessage,
    RouterLink
  },
  setup() {
    const router = useRouter()
    const gameCode = ref('')
    const errors = ref([])
    const isLoading = ref(false)

    const joinGame = async () => {
      errors.value = []
      isLoading.value = true

      try {
        const response = await api.patch(`/api/games/${gameCode.value}/join`)
        const gameId = response.data.id
        
        router.push({ name: 'game', params: { id: gameId } })
      } catch (error) {
        errors.value = extractErrors(error, 'Impossible de rejoindre la partie')
      } finally {
        isLoading.value = false
      }
    }

    return {
      gameCode,
      errors,
      isLoading,
      joinGame
    }
  }
}
</script>

<template>
  <div class="join-container">
    <div class="join-card card">
      <h1 class="title">🚪 Rejoindre une partie</h1>
      
      <ErrorMessage :errors="errors" />

      <form @submit.prevent="joinGame" class="join-form">
        <div class="form-group">
          <label for="gameCode">Code de la partie</label>
          <input 
            type="text" 
            id="gameCode" 
            v-model="gameCode" 
            placeholder="Entrez le code (ex: ABC123)"
            required
          />
        </div>
        
        <button type="submit" class="btn-primary" :disabled="isLoading || !gameCode">
          {{ isLoading ? 'Connexion...' : 'Rejoindre la partie' }}
        </button>
      </form>

      <RouterLink to="/home" class="back-link">← Retour à l'accueil</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.join-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.join-card {
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
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: var(--dark);
  text-align: center;
}

.join-form button {
  width: 100%;
}

.back-link {
  display: block;
  text-align: center;
  margin-top: 1.5rem;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: var(--primary-hover);
}
</style>
