import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './routes'
import { useUserStore } from './store/user'

import './assets/styles.css'
import '@tabler/icons-webfont/dist/tabler-icons.min.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

useUserStore().init()

app.mount('#app')
