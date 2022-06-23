import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/mgmt/user',
    name: 'UserMgmt',
    component: () => import('@/views/mgmt/user/index.vue'),
    meta: {
      title: '会员管理',
    },
  },
  {
    path: '/mgmt/receipt',
    name: 'ReceiptMgmt',
    component: () => import('@/views/mgmt/receipt/index.vue'),
    meta: {
      title: '积分记录',
    },
  },
  {
    path: '/mgmt/admin',
    name: 'AdminMgmt',
    component: () => import('@/views/mgmt/admin/index.vue'),
    meta: {
      title: '管理员管理',
    },
  },
];

export default routes;
