<template>
  <div class="notfound">
    <n-empty description="未找到页面">
      <template #icon>
        <n-icon>
          <Airplane />
        </n-icon>
      </template>
    </n-empty>
  </div>
</template>

<script lang="ts" setup>
import { Airplane } from '@vicons/ionicons5';
</script>

<style lang="scss" scoped>
.notfound {
  height: calc(100vh - 64px - 20px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>