<script setup>
import { RouterLink, useRouter } from 'vue-router'
import api from '@/api'

const router = useRouter()

const createGame = async () => {
  try {
    const response = await api.post('/api/games')
    
    const gameId = response.data.id
    router.push({ name: 'game', params: { id: gameId } })
  } catch (error) {
    console.error('Erreur lors de la création de la partie:', error)
  }
}
</script>

<template>
  <div class="home-container">
    <div class="home-card card">
      <h1 class="title">🎮 Morpion</h1>
      <nav class="home-menu">
        <RouterLink to="/profile" class="menu-item">
          <span class="icon">👤</span>
          <span>Mon Profil</span>
        </RouterLink>
        <button @click="createGame" class="menu-item btn-primary">
          <span class="icon">➕</span>
          <span>Nouvelle Partie</span>
        </button>
        <RouterLink to="/join" class="menu-item">
          <span class="icon">🚪</span>
          <span>Rejoindre</span>
        </RouterLink>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-card {
  text-align: center;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.title {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: var(--dark);
}

.home-menu {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.menu-item {
  padding: 1.25rem;
  border-radius: var(--border-radius);
  text-decoration: none;
  color: var(--dark);
  background-color: var(--light);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-weight: 600;
  font-size: 1.1rem;
  border: 2px solid transparent;
}

.menu-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow);
  border-color: var(--primary-color);
}

.menu-item.btn-primary {
  background-color: var(--primary-color);
  color: white;
  border: none;
}

.menu-item.btn-primary:hover {
  background-color: var(--primary-hover);
}

.icon {
  font-size: 1.5rem;
}
</style>