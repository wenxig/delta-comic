import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
window.$espace = {}
await (() => {
  const { promise, resolve } = Promise.withResolvers<void>()
 const siv= setInterval(() => {
    if (window.gmXmlHttpRequest) {
      resolve()
      clearInterval(siv)
      return promise
    }
  }, 500)
  document.addEventListener('plusready', () => {
    resolve()
  }, { once: true })
  return promise
})()

const app = createApp(App)

console.log('created !')
app.use(createPinia())
app.use(router)

app.mount('#app')