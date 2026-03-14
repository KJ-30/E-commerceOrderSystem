<template>
  <div class="order-list">
    <search-form v-model="searchForm" @search="handleSearch" @reset="handleReset">
      <el-form-item label="订单号" prop="orderNo">
        <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
      </el-form-item>
      <el-form-item label="订单状态" prop="status">
        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="支付方式" prop="paymentMethod">
        <el-select v-model="searchForm.paymentMethod" placeholder="请选择支付方式" clearable>
          <el-option v-for="item in paymentOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="下单时间" prop="dateRange">
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" @change="handleDateChange" />
      </el-form-item>
    </search-form>

    <div class="table-wrapper">
      <div class="table-header">
        <h3 class="table-title">订单列表</h3>
        <div class="table-actions">
          <el-button v-if="hasPermission('order:delete')" type="danger" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>批量删除
          </el-button>
          <el-button v-if="hasPermission('order:export')" type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>导出Excel
          </el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="orderList" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="orderNo" label="订单号" min-width="180" show-overflow-tooltip />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="status" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="订单金额" width="120">
          <template #default="{ row }">
            {{ formatMoney(row.totalAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="actualAmount" label="实付金额" width="120">
          <template #default="{ row }">
            <span class="amount">{{ formatMoney(row.actualAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="itemCount" label="商品数量" width="100" />
        <el-table-column prop="paymentMethod" label="支付方式" width="100">
          <template #default="{ row }">
            {{ getPaymentText(row.paymentMethod) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">
              <el-icon><View /></el-icon>详情
            </el-button>
            <el-button v-if="hasPermission('order:edit') && row.status === 'pending'" type="warning" link @click="handleCancel(row)"> 取消 </el-button>
            <el-button v-if="hasPermission('order:edit') && row.status === 'paid'" type="success" link @click="handleShip(row)"> 发货 </el-button>
            <el-button v-if="hasPermission('order:delete') && canDeleteOrder(row.status)" type="danger" link @click="handleDelete(row)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-model:page="pagination.page" v-model:limit="pagination.pageSize" :total="pagination.total" @pagination="handlePagination" />
    </div>

    <ship-dialog v-model="shipDialogVisible" :order-id="currentOrderId" @success="handleShipSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Download, View, Delete } from '@element-plus/icons-vue';
import { SearchForm, Pagination } from '@/components';
import { useOrderStore } from '@/store';
import { useAuth } from '@/hooks';
import { formatDateTime, formatMoney, getOrderStatusText, getOrderStatusColor, getPaymentMethodText } from '@/utils';
import type { OrderListItem, OrderStatus, PaymentMethod } from '@/types/order.d';
import ShipDialog from './components/ShipDialog.vue';

const router = useRouter();
const orderStore = useOrderStore();
const { hasPermission } = useAuth();

const loading = ref(false);
const orderList = ref<OrderListItem[]>([]);
const selectedRows = ref<OrderListItem[]>([]);
const shipDialogVisible = ref(false);
const currentOrderId = ref<number>(0);
const dateRange = ref<string[]>([]);

const searchForm = reactive({
  orderNo: '',
  username: '',
  status: '' as OrderStatus | '',
  paymentMethod: '' as PaymentMethod | '',
  startDate: '',
  endDate: '',
});

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

const statusOptions = [
  { label: '待支付', value: 'pending' },
  { label: '已支付', value: 'paid' },
  { label: '已发货', value: 'shipped' },
  { label: '已完成', value: 'delivered' },
  { label: '已取消', value: 'cancelled' },
  { label: '已退款', value: 'refunded' },
];

const paymentOptions = [
  { label: '支付宝', value: 'alipay' },
  { label: '微信支付', value: 'wechat' },
  { label: '银行卡', value: 'bank_card' },
  { label: '信用支付', value: 'credit' },
];

function getStatusText(status: OrderStatus): string {
  return getOrderStatusText(status);
}

function getStatusColor(status: OrderStatus): string {
  return getOrderStatusColor(status);
}

function getPaymentText(method: PaymentMethod): string {
  return getPaymentMethodText(method);
}

function canDeleteOrder(status: OrderStatus): boolean {
  return status === 'cancelled' || status === 'refunded';
}

function handleDateChange(value: string[] | null): void {
  if (value) {
    searchForm.startDate = value[0];
    searchForm.endDate = value[1];
  } else {
    searchForm.startDate = '';
    searchForm.endDate = '';
  }
}

async function fetchOrderList(): Promise<void> {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm,
    };
    const result = await orderStore.fetchOrderList(params);
    orderList.value = result.list;
    pagination.total = result.total;
  } finally {
    loading.value = false;
  }
}

function handleSearch(): void {
  pagination.page = 1;
  fetchOrderList();
}

function handleReset(): void {
  dateRange.value = [];
  Object.assign(searchForm, {
    orderNo: '',
    username: '',
    status: '',
    paymentMethod: '',
    startDate: '',
    endDate: '',
  });
  handleSearch();
}

function handlePagination(page: number, pageSize: number): void {
  pagination.page = page;
  pagination.pageSize = pageSize;
  fetchOrderList();
}

function handleSelectionChange(rows: OrderListItem[]): void {
  selectedRows.value = rows;
}

function handleView(row: OrderListItem): void {
  router.push(`/order/detail/${row.id}`);
}

async function handleCancel(row: OrderListItem): Promise<void> {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await orderStore.cancelOrder(row.id, '管理员取消');
    ElMessage.success('订单已取消');
    fetchOrderList();
  } catch {
    // 用户取消
  }
}

function handleShip(row: OrderListItem): void {
  currentOrderId.value = row.id;
  shipDialogVisible.value = true;
}

function handleShipSuccess(): void {
  fetchOrderList();
}

async function handleDelete(row: OrderListItem): Promise<void> {
  try {
    await ElMessageBox.confirm('确定要删除该订单吗？删除后无法恢复。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await orderStore.deleteOrder(row.id);
    ElMessage.success('订单已删除');
    fetchOrderList();
  } catch {
    // 用户取消
  }
}

async function handleBatchDelete(): Promise<void> {
  const deletableRows = selectedRows.value.filter((row) => canDeleteOrder(row.status));

  if (deletableRows.length === 0) {
    ElMessage.warning('所选订单中没有可删除的订单（仅已取消或已退款的订单可删除）');
    return;
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${deletableRows.length} 条订单吗？删除后无法恢复。`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const ids = deletableRows.map((row) => row.id);
    await orderStore.batchDeleteOrders(ids);
    ElMessage.success(`成功删除 ${deletableRows.length} 条订单`);
    fetchOrderList();
  } catch {
    // 用户取消
  }
}

async function handleExport(): Promise<void> {
  try {
    ElMessage.info('正在导出数据...');

    const exportData = orderList.value.map((row) => ({
      订单号: row.orderNo,
      用户名: row.username,
      订单状态: getStatusText(row.status),
      订单金额: row.totalAmount,
      实付金额: row.actualAmount,
      商品数量: row.itemCount,
      支付方式: getPaymentText(row.paymentMethod),
      下单时间: formatDateTime(row.createdAt),
    }));

    const headers = Object.keys(exportData[0] || {});
    let csvContent = '\uFEFF';
    csvContent += headers.join(',') + '\n';

    exportData.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header as keyof typeof row];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      });
      csvContent += values.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `订单列表_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    ElMessage.success('导出成功');
  } catch (error) {
    ElMessage.error('导出失败');
  }
}

onMounted(() => {
  fetchOrderList();
});
</script>

<style scoped lang="scss">
.order-list {
  .table-wrapper {
    background: #fff;
    border-radius: 4px;
    padding: 20px;

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .table-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
      }

      .table-actions {
        display: flex;
        gap: 10px;
      }
    }

    .amount {
      color: var(--danger-color);
      font-weight: 600;
    }
  }
}
</style>
