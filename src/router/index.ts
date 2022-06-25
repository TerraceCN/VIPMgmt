import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Cookies from 'js-cookie';

import index from '@/views/layout/index.vue';
import auth from './auth';
import credit from './credit';
import mgmt from './mgmt';
import user from './user';
import statics from './statics';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: index,
    children: [
      {
        path: '/',
        name: 'Index',
        redirect: '/credit/wallet',
      },
      ...credit,
      ...mgmt,
      ...user,
      ...statics,
    ],
  },
  ...auth,
  {
    path: '/:any(.*)',
    redirect: '/404'
  },
  {
    name: '404',
    path: '/404',
    component: () => import('@/views/404/index.vue')
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (typeof to.meta.title !== 'undefined') {
    document.title = (to.meta.title as string) + ' - 会员管理系统';
  } else {
    document.title = '会员管理系统';
  }

  if (to.meta.noAuth) {
    next();
  } else {
    if (!Cookies.get('token')) {
      router.push({ name: 'Login' });
    } else {
      next();
    }
  }
});

export default router;
