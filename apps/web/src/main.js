import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import GameScreen from './components/GameScreen.vue';
import './styles/global.scss';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'game',
      component: GameScreen,
    },
  ],
});

const app = createApp(App);
app.use(router);
app.mount('#app');
