import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

await (() => {
  const { promise, resolve } = Promise.withResolvers<void>()
  if (window.gmXmlHttpRequest) {
    resolve()
    return promise
  }
  document.addEventListener('plusready', () => {
    resolve()
  }, { once: true })
  return promise
})()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')