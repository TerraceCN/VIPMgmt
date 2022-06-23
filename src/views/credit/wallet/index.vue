<template>
  <div>
    <div class="statics">
      <n-grid x-gap="12" y-gap="8" cols="2" item-responsive>
        <n-gi span="2 450:1">
          <n-card
            id="credit"
            title="会员积分"
            :segmented="{ content: true }"
            hoverable
            header-style="font-size: 1rem; padding: 8px 20px"
            content-style="font-size: 2rem; padding: 8px 20px"
          >
            <n-skeleton v-if="loading" :width="160" :sharp="false" size="large" />
            <span v-else>{{ credit }}</span>
          </n-card>
        </n-gi>

        <n-gi span="2 450:1">
          <n-card
            id="level"
            title="会员等级"
            :segmented="{ content: true }"
            hoverable
            header-style="font-size: 1rem; padding: 8px 12px"
            content-style="font-size: 2rem; padding: 8px 20px"
          >
            <n-skeleton v-if="loading" :width="160" :sharp="false" size="large" />

            <template v-else-if="level <= 1">
              <img class="level-icon" src="@/assets/level-bronze.png" alt="青铜会员" />
              青铜会员
            </template>

            <template v-else-if="level === 2">
              <img class="level-icon" src="@/assets/level-silver.png" alt="白银会员" />
              白银会员
            </template>

            <template v-else-if="level === 3">
              <img class="level-icon" src="@/assets/level-gold.png" alt="青铜会员" />
              黄金会员
            </template>

            <template v-else>
              未知
            </template>
          </n-card>
        </n-gi>

        <n-gi span="2">
          <n-card
            id="records"
            title="近十次积分变动记录"
            :segmented="{ content: true }"
            hoverable
            header-style="font-size: 1rem; padding: 8px 12px"
            content-style="font-size: 2rem; padding: 8px 20px"
          >
            <n-skeleton v-if="loading" text :repeat="3" />

            <template v-else-if="records.length > 0">
              <RecordItem
                v-for="record in records"
                :key="record.id"
                :creditChange="record.creditChange"
                :createdAt="record.createdAt"
                :description="record.description"
              />
            </template>

            <n-empty v-else description="无变动记录"></n-empty>
          </n-card>
        </n-gi>
      </n-grid>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

import { getUserDetail } from '@/apis/users';
import { getLevelList } from '@/apis/level';
import { getUserRecordList } from '@/apis/records';
import { UserRecordListItem } from '@/../interfaces/records';

import RecordItem from './RecordItem.vue';

const loading = ref(true);
const credit = ref(0);
const level = ref(1);
const records = ref<UserRecordListItem[]>([]);

onMounted(async () => {
  const userId = parseInt(localStorage.getItem('id') as string);
  const levelData = await getLevelList();
  const userData = await getUserDetail(userId);
  const { records: rList } = await getUserRecordList(userId, {
    page: 1,
    perPage: 10,
  });
  records.value = rList;
  credit.value = userData.credit;
  for (let lv of levelData) {
    if (credit.value >= lv.credit) {
      level.value = lv.id;
    } else {
      break;
    }
  }
  loading.value = false;
});
</script>

<style lang="scss" scoped>
.level-icon {
  width: 24px;
}
</style>
