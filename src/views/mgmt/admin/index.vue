<template>
  <div>
    <n-form
      ref="formRef"
      inline
      :label-width="50"
      :model="model"
      :rules="rules"
      label-placement="left"
      size="medium"
    >
      <n-grid x-gap="12" y-gap="8" item-responsive>
        <n-gi span="24 450:22">
          <n-form-item label="用户名" path="username">
            <n-input
              v-model:value="model.username"
              placeholder="用户名"
              @keyup.enter.native="setAdmin"
            />
          </n-form-item>
        </n-gi>

        <n-gi span="24 450:2">
          <n-form-item>
            <n-button
              :loading="loading"
              type="primary"
              style="width: 100%"
              @click="setAdmin"
            >添加</n-button>
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
  </div>
</template>

<script lang="ts" setup>
import { h, ref, reactive, onMounted } from 'vue';
import {
  useMessage,
  useDialog,
  FormInst,
  FormItemRule,
  NSpace,
NButton
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';

import { ISOStringFormat } from '@/day';
import { getErrorReason } from '@/apis';
import { getUserList, setUserAdmin, cancelUserAdmin } from '@/apis/users';
import { UserDetailResponse } from '@/../interfaces/users';

const message = useMessage();
const dialog = useDialog();

const loading = ref(true);
const model = reactive<{
  username: string;
}>({
  username: '',
});

const formRef = ref<FormInst | null>(null);
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
    title: '操作',
    key: 'action',
    render: (row) => {
      return h(NSpace, {}, () => [
        h(NButton, {
          type: 'error',
          onClick: () => cancelAdmin(row)
        }, () => '移除管理员'),
      ]);
    }
  }
];
const rules = {
  username: {
    require: true,
    trigger: 'blur',
    validator (rule: FormItemRule, value: string) {
      if (value.match(/^[a-zA-Z0-9_]{5,25}$/)) {
        return Promise.resolve();
      } else {
        return Promise.reject('用户名必须为5-25位字母、数字或下划线');
      }
    }
  }
};

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
      isAdmin: true,
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
    loading.value = true;
    await loadData();
  } catch (err) {
    message.error(getErrorReason(err));
  } finally {
    loading.value = false;
  }
});

async function setAdmin() {
  formRef.value?.validate((errors) => {
    if (errors) return;
    dialog.warning({
      title: '管理员添加确认',
      content: `确定要添加 ${model.username} 为管理员吗？`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          loading.value = true;
          await setUserAdmin({ username: model.username });
          message.success('添加成功');
          await loadData();
        } catch (err) {
          message.error(getErrorReason(err));
        } finally {
          loading.value = false;
        }
      },
    });
  });
}

async function cancelAdmin(row: UserDetailResponse) {
  dialog.warning({
    title: '管理员移除确认',
    content: `确定要移除 ${row.realname} 的管理员吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        loading.value = true;
        await cancelUserAdmin(row.id);
        message.success('移除成功');
        await loadData();
      } catch (err) {
        message.error(getErrorReason(err));
      } finally {
        loading.value = false;
      }
    },
  });
}
</script>