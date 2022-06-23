<template>
  <div class="login-frame">
    <h1 style="text-align: center;">重置密码</h1>

    <n-form
      ref="formRef"
      :model="model"
      :rules="rules"
      label-placement="left"
      :label-width="80"
    >
      <n-form-item label="新密码" path="password">
        <n-input
          v-model:value="model.password"
          placeholder="请输入密码"
          name="password"
          type="password"
          @keyup.enter.native="handleSubmit"
          autofocus
        ></n-input>
      </n-form-item>

      <n-form-item label="确认密码" path="passwordConfirm">
        <n-input
          v-model:value="model.passwordConfirm"
          placeholder="请再输入一次密码"
          name="passwordConfirm"
          type="password"
          @keyup.enter.native="handleSubmit"
        ></n-input>
      </n-form-item>

      <n-form-item class="submit">
        <n-button
          :loading="loading"
          type="primary"
          @click="handleSubmit"
        >
          修改
        </n-button>
      </n-form-item>
    </n-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMessage, FormInst, FormItemRule } from 'naive-ui';

import { getErrorReason } from '@/apis';
import { resetPassword } from '@/apis/auth';

const route = useRoute();
const router = useRouter();

const message = useMessage();

const formRef = ref<FormInst | null>(null);
const model = reactive({
  password: '',
  passwordConfirm: '',
});
const rules = {
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
  passwordConfirm: {
    required: true,
    trigger: 'blur',
    validator (rule: FormItemRule, value: string) {
      if (value === model.password) {
        return Promise.resolve();
      } else {
        return Promise.reject('两次输入的密码不一致');
      }
    }
  },
}

const loading = ref(false);

function handleSubmit(event: Event) {
  event.preventDefault();
  formRef.value?.validate(async (errors) => {
    if (errors) return;
    try {
      loading.value = true;
      const token = Array.isArray(route.query.token)
        ? route.query.token[0] as string
        : route.query.token as string ?? '';
      await resetPassword({
        token,
        password: model.password,
      });

      message.success('修改成功', {
        duration: 2000,
        onAfterLeave: () => {
          router.push({ name: 'Login' });
        },
      });
    } catch (err) {
      message.error(getErrorReason(err));
    } finally {
      loading.value = false;
    }
  });
}
</script>

<style lang="scss" scoped>
.login-frame {
  padding: 20px;
  margin: 10vh auto 0 auto;
}
@media screen and (min-width: 450px) {
  .login-frame {
    width: 50vw;
  }
}

.submit {
  :deep(.n-form-item-blank) {
    justify-content: center;
  }
  button {
    width: 30%;
  }
}
</style>
