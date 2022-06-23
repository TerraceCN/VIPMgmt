<template>
  <n-dialog title="忘记密码" @close="emits('close')">
    <n-form
      ref="formRef"
      inline
      label-width="auto"
      :model="model"
      :rules="rules"
      label-placement="left"
      size="medium"
      style="margin-top: 20px"
    >
      <n-grid x-gap="12" y-gap="8">
        <n-gi span="18">
          <n-form-item label="邮箱" path="email">
            <n-input
              v-model:value="model.email"
              placeholder="邮箱地址"
              @keyup.enter.native="handleSend"
              autofocus
            />
          </n-form-item>
        </n-gi>

        <n-gi span="6">
          <n-form-item>
            <n-button
              :disabled="disableSend"
              style="width: 100%;"
              type="primary"
              @click="handleSend"
            >发送邮件 {{ disableSend ? `(${disableSendSeconds})` : '' }}</n-button>
          </n-form-item>
        </n-gi>
      </n-grid>
    </n-form>
  </n-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useMessage, FormItemRule, FormInst } from 'naive-ui';

import { getErrorReason } from '@/apis';
import { sendPasswordResetEmail } from '@/apis/auth';

const emits = defineEmits<{
  (e: 'close'): void,
}>();

const message = useMessage();

const formRef = ref<FormInst | null>(null);

const model = reactive({
  email: '',
});
const rules = {
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
}

const disableSend = ref(false);
const disableSendSeconds = ref(0);

async function handleSend(event: Event) {
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
</script>