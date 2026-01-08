<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import ErrorMessage from '@/components/ErrorMessage.vue'
import { extractErrors } from '@/utils/errorHandler'

export default {
  components: {
    ErrorMessage
  },
  setup() {
    const router = useRouter()
    const user = ref(null)
    const errors = ref([])
    const isLoading = ref(false)
    const successMessage = ref('')

    const saveProfile = async () => {
      errors.value = []
      successMessage.value = ''
      isLoading.value = true

      try {
        await api.put('/api/profile', user.value)
        successMessage.value = 'Profil enregistré avec succès !'
      } catch (error) {
        errors.value = extractErrors(error, 'Une erreur est survenue lors de l\'enregistrement')
      } finally {
        isLoading.value = false
      }
    }

    const goHome = () => {
      router.push('/home')
    }

    return {
      user,
      errors,
      isLoading,
      successMessage,
      saveProfile,
      goHome
    }
  },

  async beforeRouteEnter(to, from, next) {
    try {
      const response = await api.get('/api/profile')
      next(vm => {
        vm.user = response.data
      })
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
      next(vm => {
        vm.errors = ['Impossible de charger le profil']
      })
    }
  }
}
</script>

<template>
  <div class="profile-container">
    <div class="profile-card card">
      <div class="header">
        <h1 class="title">👤 Mon Profil</h1>
        <button @click="goHome" class="close-btn" title="Retour à l'accueil">✕</button>
      </div>

      <ErrorMessage :errors="errors" />

      <div v-if="successMessage" class="success-message">
        ✓ {{ successMessage }}
      </div>

      <form v-if="user" @submit.prevent="saveProfile" class="profile-form">
        <div class="form-group">
          <label for="name">Nom</label>
          <input
            id="name"
            v-model="user.name"
            type="text"
            required
            placeholder="Votre nom"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="user.email"
            type="email"
            required
            placeholder="votre.email@exemple.com"
          />
        </div>

        <button type="submit" class="btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </form>

      <div v-else class="loading">
        <div class="spinner"></div>
        Chargement du profil...
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-card {
  animation: fadeIn 0.5s ease;
  position: relative;
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

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.title {
  font-size: 2rem;
  color: var(--dark);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #95a5a6;
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background-color: var(--light);
  color: var(--danger-color);
}

.profile-form button {
  width: 100%;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--light);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
  
