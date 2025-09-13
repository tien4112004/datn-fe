<template>
  <ul class="chart-pool">
    <li class="chart-item" v-for="(chart, index) in chartList" :key="index">
      <div class="chart-content" @click="selectChart(chart)">
        <IconChartLine width="24" v-if="chart === 'line'" />
        <IconChartHistogram width="24" v-else-if="chart === 'column'" />
        <IconChartPie width="24" v-else-if="chart === 'pie'" />
        <IconChartHistogramOne width="24" v-else-if="chart === 'bar'" />
        <IconChartLineArea width="24" v-else-if="chart === 'area'" />
        <IconChartRing width="24" v-else-if="chart === 'ring'" />
        <IconChartScatter width="24" v-else-if="chart === 'scatter'" />
        <IconRadarChart width="23" v-else-if="chart === 'radar'" />

        <div class="name">{{ t(`toolbar.charts.pool.${chart}`) }}</div>
      </div>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import type { ChartType } from '@/types/slides';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const emit = defineEmits<{
  (event: 'select', payload: ChartType): void;
}>();

const chartList: ChartType[] = ['bar', 'column', 'line', 'area', 'scatter', 'pie', 'ring', 'radar'];

const selectChart = (chart: ChartType) => {
  emit('select', chart);
};
</script>

<style lang="scss" scoped>
.chart-pool {
  width: 240px;
  margin-bottom: -5px;

  @include flex-grid-layout();
}
.chart-item {
  @include flex-grid-layout-children(4, 24%);

  height: 0;
  padding-bottom: 25%;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
}
.chart-content {
  @include absolute-0();

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #999999;

  &:hover {
    color: var(--primary);
  }

  .name {
    margin-top: 4px;
  }
}
</style>
