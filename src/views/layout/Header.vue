<template>
  <n-layout-header class="header">
    <div class="header-left">
      <div
        class="sider-trigger"
        @click="() => { $emit('collapse') }"
      >
        <n-icon size="24">
          <Menu />
        </n-icon>
      </div>

      <h3>{{ tabName }}</h3>
    </div>

    <div class="header-right">
      {{ realname }}
    </div>
  </n-layout-header>
</template>


<script lang="ts" setup>
import { NIcon } from 'naive-ui';
import type { DropdownOption } from 'naive-ui';
import { Menu } from '@vicons/ionicons5';
import Cookies from 'js-cookie';

const { tabName } = defineProps<{
  tabName: string;
}>();
defineEmits<{
  (e: 'collapse'): void;
}>();

const realname = localStorage.getItem('realname') || '';
const personOptions: DropdownOption[] = [
  {
    label: '退出登录',
    key: 'logout',
  }
];

function personSelect(key: string) {
  if (key === 'logout') {
    localStorage.clear();
    Cookies.remove('token');
    window.location.reload();
  }
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgb(0 21 41 / 8%);
  width: 100%;
  z-index: 999;

   &-left {
    display: flex;
    align-items: center;

    .sider-trigger {
      display: inline-block;
      width: 64px;
      height: 64px;
      text-align: center;
      cursor: pointer;

      .n-icon {
        height: 64px;
        line-height: 64px;
      }
    }
   }

   &-right {
    display: flex;
    align-items: center;
    margin-right: 20px;
   }
}

</style>
