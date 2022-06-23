<template>
  <n-form
    ref="formRef"
    :model="model"
    :rules="rules"
    label-placement="left"
    require-mark-placement="right-hanging"
    size="medium"
  >
    <n-form-item path="username">
      <n-input
        v-model:value="model.username"
        placeholder="用户名"
        autofocus
        @keyup.enter.native="handleRegister"
      >
        <template #prefix>
          <n-icon size="18" color="#808695">
            <PersonOutline />
          </n-icon>
        </template>
      </n-input>
    </n-form-item>

    <n-form-item path="password">
      <n-input
        type="password"
        v-model:value="model.password"
        placeholder="密码"
        @keyup.enter.native="handleRegister"
      >
        <template #prefix>
          <n-icon size="18" color="#808695">
            <LockClosedOutline />
          </n-icon>
        </template>
      </n-input>
    </n-form-item>

    <n-form-item path="realname">
      <n-input
        v-model:value="model.realname"
        placeholder="真实姓名"
        @keyup.enter.native="handleRegister"
      >
        <template #prefix>
          <n-icon size="18" color="#808695">
            <PersonCircleOutline />
          </n-icon>
        </template>
      </n-input>
    </n-form-item>

    <n-form-item path="phone">
      <n-input
        v-model:value="model.phone"
        placeholder="手机号码"
        @keyup.enter.native="handleRegister"
      >
        <template #prefix>
          <n-icon size="18" color="#808695">
            <CallOutline />
          </n-icon>
        </template>
      </n-input>
    </n-form-item>

    <n-form-item path="email">
      <n-input
        v-model:value="model.email"
        placeholder="电子邮件地址"
        @keyup.enter.native="handleRegister"
      >
        <template #prefix>
          <n-icon size="18" color="#808695">
            <At />
          </n-icon>
        </template>
      </n-input>
    </n-form-item>

    <n-form-item>
      <n-button type="primary" @click="handleRegister" size="large" :loading="loading" block>
        注册
      </n-button>
    </n-form-item>
  </n-form>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import {
  PersonOutline,
  LockClosedOutline,
  PersonCircleOutline,
  CallOutline,
  At
} from '@vicons/ionicons5';
import { FormInst, FormItemRule, useMessage } from 'naive-ui';
import Cookies from 'js-cookie';

import { getErrorReason } from '@/apis';
import { register } from '@/apis/auth';

const message = useMessage();
const router = useRouter();

const formRef = ref<FormInst | null>(null);
const model = reactive({
  username: '',
  password: '',
  realname: '',
  phone: '',
  email: '',
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
  password: {
    required: true,
    trigger: 'blur',
    validator (rule: FormItemRule, value: string) {
      if (value.match(/^[a-zA-Z0-9$@!%*#?&+-_)(]{5,25}$/)) {
        return Promise.resolve();
      } else {
        return Promise.reject('密码必须为5-25位字母、数字或下划线');
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

const loading = ref(false);

function handleRegister(event: Event) {
  event.preventDefault();
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true;
      message.loading('登录中...');

      try {
        const response = await register(model);

        Cookies.set('token', response.token, {
          expires: 31,
        });
        localStorage.setItem('id', response.info.id.toString());
        localStorage.setItem('realname', response.info.realname);
        localStorage.setItem('isAdmin', response.info.isAdmin ? 'TRUE' : 'FALSE');

        message.destroyAll();
        message.success('注册成功', {
          duration: 2000,
          onAfterLeave: () => {
            router.push({ name: 'Index' });
          },
        });
      } catch (err) {
        message.destroyAll();
        message.error(getErrorReason(err));
      } finally {
        loading.value = false;
      }
    }
  });
}
</script>
