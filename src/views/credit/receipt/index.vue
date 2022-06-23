<template>
  <div>
    <n-data-table
      remote
      ref="table"
      :columns="columns"
      :data="data"
      :loading="loading"
      :pagination="pagination"
      :row-key="(row: UserRecordListItem) => row.id"
      max-height="75vh"
      min-height="75vh"
      @update:page="handlePageChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { h, ref, reactive, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';

import { ISOStringFormat } from '@/day';
import { getErrorReason } from '@/apis';
import { getUserRecordList } from '@/apis/records';
import { UserRecordListItem } from '@/../interfaces/records';

const message = useMessage();

const loading = ref(true);
const pagination = reactive({
  page: 1,
  pageSize: 10,
  pageCount: 0,
  itemCount: 0,
});
const columns: DataTableColumns<UserRecordListItem> = [
  {
    title: '时间',
    key: 'createdAt',
    width: '180px',
  },
  {
    title: '积分变动',
    key: 'creditChange',
    width: '100px',
    render: (row) => {
      return h('span', {
        style: {
          'color': row.creditChange > 0 ? 'red' : 'green',
        },
      }, [row.creditChange > 0 ? `+${row.creditChange}` : row.creditChange.toString()]);
    }
  },
  {
    title: '变动描述',
    key: 'description',
  },
  {
    title: '操作员',
    key: 'operatorName',
    fixed: 'right',
    width: '100px',
  }
];

const data = ref<UserRecordListItem[]>([]);

async function loadData() {
  try {
    const userId = parseInt(localStorage.getItem('id') as string);
    const { total, records } = await getUserRecordList(userId, {
      page: pagination.page,
      perPage: pagination.pageSize,
    });
    pagination.pageCount = Math.ceil(total / pagination.pageSize);
    pagination.itemCount = total;
    records.forEach(item => {
      item.createdAt = ISOStringFormat(item.createdAt);
      item.description = item.description || '无';
    });
    data.value = records;
  } catch (error) {
    message.error(getErrorReason(error));
  } finally {
    loading.value = false;
  }
}

async function handlePageChange(currnetPage: number) {
  pagination.page = currnetPage;
  await loadData();
}

onMounted(() => {
  loadData();
});
</script>