<template>
  <n-dialog title="修改积分" @close="emits('close')">
    <n-form
    ref="filterForm"
    inline
    :label-width="50"
    :model="model"
    label-placement="left"
    size="medium"
    style="margin-top: 20px"
  >
    <n-grid x-gap="12" y-gap="8" :cols="2">
      <n-gi>
        <n-form-item label="变动前" path="before">
          <n-input
            :readonly="true"
            v-model:value="before"
            placeholder="变动前积分"
            :loading="loading"
          />
        </n-form-item>
      </n-gi>

      <n-gi>
        <n-form-item label="变动后" path="after">
          <n-input
            :readonly="true"
            v-model:value="after"
            placeholder="变动后积分"
            :loading="loading"
          />
        </n-form-item>
      </n-gi>

      <n-gi>
        <n-form-item label="模式" path="mode">
          <n-tabs
            v-model:value="model.mode"
            animated
            type="segment"
          >
            <n-tab-pane :name="1" tab="增加"></n-tab-pane>
            <n-tab-pane :name="-1" tab="扣除"></n-tab-pane>
          </n-tabs>
        </n-form-item>
      </n-gi>

      <n-gi>
        <n-form-item label="变动值" path="creditChange">
          <n-input-number style="width: 100%" v-model:value="model.creditChange" />
        </n-form-item>
      </n-gi>

      <n-gi span="2">
        <n-form-item>
          <n-input
            type="textarea"
            placeholder="变动说明"
            v-model:value="model.description"
          ></n-input>
        </n-form-item>
      </n-gi>

      <n-gi span="2">
        <n-form-item>
          <n-button
            :loading="loading"
            style="width: 100%;"
            type="primary"
            @click="handleConfirm"
          >确认</n-button>
        </n-form-item>
      </n-gi>
    </n-grid>
  </n-form>
  </n-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useMessage } from 'naive-ui';

import { getErrorReason } from '@/apis';
import { getUserDetail } from '@/apis/users';
import { createUserRecord } from '@/apis/records';

const emits = defineEmits<{
  (e: 'close'): void,
  (e: 'updated'): void,
}>();
const { id = null } = defineProps<{
  id: number | null
}>();

const message = useMessage();
const loading = ref(true);

const model = reactive({
  mode: 1,
  creditChange: 0,
  description: '',
});

const before = ref('0');
const after = computed(() => (parseInt(before.value) + model.mode * model.creditChange).toString());

async function handleConfirm() {
  if (id === null) return;
  loading.value = true;
  try {
    const data = await createUserRecord(id, {
      creditChange: model.mode * model.creditChange,
      description: model.description,
    });
    message.success('操作成功');
    before.value = data.after.toString();
    emits('updated');
  } catch (err) {
    message.error(getErrorReason(err));
  } finally {
    loading.value = false;
  }
}

async function loadData() {
  if (id === null) return;
  try {
    loading.value = true;
    const { credit } = await getUserDetail(id);
    before.value = credit.toString();
  } catch (e) {
    message.error(getErrorReason(e));
  } finally {
    loading.value = false;
  }
}

watch(() => id, async () => {
  await loadData();
});

onMounted(async () => {
  await loadData();
});
</script>