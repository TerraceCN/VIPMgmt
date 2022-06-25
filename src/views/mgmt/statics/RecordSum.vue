<template>
  <VChart class="chart" :loading="loading" :option="option" :autoresize="true" />
</template>

<script lang="ts" setup>
import { reactive, toRefs, watch } from 'vue';

import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent
} from 'echarts/components';
import { LineChart } from 'echarts/charts';

use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  LineChart,
  CanvasRenderer,
]);

const props = defineProps<{
  loading: boolean;
  labels: string[];
  sum_positive: number[];
  sum_negative: number[];
}>();
const {
  loading,
  labels,
  sum_positive,
  sum_negative,
} = toRefs(props);

const option = reactive({
  title: {
    text: '总体积分变动总额'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {},
  toolbox: {
    show: true,
    feature: {
      dataView: { readOnly: false },
      saveAsImage: {}
    }
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: labels
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: '增加',
      type: 'line',
      data: sum_positive,
      markPoint: {
        data: [
          { type: 'max', name: 'Max' },
          { type: 'min', name: 'Min' }
        ]
      },
      markLine: {
        data: [{ type: 'average', name: '平均' }]
      }
    },
    {
      name: '扣除',
      type: 'line',
      data: sum_negative,
      markPoint: {
        data: [
          { type: 'max', name: 'Max' },
          { type: 'min', name: 'Min' }
        ]
      },
      markLine: {
        data: [
          { type: 'average', name: '平均' },
        ]
      }
    }
  ]
});
</script>

<style lang="scss" scoped>
.chart {
  height: 40vh;
}
</style>
