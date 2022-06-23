<template>
  <n-layout has-sider>
    <Sider v-model:collapsed="collapsed" @tabChange="(name: string) => { tabName = name }" />

    <n-layout>
      <Header @collapse="collapse" :tabName="tabName" />

      <n-layout-content class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import Sider from './Sider.vue';
import Header from './Header.vue';

const collapsed = ref(false);
const tabName = ref('会员管理系统');

function collapse() {
  collapsed.value = !collapsed.value;
}
</script>

<style lang="scss" scoped>
.content {
  margin: 20px 20px 0;
}
</style>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>