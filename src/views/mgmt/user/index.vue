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
        <n-gi span="24 450:11">
          <n-form-item label="查找" path="query">
            <n-input
              v-model:value="model.query"
              placeholder="用户名/真实姓名/手机号/邮箱"
              @keyup.enter.native="loadData"
            />
          </n-form-item>
        </n-gi>

        <n-gi span="24 450:11">
          <n-form-item label="等级" path="level">
            <n-select
              v-model:value="model.level"
              placeholder="全部"
              :options="levelOptions"
              clearable
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
      :row-key="(row: UserDetailResponse) => row.id"
      @update:page="handlePageChange"
    />

    <n-modal
      style="width: 50vw;"
      v-model:show="showCreditEdit"
      @after-leave="editCreditId = null"
    >
      <CreditEdit
        :id="editCreditId"
        @close="editCreditId = null, showCreditEdit = false"
        @updated="loadData"
      />
    </n-modal>

    <n-modal
      v-model:show="showUserEdit"
      @after-leave="editUserId = null"
    >
      <n-dialog
        title="修改用户信息"
        @close="editUserId = null, showUserEdit = false"
      >
        <UserInfo
          style="margin: 20px 10px 0 10px"
          :id="editUserId"
        />
      </n-dialog>
    </n-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, h } from 'vue';
import { useMessage, useDialog, NButton, NSpace } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';

import { ISOStringFormat } from '@/day';
import { getErrorReason } from '@/apis';
import { getUserList, deleteUser } from '@/apis/users';
import { getLevelList } from '@/apis/level';
import { UserDetailResponse } from '@/../interfaces/users';
import UserInfo from '@/views/user/index.vue';
import CreditEdit from './CreditEdit.vue';

const message = useMessage();
const dialog = useDialog();

const loading = ref(true);
const model = reactive<{
  query: string;
  level: null | number;
}>({
  query: '',
  level: null,
});
const levelOptions = ref<{
  label: string,
  value: number,
}[]>([]);

const columns: DataTableColumns<UserDetailResponse> = [
  {
    title: '用户名',
    key: 'username',
    width: '120px',
  },
  {
    title: '真实姓名',
    key: 'realname',
    width: '100px',
  },
  {
    title: '手机号',
    key: 'phone',
    width: '120px',
  },
  {
    title: '电子邮件',
    key: 'email',
    width: '220px',
  },
  {
    title: '积分',
    key: 'credit',
    width: '100px',
  },
  {
    title: '最新变动时间',
    key: 'lastUpdate',
    width: '180px',
  },
  {
    title: '操作',
    key: 'action',
    render: (row) => {
      return h(NSpace, {}, () => [
        h(NButton, {
          type: 'primary',
          onClick: () => handleCreditEdit(row.id),
        }, () => '积分'),
        h(NButton, {
          type: 'info',
          onClick: () => handleUserEdit(row.id),
        }, () => '修改'),
        h(NButton, {
          type: 'error',
          onClick: () => handleDelete(row.id),
        }, () => '删除'),
      ]);
    }
  }
];

const data = ref<UserDetailResponse[]>([]);
const pagination = reactive({
  page: 1,
  pageSize: 10,
  pageCount: 0,
  itemCount: 0
});

async function loadData() {
  loading.value = true;
  try {
    const { total, users } = await getUserList({
      ...model,
      page: pagination.page,
      perPage: pagination.pageSize,
      query: model.query,
      credit: model.level || 0,
    });
    users.forEach(item => {
      item.lastUpdate = item.lastUpdate ? ISOStringFormat(item.lastUpdate) : '无';
    });
    data.value = users;
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

onMounted(async () => {
  try {
    const levelList = await getLevelList();
    levelList.forEach(lv => {
      levelOptions.value.push({
        label: lv.name,
        value: lv.credit,
      });
    });
    await loadData();
  } catch (err) {
    message.error(getErrorReason(err));
  } finally {
    loading.value = false;
  }
});

const showCreditEdit = ref(false);
const editCreditId = ref<number | null>(null);

function handleCreditEdit(id: number) {
  showCreditEdit.value = true;
  editCreditId.value = id;
}

const showUserEdit = ref(false);
const editUserId = ref<number | null>(null);

function handleUserEdit(id: number) {
  showUserEdit.value = true;
  editUserId.value = id;
}


async function handleDelete(id: number) {
  dialog.warning({
    title: '删除确认',
    content: '确定要删除此用户吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteUser(id);
        message.success('删除成功');
        await loadData();
      } catch (err) {
        message.error(getErrorReason(err));
      }
    },
  })
}
</script>