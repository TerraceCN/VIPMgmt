import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/user/:id',
    name: 'UserInfo',
    component: () => import('@/views/user/index.vue'),
    meta: {
      title: '个人信息',
    },
  },
];

export default routes;
