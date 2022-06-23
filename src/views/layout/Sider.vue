<template>
  <n-layout-sider
    bordered
    collapse-mode="width"
    :collapsed="collapsed"
    :collapsed-width="collapsedWidth"
    :width="240"
    :inverted="true"
    class="sider"
  >
    <n-menu
      :inverted="true"
      :collapsed="collapsed"
      :collapsed-width="collapsedWidth"
      :options="menuOptions"
      :default-value="defaultOption"
      :default-expand-all="true"
      @update:value="handleMenuUpdate"
    />
  </n-layout-sider>
</template>

<script lang="ts" setup>
import { ref, h, Component, VNode } from 'vue';
import { useRoute, RouterLink, RouteLocationRaw } from 'vue-router';
import { NIcon } from 'naive-ui';
import type { MenuOption } from 'naive-ui';
import {
  WalletOutline,
  ReceiptOutline,
  PersonOutline,
  BusinessOutline,
  PeopleOutline,
  TicketOutline,
  IdCardOutline,
  LogOutOutline,
} from '@vicons/ionicons5';
import Cookies from 'js-cookie';

const { collapsed } = defineProps<{
  collapsed: boolean;
}>();
const emits = defineEmits<{
  (e: 'update:collapsed', value: boolean): void;
  (e: 'tabChange', value: string): void;
}>();
const collapsedWidth = ref(64);
let autoCollapse = false;

function onResize() {
  if (window.screen.width < 450) {
    emits('update:collapsed', true);
    collapsedWidth.value = 0;
    autoCollapse = true;
  } else {
    emits('update:collapsed', false);
    collapsedWidth.value = 64;
    autoCollapse = false;
  }
}
onResize();
window.addEventListener('resize', onResize);

const route = useRoute();

const linkName = new Map<string, string>([]);

function renderLink(to: RouteLocationRaw & {name: string}, text: string) {
  linkName.set(to.name, text);
  return () => h(RouterLink, { to }, () => text);
}

function renderIcon(icon: Component) {
  return () => h(NIcon, null, () => h(icon));
}

const menuOptions: MenuOption[] = [
  {
    label: renderLink({ name: 'CreditWallet' }, '我的积分'),
    key: 'CreditWallet',
    icon: renderIcon(WalletOutline),
  },
  {
    label: renderLink({ name: 'CreditReceipt' }, '积分明细'),
    key: 'CreditReceipt',
    icon: renderIcon(ReceiptOutline),
  },
  {
    label: renderLink(
      {
        name: 'UserInfo',
        params: { id: localStorage.getItem('id') },
      },
      '个人信息'
    ),
    key: 'UserInfo',
    icon: renderIcon(PersonOutline),
  },
  ...localStorage.getItem('isAdmin') === 'TRUE' ? [
    {
      label: '商家管理',
      key: 'Management',
      icon: renderIcon(BusinessOutline),
      children: [
        {
          label: renderLink({ name: 'UserMgmt' }, '会员管理'),
          key: 'UserMgmt',
          icon: renderIcon(PeopleOutline),
        },
        {
          label: renderLink({ name: 'ReceiptMgmt' }, '积分记录'),
          key: 'ReceiptMgmt',
          icon: renderIcon(TicketOutline),
        },
        {
          label: renderLink({ name: 'AdminMgmt' }, '管理员管理'),
          key: 'AdminMgmt',
          icon: renderIcon(IdCardOutline),
        },
      ],
    },
  ] : [],
  {
    label: '退出系统',
    key: 'LogOut',
    icon: renderIcon(LogOutOutline),
    
  },
];

const defaultOption = route.name as string;
handleMenuUpdate(defaultOption);

function handleMenuUpdate(key: string) {
  if (key === 'LogOut') {
    localStorage.clear();
    Cookies.remove('token');
    window.location.reload();
  }
  if (autoCollapse) {
    emits('update:collapsed', true);
  }
  if (linkName.has(key)) {
    emits('tabChange', linkName.get(key) as string);
  } else {
    emits('tabChange', '会员管理系统');
  }
}
</script>

<style lang="scss" scoped>
.sider {
  min-height: 100vh;
}
</style>