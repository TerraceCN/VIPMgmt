<template>
  <div style="text-align: center;">
    <div style="margin-bottom: 20px;">
      <span>数据范围: {{ fromString }} ~ {{ toString }}</span>
    </div>
    <RecordSum :loading="loading" :labels="labels" :sum_positive="sum_positive" :sum_negative="sum_negative" />
    <RecordCount :loading="loading" :labels="labels" :count_positive="count_positive" :count_negative="count_negative" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import { useMessage } from 'naive-ui';

import { getErrorReason } from '@/apis';
import { getStaticRecords } from '@/apis/statics';

import RecordSum from './RecordSum.vue';
import RecordCount from './RecordCount.vue';

const message = useMessage();

const loading = ref(true);
const to = dayjs().endOf('day');
const toString = ref(to.format('YYYY-MM-DD'));
const from = to.subtract(7, 'day').startOf('day');
const fromString = ref(from.format('YYYY-MM-DD'));

const labels = ref<string[]>([]);
const sum_positive = ref<number[]>([]);
const sum_negative = ref<number[]>([]);
const count_positive = ref<number[]>([]);
const count_negative = ref<number[]>([]);

async function loadData() {
  loading.value = true;
  try {
    const data = await getStaticRecords({
      from: from.toISOString(),
      to: to.toISOString(),
    });
    labels.value = data.labels;
    sum_positive.value = data.sum.positive;
    sum_negative.value = data.sum.negative;
    count_positive.value = data.count.positive;
    count_negative.value = data.count.negative;
    loading.value = false;
  } catch (err) {
    message.error(getErrorReason(err));
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadData();
});
</script>

<style lang="scss" scoped>

</style>
