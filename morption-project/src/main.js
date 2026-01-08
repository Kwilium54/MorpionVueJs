
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initAuth } from './utils/auth'
import './assets/main.css'

initAuth()

const app = createApp(App)

app.use(router)

app.mount('#app')
