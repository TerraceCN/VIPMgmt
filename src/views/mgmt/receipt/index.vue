<template>
  <div>
    <n-form
      ref="filterForm"
      inline
      :label-width="50"
      :model="model"
      label-placement="left"
      size="medium"
    >
      <n-grid x-gap="12" y-gap="8" item-responsive>
        <n-gi span="24 450:22">
          <n-form-item label="查找" path="query">
            <n-input
              v-model:value="model.query"
              placeholder="用户名/真实姓名/手机号/邮箱"
              @keyup.enter.native="loadData"
            />
          </n-form-item>
        </n-gi>

        <n-gi span="24 450:2">
          <n-form-item>
            <n-button
              :loading="loading"
              type="info"
              style="width: 100%"
              @click="loadData"
            >查找</n-button>
          </n-form-item>
        </n-gi>
      </n-grid>
    </n-form>

    <n-data-table
      remote
      ref="table"
      :columns="columns"
      :data="data"
      :loading="loading"
      :pagination="pagination"
      :row-key="(row: RecordListItem) => row.id"
      @update:page="handlePageChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { h, ref, reactive, onMounted } from 'vue';
import { useMessage, useDialog, NButton, NSpace } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';

import { ISOStringFormat } from '@/day';
import { getErrorReason } from '@/apis';
import { getRecordList, deleteRecord } from '@/apis/records';
import { RecordListItem } from '@/../interfaces/records';

const message = useMessage();
const dialog = useDialog();

const loading = ref(true);
const model = reactive<{
  query: string;
}>({
  query: '',
});

const columns: DataTableColumns<RecordListItem> = [
  {
    title: '会员姓名',
    key: 'userName',
    width: '100px',
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
    },
  },
  {
    title: '变动说明',
    key: 'description',
    width: '350px',
  },
  {
    title: '变动时间',
    key: 'createdAt',
    width: '180px',
  },
  {
    title: '操作员',
    key: 'operatorName',
    width: '100px',
  },
  {
    title: '操作',
    key: 'action',
    render: (row) => {
      return h(NSpace, {}, () => [
        h(NButton, {
          type: 'error',
          onClick: () => handleDelete(row.id),
        }, () => '删除'),
      ]);
    }
  }
];

const data = ref<RecordListItem[]>([]);
const pagination = reactive({
  page: 1,
  pageSize: 10,
  pageCount: 0,
  itemCount: 0
});

async function loadData() {
  loading.value = true;
  try {
    const { total, records } = await getRecordList({
      ...model,
      page: pagination.page,
      perPage: pagination.pageSize,
      query: model.query,
    });
    records.forEach(item => {
      item.createdAt = ISOStringFormat(item.createdAt);
      item.description = item.description || '无';
    });
    data.value = records;

    pagination.pageCount = Math.ceil(total / pagination.pageSize);
    pagination.itemCount = total;
  } catch (err) {
    message.error(getErrorReason(err));
  } finally {
    loading.value = false;
  }
}

async function handlePageChange(currnetPage: number) {
  pagination.page = currnetPage;
  await loadData();
}

function handleDelete(id: number) {
  dialog.warning({
    title: '删除确认',
    content: '确定要删除此记录吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        loading.value = true;
        await deleteRecord(id);
        message.success('删除成功');
        await loadData();
      } catch (err) {
        message.error(getErrorReason(err));
      } finally {
        loading.value = false;
      }
    },
  })
  
}

onMounted(async () => {
  await loadData();
});
</script>