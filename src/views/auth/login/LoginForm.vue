<template>
  <div>
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
          placeholder="请输入用户名/手机号/邮箱"
          autofocus
          @keyup.enter.native="handleLogin"
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
          placeholder="请输入密码"
          @keyup.enter.native="handleLogin"
        >
          <template #prefix>
            <n-icon size="18" color="#808695">
              <LockClosedOutline />
            </n-icon>
          </template>
        </n-input>
      </n-form-item>

      <div class="options">
        <a style="cursor: pointer;" @click="showForgetPassword = true">忘记密码</a>
      </div>

      <n-form-item>
        <n-button type="primary" @click="handleLogin" size="large" :loading="loading" block>
          登录
        </n-button>
      </n-form-item>
    </n-form>

    <n-modal
      v-model:show="showForgetPassword"
      style="width: 40vw;"
    >
      <ForgetPass @close="showForgetPassword = false" />
    </n-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { PersonOutline, LockClosedOutline } from '@vicons/ionicons5';
import { FormInst, FormItemRule, useMessage } from 'naive-ui';
import Cookies from 'js-cookie';

import { getErrorReason } from '@/apis';
import { login } from '@/apis/auth';

import ForgetPass from './ForgetPass.vue';

const message = useMessage();
const router = useRouter();

const formRef = ref<FormInst | null>(null);
const model = reactive({
  username: '',
  password: '',
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
};

const loading = ref(false);

function handleLogin(event: Event) {
  event.preventDefault();
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      loading.value = true;
      message.loading('登录中...');

      try {
        const response = await login(model);

        Cookies.set('token', response.token, {
          expires: 31,
        });
        localStorage.setItem('id', response.info.id.toString());
        localStorage.setItem('realname', response.info.realname);
        localStorage.setItem('isAdmin', response.info.isAdmin ? 'TRUE' : 'FALSE');

        message.destroyAll();
        message.success('登录成功', {
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

const showForgetPassword = ref(false);
</script>

<style lang="scss" scoped>
.options {
  margin-bottom: 24px;

  a {
    color: black;
    text-decoration: none;
  }
}
</style>