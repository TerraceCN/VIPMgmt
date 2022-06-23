<template>
  <div>
    <n-form
      ref="formRef"
      :model="model"
      :rules="rules"
      label-width="80px"
      label-placement="left"
      require-mark-placement="right-hanging"
      size="medium"
    >
      <n-form-item label="用户名" path="username">
        <n-input
          v-model:value="model.username"
          placeholder="用户名"
          :loading="loading"
        ></n-input>
      </n-form-item>

      <n-form-item label="密码" path="password">
        <n-button
          :loading="loading"
          :disabled="disableSend"
          @click="handleResetPassword"
        >发送修改密码邮件 {{ disableSend ? `(${disableSendSeconds})` : '' }}</n-button>
      </n-form-item>

      <n-form-item label="真实姓名" path="realname">
        <n-input
          v-model:value="model.realname"
          placeholder="真实姓名"
          :loading="loading"
        ></n-input>
      </n-form-item>

      <n-form-item label="手机号码" path="phone">
        <n-input
          v-model:value="model.phone"
          placeholder="手机号码"
          :loading="loading"
        ></n-input>
      </n-form-item>

      <n-form-item label="电子邮件" path="email">
        <n-input
          v-model:value="model.email"
          placeholder="电子邮件地址"
          :loading="loading"
        ></n-input>
      </n-form-item>

      <n-form-item>
        <n-button type="primary" @click="handleUpdate" size="large" :loading="loading" block>
          修改
        </n-button>
      </n-form-item>
    </n-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { FormInst, FormItemRule, useMessage } from 'naive-ui';

import { getErrorReason } from '@/apis';
import { getUserDetail, updateUser } from '@/apis/users';
import { sendPasswordResetEmail } from '@/apis/auth';

const message = useMessage();

const {
  id = null
} = defineProps<{
  id?: number | null;
}>();

let userId: number;
if (id !== null) {
  userId = id;
} else {
  userId = parseInt(localStorage.getItem('id') as string);
}

const formRef = ref<FormInst | null>(null);
const model = reactive({
  username: '',
  realname: '',
  phone: '',
  email: '',
  isAdmin: false,
});
const rules = {
  username: {
    required: true,
    trigger: 'blur',
    validator (rule: FormItemRule, value: string) {
      if (value.match(/^[a-zA-Z0-9_]{5,25}$/)) {
        return Promise.resolve();
      } else {
        return Promise.reject('用户名必须为5-25位字母、数字或下划线');
      }
    }
  },
  realname: {
    required: true,
    trigger: 'blur',
    validator (rule: FormItemRule, value: string) {
      if (value.match(/^[\u4e00-\u9fa5]{2,5}$/)) {
        return Promise.resolve();
      } else {
        return Promise.reject('真实姓名必须为2-5位中文');
      }
    }
  },
  phone: {
    required: true,
    trigger: 'blur',
    validator (rule: FormItemRule, value: string) {
      if (value.match(/^1[3456789]\d{9}$/)) {
        return Promise.resolve();
      } else {
        return Promise.reject('手机号码格式不正确');
      }
    }
  },
  email: {
    required: true,
    trigger: 'blur',
    validator (rule: FormItemRule, value: string) {
      if (value.match(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/)) {
        return Promise.resolve();
      } else {
        return Promise.reject('邮箱地址格式不正确');
      }
    }
  }
};

const loading = ref(true);

const disableSend = ref(false);
const disableSendSeconds = ref(0);

function handleResetPassword(event: Event) {
  event.preventDefault();
  formRef.value?.validate(async (errors) => {
    if (errors) return;
    try {
      await sendPasswordResetEmail({ email: model.email });
      message.success('邮件已发送，请查收');

      disableSend.value = true;
      disableSendSeconds.value = 60;
      const countdown = setInterval(() => {
        if (disableSendSeconds.value > 0) {
          disableSendSeconds.value--;
        } else {
          disableSend.value = false;
          clearInterval(countdown);
        }
      }, 1000);
    } catch (error) {
      message.error(getErrorReason(error));
    }
  });
}

function handleUpdate(event: Event) {
  event.preventDefault();
  formRef.value?.validate(async (errors) => {
    if (errors) return;
    loading.value = true;
    message.loading('修改中...');

    try {
      const detail = await updateUser(userId, model);

      if (localStorage.getItem('id') === detail.id.toString()) {
        localStorage.setItem('id', detail.id.toString());
        localStorage.setItem('realname', detail.realname);
        localStorage.setItem('isAdmin', detail.isAdmin ? 'TRUE' : 'FALSE');
      }

      model.username = detail.username;
      model.realname = detail.realname;
      model.phone = detail.phone;
      model.email = detail.email;
      model.isAdmin = detail.isAdmin;

      message.destroyAll();
      message.success('修改成功', {
        duration: 2000,
      });
    } catch (err) {
      message.destroyAll();
      message.error(getErrorReason(err));
    } finally {
      loading.value = false;
    }
  });
}

async function loadData() {
  try {
    const detail = await getUserDetail(userId);

    model.username = detail.username;
    model.realname = detail.realname;
    model.phone = detail.phone;
    model.email = detail.email;
    model.isAdmin = detail.isAdmin;
  } catch (err) {
    message.error(getErrorReason(err));
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadData();
});

watch(() => id, async (newId) => {
  if (newId !== null) {
    userId = newId;
  } else {
    userId = parseInt(localStorage.getItem('id') as string);
  }
  await loadData();
});
</script>
