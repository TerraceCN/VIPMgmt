<template>
  <n-thing :title-extra="formatedTime" :description="description || '无'">
    <template #header>
      <span :style="{
        'color': creditChange > 0 ? 'red' : 'green',
      }">{{ formatedCreditChange }}</span>
    </template>
  </n-thing>
  <n-divider />
</template>

<script lang="ts" setup>
import { ISOStringFormat } from '@/day';

const {
  creditChange,
  createdAt,
  description
} = defineProps<{
  creditChange: number,
  createdAt: string,
  description: string
}>();

const formatedCreditChange = creditChange > 0 ? `+${creditChange}` : creditChange.toString();
const formatedTime = ISOStringFormat(createdAt);
</script>

<style lang="scss" scoped>
.n-divider {
  margin: 12px 0;
}
</style>
