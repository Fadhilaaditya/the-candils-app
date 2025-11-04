import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './views/user/App.vue'
import router from './router'

import Toast, { type PluginOptions, POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";

import { createVfm } from 'vue-final-modal' 
// --- [PERBAIKAN]: Tambahkan baris ini ---
import 'vue-final-modal/style.css'
// ------------------------------------

const app = createApp(App)

const options: PluginOptions = {
    position: POSITION.BOTTOM_RIGHT, 
    timeout: 4000,            
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
};

app.use(createPinia())
app.use(router)

app.use(Toast, options);
app.use(createVfm()); 

app.mount('#app')