import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/statics',
    name: 'Statics',
    component: () => import('@/views/mgmt/statics/index.vue'),
    meta: {
      title: '数据分析',
    },
  },
];

export default routes;
