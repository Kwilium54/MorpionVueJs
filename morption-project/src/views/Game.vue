<script>
import { ref } from 'vue'
import api from '@/api'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const game = ref(null)
    const currentUser = ref(null)
    const errorMessage = ref('')
    const errorCellIndex = ref(null)
    const router = useRouter()
    const ws = ref(null)

    const waitForOpponentMove = (gameId, playerId) => {
      ws.value = new WebSocket('wss://morpion-api.edu.netlor.fr/websockets')

      ws.value.onopen = () => {
        ws.value.send(JSON.stringify({
          action: 'connect',
          game_id: gameId,
          player_id: playerId
        }))
      }

      ws.value.onmessage = (event) => {
        const message = JSON.parse(event.data)

        switch (message.action) {
          case 'opponent-join':
            loadGame(gameId)
            break
          case 'opponent-play':
            loadGame(gameId)
            break
          case 'opponent-quit':
            loadGame(gameId)
            break
        }
      }

      ws.value.onerror = (error) => {
        console.error('Erreur WebSocket:', error)
      }

      ws.value.onclose = () => {}
    }

    const loadGame = async (gameId) => {
      try {
        const response = await api.get(`/api/games/${gameId}`)
        game.value = response.data
      } catch (error) {
        console.error('Erreur lors du chargement de la partie:', error)
      }
    }

    const showError = (message, cellIndex = null) => {
      errorMessage.value = message
      errorCellIndex.value = cellIndex
      setTimeout(() => {
        errorMessage.value = ''
        errorCellIndex.value = null
      }, 2000)
    }

    const play = async (index) => {
      if (game.value.next_player_id !== currentUser.value.id) {
        showError("Ce n'est pas votre tour !", index)
        return
      }

      const row = Math.floor(index / 3) + 1
      const col = (index % 3) + 1

      try {
        const response = await api.patch(`/api/games/${game.value.id}/play/${row}/${col}`)
        game.value = response.data
        errorMessage.value = ''
        errorCellIndex.value = null
      } catch (error) {
        console.error('Erreur lors du coup:', error)
        const message = error.response?.data?.message || 'Cette case est déjà jouée ou une erreur est survenue'
        showError(message, index)
      }
    }

    const goHome = () => {
      if (ws.value) {
        ws.value.close()
      }
      router.push('/')
    }

    const getBoard = () => {
      if (!game.value) return Array(9).fill(null)
      
      return [
        game.value.r1c1, game.value.r1c2, game.value.r1c3,
        game.value.r2c1, game.value.r2c2, game.value.r2c3,
        game.value.r3c1, game.value.r3c2, game.value.r3c3
      ]
    }

    const getCellSymbol = (cellValue) => {
      if (cellValue === null || cellValue === undefined || cellValue === '') return ''
      
      if (cellValue === 1) {
        return 'X'
      } else if (cellValue === 2) {
        return 'O'
      }
      return cellValue
    }

    return {
      game,
      currentUser,
      errorMessage,
      errorCellIndex,
      waitForOpponentMove,
      loadGame,
      play,
      goHome,
      getBoard,
      getCellSymbol,
      ws
    }
  },

  async beforeRouteEnter(to, from, next) {
    try {
      const gameId = to.params.id
      const gameResponse = await api.get(`/api/games/${gameId}`)
      const gameData = gameResponse.data
      const profileResponse = await api.get('/api/profile')
      const userData = profileResponse.data

      next(vm => {
        vm.game = gameData
        vm.currentUser = userData
        vm.waitForOpponentMove(gameId, userData.id)
      })
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la partie:', error)
      next()
    }
  },

  beforeUnmount() {
    if (this.ws && this.ws.value) {
      this.ws.value.close()
    }
  }
}
</script>

<template>
  <div class="game-container">
    <div v-if="game" class="game-card card">
      <div class="game-header">
        <h1 class="title">🎮 Partie {{ game.code }}</h1>
        <p class="player-name" v-if="currentUser">
          <span class="label">Vous:</span> <strong>{{ currentUser.name }}</strong>
        </p>
      </div>
      
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <div v-if="!game.opponent" class="waiting">
        <div class="spinner"></div>
        <p>En attente d'un adversaire...</p>
        <div class="game-code-display">
          <p>Code de la partie:</p>
          <div class="code">{{ game.code }}</div>
        </div>
      </div>

      <div v-else-if="game.state !== 2" class="game-active">
        <div class="players-info">
          <div class="player-card">
            <span class="player-label">Vous</span>
            <span class="player-value">{{ currentUser.name }}</span>
          </div>
          <div class="vs">VS</div>
          <div class="player-card">
            <span class="player-label">Adversaire</span>
            <span class="player-value" v-if="game.owner && game.opponent">
              {{ currentUser.id === game.owner.id ? game.opponent.name : game.owner.name }}
            </span>
          </div>
        </div>

        <div class="turn-indicator">
          <p v-if="game.next_player_id === currentUser.id" class="your-turn">
            ⏰ À votre tour !
          </p>
          <p v-else class="opponent-turn">
            ⏳ Au tour de l'adversaire
          </p>
        </div>

        <div class="game-grid">
          <div 
            v-for="(cell, index) in getBoard()" 
            :key="index" 
            class="cell"
            :class="{ 
              'error-cell': errorCellIndex === index, 
              'clickable': !cell && game.next_player_id === currentUser.id,
              'has-symbol': cell
            }"
            @click="play(index)"
          >
            {{ getCellSymbol(cell) }}
          </div>
        </div>
      </div>

      <div v-else class="game-over">
        <h2 class="game-over-title">Partie terminée !</h2>
        
        <div v-if="game.winner_id" class="result">
          <p v-if="game.winner_id === currentUser.id" class="win-message">
            🎉 Félicitations ! Vous avez gagné ! 🎉
          </p>
          <p v-else class="lose-message">
            Dommage, {{ game.winner && game.winner.name }} a gagné.
          </p>
        </div>
        <div v-else class="result">
          <p class="draw-message">🤝 Match nul !</p>
        </div>

        <div class="game-grid final-board">
          <div 
            v-for="(cell, index) in getBoard()" 
            :key="index" 
            class="cell has-symbol"
          >
            {{ getCellSymbol(cell) }}
          </div>
        </div>

        <button @click="goHome" class="btn-primary home-button">
          ← Retour à l'accueil
        </button>
      </div>
    </div>

    <div v-else class="loading-container">
      <div class="spinner"></div>
      <p>Chargement de la partie...</p>
    </div>
  </div>
</template>

<style scoped>
.game-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.game-card {
  max-width: 600px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.game-header {
  text-align: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--light);
}

.title {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: var(--dark);
}

.player-name {
  color: #7f8c8d;
  font-size: 0.95rem;
}

.label {
  font-weight: normal;
}

/* Attente adversaire */
.waiting {
  text-align: center;
  padding: 2rem 0;
}

.waiting p {
  margin: 1rem 0;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.game-code-display {
  margin-top: 2rem;
}

.game-code-display p {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--dark);
}

.code {
  display: inline-block;
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  background-color: var(--light);
  padding: 1rem 2rem;
  border-radius: var(--border-radius);
  letter-spacing: 0.3rem;
}

/* Info joueurs */
.players-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: var(--light);
  border-radius: var(--border-radius);
}

.player-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.player-label {
  font-size: 0.85rem;
  color: #7f8c8d;
  text-transform: uppercase;
  font-weight: 600;
}

.player-value {
  font-size: 1.1rem;
  color: var(--dark);
  font-weight: 600;
}

.vs {
  font-weight: bold;
  color: var(--primary-color);
  font-size: 1.2rem;
}

/* Indicateur de tour */
.turn-indicator {
  text-align: center;
  margin-bottom: 1.5rem;
}

.your-turn {
  color: var(--secondary-color);
  font-weight: bold;
  font-size: 1.2rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.opponent-turn {
  color: #7f8c8d;
  font-size: 1.1rem;
}

/* Grille de jeu */
.game-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  max-width: 400px;
  margin: 0 auto;
}

.cell {
  aspect-ratio: 1;
  background: white;
  border: 3px solid var(--light);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  transition: all 0.3s ease;
  cursor: not-allowed;
  color: var(--dark);
}

.cell.clickable {
  cursor: pointer;
  border-color: var(--primary-color);
}

.cell.clickable:hover {
  background-color: #f8f9fa;
  transform: scale(1.05);
  box-shadow: var(--shadow);
}

.cell.has-symbol {
  background-color: var(--light);
}

.cell.error-cell {
  background-color: #fee;
  border-color: var(--danger-color);
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Fin de partie */
.game-over {
  text-align: center;
}

.game-over-title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: var(--dark);
}

.result {
  margin-bottom: 2rem;
}

.win-message {
  color: var(--secondary-color);
  font-size: 1.5rem;
  font-weight: bold;
  animation: bounce 1s;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.lose-message {
  color: var(--danger-color);
  font-size: 1.2rem;
}

.draw-message {
  color: var(--warning-color);
  font-size: 1.3rem;
  font-weight: bold;
}

.final-board {
  opacity: 0.7;
  pointer-events: none;
  margin-bottom: 2rem;
}

.home-button {
  width: 100%;
  max-width: 300px;
}

/* Chargement */
.loading-container {
  text-align: center;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top: 5px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
