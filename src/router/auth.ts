import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('@/views/auth/login/index.vue'),
    meta: {
      title: '登录',
      noAuth: true,
    },
  },
  {
    path: '/auth/resetPassword',
    name: 'ResetPassword',
    component: () => import('@/views/auth/resetPassword/index.vue'),
    meta: {
      title: '重置密码',
      noAuth: true,
    },
  }
];

export default routes;
