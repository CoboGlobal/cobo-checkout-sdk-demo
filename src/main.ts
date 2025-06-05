import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'

import App from './App.vue'
import router from './router'

// Configure axios defaults
axios.defaults.withCredentials = true
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
