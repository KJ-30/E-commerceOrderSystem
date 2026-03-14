import type { LoginParams, LoginResult, UserInfo, UserListItem, PaginatedResponse } from '@/types/user.d';
import type { OrderListItem, OrderDetail, OrderStatistics, PaginatedResponse as OrderPaginatedResponse, OrderQueryParams } from '@/types/order.d';
import type { StatisticsOverview, SalesTrendPoint, ProductSalesRank, UserConsumptionRank } from '@/types/statistics.d';
import { ROLE_PERMISSIONS, UserRole } from '@/types/user.d';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockUsers: UserInfo[] = [
  {
    id: 1,
    username: 'admin',
    nickname: '管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    avatar: '',
    role: UserRole.ADMIN,
    status: 1,
    department: '技术部',
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-01 10:00:00',
  },
  {
    id: 2,
    username: 'manager',
    nickname: '张经理',
    email: 'manager@example.com',
    phone: '13800138001',
    avatar: '',
    role: UserRole.MANAGER,
    status: 1,
    department: '销售部',
    createdAt: '2024-01-02 10:00:00',
    updatedAt: '2024-01-02 10:00:00',
  },
  {
    id: 3,
    username: 'operator',
    nickname: '李操作',
    email: 'operator@example.com',
    phone: '13800138002',
    avatar: '',
    role: UserRole.OPERATOR,
    status: 1,
    department: '运营部',
    createdAt: '2024-01-03 10:00:00',
    updatedAt: '2024-01-03 10:00:00',
  },
  {
    id: 4,
    username: 'service',
    nickname: '王客服',
    email: 'service@example.com',
    phone: '13800138003',
    avatar: '',
    role: UserRole.SERVICE,
    status: 1,
    department: '客服部',
    createdAt: '2024-01-04 10:00:00',
    updatedAt: '2024-01-04 10:00:00',
  },
];

const mockOrders: OrderDetail[] = [
  {
    id: 1,
    orderNo: '20240101ABC12345',
    userId: 101,
    username: 'testuser1',
    status: 'delivered' as const,
    paymentMethod: 'alipay' as const,
    paymentTime: '2024-01-01 12:30:00',
    totalAmount: 599.0,
    discountAmount: 50.0,
    freightAmount: 10.0,
    actualAmount: 559.0,
    items: [
      {
        id: 1,
        productId: 1001,
        productName: 'iPhone 15 Pro 手机壳',
        productImage: 'https://picsum.photos/100/100?random=1',
        sku: 'SKU001',
        spec: '黑色 / 透明',
        quantity: 2,
        unitPrice: 49.0,
        totalPrice: 98.0,
      },
      {
        id: 2,
        productId: 1002,
        productName: '无线蓝牙耳机',
        productImage: 'https://picsum.photos/100/100?random=2',
        sku: 'SKU002',
        spec: '白色',
        quantity: 1,
        unitPrice: 299.0,
        totalPrice: 299.0,
      },
    ],
    shippingAddress: {
      receiverName: '张三',
      receiverPhone: '13900139000',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detailAddress: '科技园路100号A栋501室',
    },
    remark: '请尽快发货',
    createdAt: '2024-01-01 12:00:00',
    updatedAt: '2024-01-03 15:00:00',
  },
  {
    id: 2,
    orderNo: '20240102DEF67890',
    userId: 102,
    username: 'testuser2',
    status: 'paid' as const,
    paymentMethod: 'wechat' as const,
    paymentTime: '2024-01-02 14:20:00',
    totalAmount: 1299.0,
    discountAmount: 100.0,
    freightAmount: 0,
    actualAmount: 1199.0,
    items: [
      {
        id: 1,
        productId: 2001,
        productName: '机械键盘 RGB版',
        productImage: 'https://picsum.photos/100/100?random=3',
        sku: 'SKU003',
        spec: '青轴 / 黑色',
        quantity: 1,
        unitPrice: 599.0,
        totalPrice: 599.0,
      },
      {
        id: 2,
        productId: 2002,
        productName: '游戏鼠标',
        productImage: 'https://picsum.photos/100/100?random=4',
        sku: 'SKU004',
        spec: '黑色',
        quantity: 1,
        unitPrice: 299.0,
        totalPrice: 299.0,
      },
      {
        id: 3,
        productId: 2003,
        productName: '鼠标垫 XL',
        productImage: 'https://picsum.photos/100/100?random=5',
        sku: 'SKU005',
        spec: '黑色 / 900x400mm',
        quantity: 1,
        unitPrice: 99.0,
        totalPrice: 99.0,
      },
    ],
    shippingAddress: {
      receiverName: '李四',
      receiverPhone: '13900139001',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detailAddress: '建国路88号SOHO现代城B座1201',
    },
    remark: '',
    createdAt: '2024-01-02 14:00:00',
    updatedAt: '2024-01-02 14:20:00',
  },
  {
    id: 3,
    orderNo: '20240103GHI11111',
    userId: 103,
    username: 'testuser3',
    status: 'pending' as const,
    paymentMethod: 'alipay' as const,
    paymentTime: null,
    totalAmount: 199.0,
    discountAmount: 0,
    freightAmount: 10.0,
    actualAmount: 209.0,
    items: [
      {
        id: 1,
        productId: 3001,
        productName: '便携充电宝 20000mAh',
        productImage: 'https://picsum.photos/100/100?random=6',
        sku: 'SKU006',
        spec: '白色',
        quantity: 1,
        unitPrice: 199.0,
        totalPrice: 199.0,
      },
    ],
    shippingAddress: {
      receiverName: '王五',
      receiverPhone: '13900139002',
      province: '上海市',
      city: '上海市',
      district: '浦东新区',
      detailAddress: '张江高科技园区博云路2号',
    },
    remark: '需要发票',
    createdAt: '2024-01-03 09:30:00',
    updatedAt: '2024-01-03 09:30:00',
  },
];

export const mockApi = {
  async login(params: LoginParams): Promise<LoginResult> {
    await delay(500);

    const user = mockUsers.find((u) => u.username === params.username);
    if (!user || params.password !== '123456') {
      throw new Error('用户名或密码错误');
    }

    const roleConfig = ROLE_PERMISSIONS[user.role];

    return {
      token: 'mock-token-' + user.role + '-' + Date.now(),
      userInfo: user,
      permissions: roleConfig?.permissions || ['*'],
    };
  },

  async logout(): Promise<void> {
    await delay(200);
  },

  async getCurrentUser(): Promise<UserInfo> {
    await delay(200);
    return mockUsers[0];
  },

  async getUserList(params: { page: number; pageSize: number }): Promise<PaginatedResponse<UserListItem>> {
    await delay(300);

    const start = (params.page - 1) * params.pageSize;
    const list = mockUsers.slice(start, start + params.pageSize).map((user) => ({
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      department: user.department,
      createdAt: user.createdAt,
    }));

    return {
      list,
      total: mockUsers.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  },

  async getOrderList(params: OrderQueryParams): Promise<OrderPaginatedResponse<OrderListItem>> {
    await delay(300);

    const list = mockOrders.map((order) => ({
      id: order.id,
      orderNo: order.orderNo,
      username: order.username,
      status: order.status,
      totalAmount: order.totalAmount,
      actualAmount: order.actualAmount,
      itemCount: order.items.length,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
    }));

    return {
      list,
      total: mockOrders.length,
      page: params.page,
      pageSize: params.pageSize,
    };
  },

  async getOrderDetail(id: number): Promise<OrderDetail> {
    await delay(200);
    const order = mockOrders.find((o) => o.id === id);
    if (!order) {
      throw new Error('订单不存在');
    }
    return order;
  },

  async getOrderStatistics(): Promise<OrderStatistics> {
    await delay(200);
    return {
      totalOrders: 1256,
      totalAmount: 256890.5,
      pendingOrders: 23,
      todayOrders: 45,
      todayAmount: 12580.0,
    };
  },

  async getOverview(): Promise<StatisticsOverview> {
    await delay(300);
    return {
      totalOrders: 12568,
      totalAmount: 2568900.5,
      totalUsers: 3568,
      todayOrders: 156,
      todayAmount: 45680.0,
      todayNewUsers: 28,
      orderGrowthRate: 12.5,
      amountGrowthRate: 8.3,
    };
  },

  async getSalesTrend(): Promise<SalesTrendPoint[]> {
    await delay(300);
    const data: SalesTrendPoint[] = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        orderCount: Math.floor(Math.random() * 100) + 50,
        amount: Math.floor(Math.random() * 10000) + 5000,
      });
    }
    return data;
  },

  async getProductSalesRank(): Promise<ProductSalesRank[]> {
    await delay(300);
    return [
      { rank: 1, productId: 1, productName: 'iPhone 15 Pro', productImage: '', salesCount: 256, salesAmount: 256000 },
      { rank: 2, productId: 2, productName: 'MacBook Air M3', productImage: '', salesCount: 128, salesAmount: 153600 },
      { rank: 3, productId: 3, productName: 'AirPods Pro 2', productImage: '', salesCount: 512, salesAmount: 102400 },
      { rank: 4, productId: 4, productName: 'iPad Pro 12.9', productImage: '', salesCount: 64, salesAmount: 64000 },
      { rank: 5, productId: 5, productName: 'Apple Watch S9', productImage: '', salesCount: 128, salesAmount: 51200 },
      { rank: 6, productId: 6, productName: 'Magic Keyboard', productImage: '', salesCount: 96, salesAmount: 28800 },
      { rank: 7, productId: 7, productName: 'Studio Display', productImage: '', salesCount: 32, salesAmount: 48000 },
      { rank: 8, productId: 8, productName: 'HomePod', productImage: '', salesCount: 64, salesAmount: 19200 },
      { rank: 9, productId: 9, productName: 'AirTag 4件装', productImage: '', salesCount: 256, salesAmount: 25600 },
      { rank: 10, productId: 10, productName: 'MagSafe充电器', productImage: '', salesCount: 128, salesAmount: 5120 },
    ];
  },

  async getUserConsumptionRank(): Promise<UserConsumptionRank[]> {
    await delay(300);
    return [
      { rank: 1, userId: 1, username: 'vip_user_001', orderCount: 56, totalAmount: 125600 },
      { rank: 2, userId: 2, username: 'vip_user_002', orderCount: 48, totalAmount: 98500 },
      { rank: 3, userId: 3, username: 'vip_user_003', orderCount: 42, totalAmount: 86400 },
      { rank: 4, userId: 4, username: 'vip_user_004', orderCount: 38, totalAmount: 72100 },
      { rank: 5, userId: 5, username: 'vip_user_005', orderCount: 35, totalAmount: 65800 },
      { rank: 6, userId: 6, username: 'vip_user_006', orderCount: 32, totalAmount: 58900 },
      { rank: 7, userId: 7, username: 'vip_user_007', orderCount: 28, totalAmount: 52600 },
      { rank: 8, userId: 8, username: 'vip_user_008', orderCount: 25, totalAmount: 48200 },
      { rank: 9, userId: 9, username: 'vip_user_009', orderCount: 22, totalAmount: 42500 },
      { rank: 10, userId: 10, username: 'vip_user_010', orderCount: 20, totalAmount: 38900 },
    ];
  },

  async getOrderStatusDistribution(): Promise<Array<{ status: string; count: number; percentage: number }>> {
    await delay(200);
    return [
      { status: '待支付', count: 23, percentage: 8.5 },
      { status: '已支付', count: 45, percentage: 16.6 },
      { status: '已发货', count: 68, percentage: 25.1 },
      { status: '已完成', count: 125, percentage: 46.1 },
      { status: '已取消', count: 8, percentage: 3.0 },
      { status: '已退款', count: 2, percentage: 0.7 },
    ];
  },

  async getPaymentDistribution(): Promise<Array<{ method: string; count: number; percentage: number }>> {
    await delay(200);
    return [
      { method: '支付宝', count: 156, percentage: 45.6 },
      { method: '微信支付', count: 128, percentage: 37.4 },
      { method: '银行卡', count: 42, percentage: 12.3 },
      { method: '信用支付', count: 16, percentage: 4.7 },
    ];
  },
};

export default mockApi;
