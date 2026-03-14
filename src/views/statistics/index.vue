<template>
  <div class="statistics-dashboard">
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="时间范围">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" :shortcuts="dateShortcuts" @change="handleDateChange" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchDashboardData">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6" v-for="card in statsCards" :key="card.key">
          <el-card class="stats-card" shadow="hover">
            <div class="card-content">
              <div class="card-icon" :style="{ backgroundColor: card.color }">
                <el-icon :size="28">
                  <component :is="card.icon" />
                </el-icon>
              </div>
              <div class="card-info">
                <div class="card-value">{{ card.value }}</div>
                <div class="card-label">{{ card.label }}</div>
              </div>
            </div>
            <div class="card-footer">
              <span :class="card.trend > 0 ? 'up' : 'down'">
                <el-icon>
                  <component :is="card.trend > 0 ? 'Top' : 'Bottom'" />
                </el-icon>
                {{ Math.abs(card.trend) }}%
              </span>
              <span class="compare">较上期</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="16">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="chart-header">
              <span class="chart-title">销售趋势</span>
              <el-radio-group v-model="trendType" size="small" @change="handleTrendTypeChange">
                <el-radio-button label="day">日</el-radio-button>
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <stat-chart :options="salesTrendOptions" height="350px" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <span class="chart-title">订单状态分布</span>
          </template>
          <stat-chart :options="orderStatusOptions" height="350px" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <span class="chart-title">商品销售排行 TOP 10</span>
          </template>
          <stat-chart :options="productRankOptions" height="350px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <span class="chart-title">支付方式分布</span>
          </template>
          <stat-chart :options="paymentOptions" height="350px" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="24">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="chart-header">
              <span class="chart-title">用户消费排行 TOP 10</span>
              <el-button type="primary" link @click="handleExportUserRank">
                <el-icon><Download /></el-icon>导出
              </el-button>
            </div>
          </template>
          <el-table :data="userRankList" border stripe max-height="400">
            <el-table-column prop="rank" label="排名" width="80">
              <template #default="{ row }">
                <el-tag v-if="row.rank <= 3" :type="row.rank === 1 ? 'danger' : row.rank === 2 ? 'warning' : 'success'">
                  {{ row.rank }}
                </el-tag>
                <span v-else>{{ row.rank }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="username" label="用户名" width="150" />
            <el-table-column prop="orderCount" label="订单数量" width="120" />
            <el-table-column prop="totalAmount" label="消费总额">
              <template #default="{ row }">
                <span class="amount">{{ formatMoney(row.totalAmount) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ShoppingCart, Money, User, Document, Top, Bottom, Search, Refresh, Download } from '@element-plus/icons-vue';
import { StatChart } from '@/components';
import { statisticsApi } from '@/api';
import { formatMoney } from '@/utils';
import type { EChartsOption } from 'echarts';
import type { StatisticsOverview, SalesTrendPoint, ProductSalesRank, UserConsumptionRank } from '@/types/statistics.d';

const trendType = ref<'day' | 'week' | 'month'>('day');
const overview = ref<StatisticsOverview | null>(null);
const salesTrend = ref<SalesTrendPoint[]>([]);
const productRank = ref<ProductSalesRank[]>([]);
const userRankList = ref<UserConsumptionRank[]>([]);
const orderStatusData = ref<Array<{ status: string; count: number; percentage: number }>>([]);
const paymentData = ref<Array<{ method: string; count: number; percentage: number }>>([]);

const dateRange = ref<string[]>([]);
const filterForm = reactive({
  startDate: '',
  endDate: '',
});

const dateShortcuts = [
  {
    text: '今日',
    value: () => {
      const today = new Date().toISOString().split('T')[0];
      return [today, today];
    },
  },
  {
    text: '本周',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - start.getDay() * 24 * 60 * 60 * 1000);
      return [start.toISOString().split('T')[0], end.toISOString().split('T')[0]];
    },
  },
  {
    text: '本月',
    value: () => {
      const end = new Date();
      const start = new Date(end.getFullYear(), end.getMonth(), 1);
      return [start.toISOString().split('T')[0], end.toISOString().split('T')[0]];
    },
  },
  {
    text: '最近30天',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 30 * 24 * 60 * 60 * 1000);
      return [start.toISOString().split('T')[0], end.toISOString().split('T')[0]];
    },
  },
  {
    text: '最近90天',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 90 * 24 * 60 * 60 * 1000);
      return [start.toISOString().split('T')[0], end.toISOString().split('T')[0]];
    },
  },
];

const statsCards = computed(() => {
  if (!overview.value) {
    return [
      { key: 'orders', label: '总订单数', value: 0, icon: 'ShoppingCart', color: '#409eff', trend: 0 },
      { key: 'amount', label: '总销售额', value: '¥0', icon: 'Money', color: '#67c23a', trend: 0 },
      { key: 'users', label: '总用户数', value: 0, icon: 'User', color: '#e6a23c', trend: 0 },
      { key: 'todayOrders', label: '今日订单', value: 0, icon: 'Document', color: '#f56c6c', trend: 0 },
    ];
  }

  return [
    {
      key: 'orders',
      label: '总订单数',
      value: overview.value.totalOrders,
      icon: 'ShoppingCart',
      color: '#409eff',
      trend: overview.value.orderGrowthRate,
    },
    {
      key: 'amount',
      label: '总销售额',
      value: formatMoney(overview.value.totalAmount),
      icon: 'Money',
      color: '#67c23a',
      trend: overview.value.amountGrowthRate,
    },
    {
      key: 'users',
      label: '总用户数',
      value: overview.value.totalUsers,
      icon: 'User',
      color: '#e6a23c',
      trend: 0,
    },
    {
      key: 'todayOrders',
      label: '今日订单',
      value: overview.value.todayOrders,
      icon: 'Document',
      color: '#f56c6c',
      trend: 0,
    },
  ];
});

const salesTrendOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'cross' },
  },
  legend: {
    data: ['订单数', '销售额'],
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: salesTrend.value.map((item) => item.date),
  },
  yAxis: [
    {
      type: 'value',
      name: '订单数',
      position: 'left',
    },
    {
      type: 'value',
      name: '销售额',
      position: 'right',
    },
  ],
  series: [
    {
      name: '订单数',
      type: 'line',
      smooth: true,
      data: salesTrend.value.map((item) => item.orderCount),
      itemStyle: { color: '#409eff' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' },
          ],
        },
      },
    },
    {
      name: '销售额',
      type: 'line',
      smooth: true,
      yAxisIndex: 1,
      data: salesTrend.value.map((item) => item.amount),
      itemStyle: { color: '#67c23a' },
    },
  ],
}));

const orderStatusOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)',
  },
  legend: {
    orient: 'vertical',
    left: 'left',
  },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: false,
        position: 'center',
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: false,
      },
      data: orderStatusData.value.map((item) => ({
        name: item.status,
        value: item.count,
      })),
    },
  ],
}));

const productRankOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'value',
  },
  yAxis: {
    type: 'category',
    data: productRank.value.map((item) => item.productName).reverse(),
  },
  series: [
    {
      type: 'bar',
      data: productRank.value.map((item) => item.salesAmount).reverse(),
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 1,
          y2: 0,
          colorStops: [
            { offset: 0, color: '#409eff' },
            { offset: 1, color: '#67c23a' },
          ],
        },
      },
    },
  ],
}));

const paymentOptions = computed<EChartsOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)',
  },
  legend: {
    bottom: '5%',
    left: 'center',
  },
  series: [
    {
      type: 'pie',
      radius: '50%',
      data: paymentData.value.map((item) => ({
        name: item.method,
        value: item.count,
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
  ],
}));

function handleDateChange(value: string[] | null): void {
  if (value) {
    filterForm.startDate = value[0];
    filterForm.endDate = value[1];
  } else {
    filterForm.startDate = '';
    filterForm.endDate = '';
  }
}

function handleReset(): void {
  dateRange.value = [];
  filterForm.startDate = '';
  filterForm.endDate = '';
  fetchDashboardData();
}

async function fetchDashboardData(): Promise<void> {
  try {
    const endDate = filterForm.endDate || new Date().toISOString().split('T')[0];
    const startDate = filterForm.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [overviewData, trendData, productData, userData, statusData, payment] = await Promise.all([
      statisticsApi.getOverview(),
      statisticsApi.getSalesTrend({ startDate, endDate, type: trendType.value }),
      statisticsApi.getProductSalesRank(10),
      statisticsApi.getUserConsumptionRank(10),
      statisticsApi.getOrderStatusDistribution(),
      statisticsApi.getPaymentDistribution(),
    ]);

    overview.value = overviewData;
    salesTrend.value = trendData;
    productRank.value = productData;
    userRankList.value = userData;
    orderStatusData.value = statusData;
    paymentData.value = payment;
  } catch (error) {
    console.error('获取统计数据失败:', error);
  }
}

function handleTrendTypeChange(): void {
  fetchDashboardData();
}

function handleExportUserRank(): void {
  const csvContent = '\uFEFF排名,用户名,订单数量,消费总额\n' + userRankList.value.map((row) => `${row.rank},${row.username},${row.orderCount},${row.totalAmount}`).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `用户消费排行_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

onMounted(() => {
  const end = new Date();
  const start = new Date();
  start.setTime(start.getTime() - 30 * 24 * 60 * 60 * 1000);
  dateRange.value = [start.toISOString().split('T')[0], end.toISOString().split('T')[0]];
  filterForm.startDate = dateRange.value[0];
  filterForm.endDate = dateRange.value[1];

  fetchDashboardData();
});
</script>

<style scoped lang="scss">
.statistics-dashboard {
  .filter-section {
    background: #fff;
    padding: 15px 20px;
    border-radius: 4px;
    margin-bottom: 20px;
  }

  .stats-cards {
    margin-bottom: 20px;

    .stats-card {
      .card-content {
        display: flex;
        align-items: center;

        .card-icon {
          width: 56px;
          height: 56px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }

        .card-info {
          margin-left: 16px;

          .card-value {
            font-size: 24px;
            font-weight: 600;
            color: var(--text-primary);
          }

          .card-label {
            font-size: 14px;
            color: var(--text-secondary);
            margin-top: 4px;
          }
        }
      }

      .card-footer {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--border-color-light);
        display: flex;
        align-items: center;
        font-size: 12px;

        .up {
          color: var(--success-color);
        }

        .down {
          color: var(--danger-color);
        }

        .compare {
          margin-left: 8px;
          color: var(--text-secondary);
        }
      }
    }
  }

  .chart-row {
    margin-bottom: 20px;

    .chart-card {
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .chart-title {
        font-size: 16px;
        font-weight: 600;
      }
    }
  }

  .amount {
    color: var(--danger-color);
    font-weight: 600;
  }
}
</style>
