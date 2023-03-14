import Vue from 'vue';
import VueRouter from 'vue-router';
import HomeView from '../views/undateto.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
