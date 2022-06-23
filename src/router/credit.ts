import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/credit/wallet',
    name: 'CreditWallet',
    component: () => import('@/views/credit/wallet/index.vue'),
    meta: {
      title: '我的积分',
    },
  },
  {
    path: '/credit/receipt',
    name: 'CreditReceipt',
    component: () => import('@/views/credit/receipt/index.vue'),
    meta: {
      title: '积分明细',
    },
  },
];

export default routes;
