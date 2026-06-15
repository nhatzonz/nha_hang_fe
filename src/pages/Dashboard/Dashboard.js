import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { toast } from 'sonner';
import Layout from '../../components/common/Layout';
import Header from '../../components/common/Header';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import { statisticsService } from '../../services/statisticsService';
import { orderService, ORDER_STATUS_LABELS } from '../../services/orderService';
import { reservationService, RESERVATION_STATUS_LABELS } from '../../services/reservationService';
import { tableService } from '../../services/tableService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, assetUrl } from '../../utils/format';
import styles from './Dashboard.module.scss';

const CATEGORY_COLORS = ['#c0392b', '#e67e22', '#27ae60', '#3498db', '#8e44ad', '#f39c12', '#16a085', '#e74c3c'];

const OCCUPANCY_CONFIG = [
  { key: 'available', label: 'Trống', color: '#1f9d61' },
  { key: 'occupied', label: 'Có khách', color: '#c0392b' },
  { key: 'reserved', label: 'Đã đặt', color: '#2f72c4' },
];

// ===== Inline icons (chỉ trang trí) =====
const ICONS = {
  revenue: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  orders: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  avg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  retention: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  create: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  reserve: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  dish: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  report: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  arrow: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
};

const orderBadgeClass = {
  pending: styles.badgePending,
  preparing: styles.badgePreparing,
  served: styles.badgeServed,
  completed: styles.badgeCompleted,
  cancelled: styles.badgeCancelled,
};

const resBadgeClass = {
  pending: styles.resPending,
  confirmed: styles.resConfirmed,
  cancelled: styles.resCancelled,
  completed: styles.resCompleted,
};

const formatCompact = (value) => {
  const n = Number(value);
  if (!n) return '0';
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
};

const formatBucket = (bucket) => {
  if (!bucket) return '';
  if (bucket.length === 10) {
    const [, m, d] = bucket.split('-');
    return `${d}/${m}`;
  }
  const [y, m] = bucket.split('-');
  return `T${parseInt(m, 10)}/${y}`;
};

const formatChange = (change) => {
  if (change === 0) return '0%';
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);

  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState({});

  // ===== Dữ liệu vận hành (không phụ thuộc khoảng thời gian) =====
  const [recentOrders, setRecentOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [todayReservations, setTodayReservations] = useState([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const groupBy = period === 'year' ? 'month' : 'day';
      const [ov, rev, top, cat, os] = await Promise.all([
        statisticsService.overview({ period }),
        statisticsService.revenue({ period, groupBy }),
        statisticsService.topItems({ period, limit: 5 }),
        statisticsService.revenueByCategory({ period }),
        statisticsService.ordersByStatus(),
      ]);
      setOverview(ov.data);
      setRevenue(rev.data.data);
      setTopItems(top.data);
      setByCategory(cat.data);
      setOrdersByStatus(os.data);
    } catch (err) {
      toast.error('Không tải được thống kê');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Ngày hôm nay (YYYY-MM-DD) theo giờ địa phương
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const fetchOperational = useCallback(async () => {
    try {
      const [ord, tbl, res] = await Promise.all([
        orderService.list({ page: 1, limit: 6 }),
        tableService.list({}),
        reservationService.list({ from_date: todayStr, to_date: todayStr, limit: 6 }),
      ]);
      setRecentOrders(ord.data?.data || []);
      setTables(Array.isArray(tbl.data) ? tbl.data : []);
      setTodayReservations(res.data?.data || []);
    } catch (err) {
      // Im lặng — các widget vận hành sẽ hiển thị trạng thái rỗng
    }
  }, [todayStr]);

  useEffect(() => { fetchOperational(); }, [fetchOperational]);

  // ===== Lời chào theo thời điểm =====
  const hour = now.getHours();
  const greeting = hour < 11 ? 'Chào buổi sáng' : hour < 14 ? 'Chào buổi trưa' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  const firstName = user?.full_name?.trim().split(/\s+/).slice(-1)[0] || 'bạn';
  const weekdays = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dateLabel = `${weekdays[now.getDay()]}, ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

  const periodLabel = {
    today: 'hôm qua',
    week: 'tuần trước',
    month: 'tháng trước',
    year: 'năm trước',
  }[period];

  const kpiCards = overview ? [
    {
      label: 'Tổng doanh thu',
      value: formatCurrency(overview.revenue.value),
      change: overview.revenue.change,
      icon: ICONS.revenue,
      tone: styles.tonePrimary,
    },
    {
      label: 'Đơn hoàn thành',
      value: overview.orders.value.toLocaleString('vi-VN'),
      change: overview.orders.change,
      icon: ICONS.orders,
      tone: styles.toneBlue,
    },
    {
      label: 'Giá trị TB / đơn',
      value: formatCurrency(overview.avgOrderValue.value),
      change: overview.avgOrderValue.change,
      icon: ICONS.avg,
      tone: styles.toneAmber,
    },
    {
      label: 'Tỉ lệ khách quay lại',
      value: `${overview.retention.rate.toFixed(1)}%`,
      hint: `${overview.retention.repeat_customers}/${overview.retention.total_customers} khách`,
      icon: ICONS.retention,
      tone: styles.toneGreen,
    },
  ] : [];

  const quickActions = [
    { label: 'Tạo đơn', desc: 'Đơn hàng mới', icon: ICONS.create, to: '/orders/create' },
    { label: 'Đặt bàn', desc: 'Lịch đặt bàn', icon: ICONS.reserve, to: '/reservations' },
    { label: 'Thêm món', desc: 'Quản lý thực đơn', icon: ICONS.dish, to: '/menu' },
    { label: 'Báo cáo', desc: 'Phân tích chi tiết', icon: ICONS.report, to: '/reports' },
  ];

  // ===== Trạng thái bàn =====
  const tableStats = tables.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});
  const occupancyData = OCCUPANCY_CONFIG
    .map((c) => ({ name: c.label, value: tableStats[c.key] || 0, color: c.color }))
    .filter((d) => d.value > 0);
  const tableTotal = tables.length;

  return (
    <Layout>
      <div className={styles.dashboardHeader}>
        <Header title={`${greeting}, ${firstName} 👋`} subtitle={dateLabel} />
        <DateRangeFilter value={period} onChange={setPeriod} />
      </div>

      {/* Truy cập nhanh */}
      <div className={styles.quickActions}>
        {quickActions.map((q) => (
          <button key={q.to} className={styles.quickBtn} onClick={() => navigate(q.to)}>
            <span className={styles.quickIcon}>{q.icon}</span>
            <span className={styles.quickText}>
              <strong>{q.label}</strong>
              <span>{q.desc}</span>
            </span>
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {loading && !overview ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`${styles.kpiCard} ${styles.skeleton}`} />
          ))
        ) : (
          kpiCards.map((kpi, i) => (
            <div key={i} className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>{kpi.label}</span>
                <span className={`${styles.kpiIcon} ${kpi.tone}`}>{kpi.icon}</span>
              </div>
              <div className={styles.kpiValue}>{kpi.value}</div>
              {kpi.hint ? (
                <div className={styles.kpiHint}>{kpi.hint}</div>
              ) : (
                <div
                  className={`${styles.kpiChange} ${kpi.change > 0 ? styles.changePos : kpi.change < 0 ? styles.changeNeg : ''}`}
                >
                  {formatChange(kpi.change)} so với {periodLabel}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Doanh thu + Trạng thái bàn */}
      <div className={styles.contentGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Biến động doanh thu</h3>
              <p className={styles.cardDesc}>
                {period === 'today' && 'Hôm nay'}
                {period === 'week' && '7 ngày gần đây'}
                {period === 'month' && '30 ngày gần đây'}
                {period === 'year' && '12 tháng gần đây'}
              </p>
            </div>
          </div>

          {revenue.length === 0 ? (
            <div className={styles.chartEmpty}>Chưa có dữ liệu</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c0392b" stopOpacity={1} />
                    <stop offset="100%" stopColor="#e67e22" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe0" vertical={false} />
                <XAxis
                  dataKey="bucket"
                  tickFormatter={formatBucket}
                  stroke="#a39a8c"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#a39a8c"
                  fontSize={11}
                  tickFormatter={formatCompact}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(192,57,43,0.05)' }}
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e8e1d3',
                    borderRadius: 12,
                    fontSize: 13,
                  }}
                  formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                  labelFormatter={formatBucket}
                />
                <Bar dataKey="revenue" fill="url(#revenueGradient)" radius={[6, 6, 2, 2]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Trạng thái bàn */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Trạng thái bàn</h3>
              <p className={styles.cardDesc}>Tổng {tableTotal} bàn</p>
            </div>
            <button className={styles.linkBtn} onClick={() => navigate('/tables')}>
              Xem tất cả {ICONS.arrow}
            </button>
          </div>

          {tableTotal === 0 ? (
            <div className={styles.chartEmpty}>Chưa có bàn nào</div>
          ) : (
            <div className={styles.occupancyWrap}>
              <div className={styles.occupancyChart}>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie
                      data={occupancyData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={75}
                      paddingAngle={2}
                    >
                      {occupancyData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #e8e1d3', borderRadius: 12, fontSize: 13 }}
                      formatter={(value, name) => [`${value} bàn`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.occupancyCenter}>
                  <strong>{tableTotal}</strong>
                  <span>bàn</span>
                </div>
              </div>
              <div className={styles.occupancyLegend}>
                {OCCUPANCY_CONFIG.map((c) => (
                  <div key={c.key} className={styles.legendRow}>
                    <span className={styles.legendDot} style={{ background: c.color }} />
                    <span className={styles.legendLabel}>{c.label}</span>
                    <strong>{tableStats[c.key] || 0}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Đơn gần đây + Đặt bàn hôm nay */}
      <div className={styles.ordersGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Đơn hàng gần đây</h3>
            <button className={styles.linkBtn} onClick={() => navigate('/orders')}>
              Tất cả {ICONS.arrow}
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className={styles.chartEmpty}>Chưa có đơn hàng nào</div>
          ) : (
            <div className={styles.miniTable}>
              <div className={`${styles.miniRow} ${styles.miniHead}`}>
                <span>Mã đơn</span>
                <span>Bàn</span>
                <span className={styles.alignRight}>Thành tiền</span>
                <span>Trạng thái</span>
              </div>
              {recentOrders.map((o) => (
                <div
                  key={o.id}
                  className={styles.miniRow}
                  onClick={() => navigate(`/orders/${o.id}`)}
                >
                  <span className={styles.orderCode}>{o.order_code}</span>
                  <span className={styles.muted}>{o.table?.name || '—'}</span>
                  <span className={styles.alignRight} style={{ fontWeight: 700, color: '#c0392b' }}>
                    {formatCurrency(o.final_amount)}
                  </span>
                  <span>
                    <span className={`${styles.badge} ${orderBadgeClass[o.status]}`}>
                      {ORDER_STATUS_LABELS[o.status]}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Đặt bàn hôm nay */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Đặt bàn hôm nay</h3>
            <button className={styles.linkBtn} onClick={() => navigate('/reservations')}>
              Tất cả {ICONS.arrow}
            </button>
          </div>

          {todayReservations.length === 0 ? (
            <div className={styles.chartEmpty}>Hôm nay chưa có lịch đặt bàn</div>
          ) : (
            <div className={styles.resList}>
              {todayReservations.map((r) => (
                <div key={r.id} className={styles.resItem}>
                  <div className={styles.resTime}>
                    {ICONS.clock}
                    <span>{r.reservation_time?.slice(0, 5) || '--:--'}</span>
                  </div>
                  <div className={styles.resInfo}>
                    <strong>{r.customer_name}</strong>
                    <span>
                      {r.guest_count} khách
                      {r.table?.name ? ` · ${r.table.name}` : ''}
                    </span>
                  </div>
                  <span className={`${styles.badge} ${resBadgeClass[r.status]}`}>
                    {RESERVATION_STATUS_LABELS[r.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Món bán chạy + Doanh thu danh mục + Chỉ số */}
      <div className={styles.bottomGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Món bán chạy</h3>
          </div>
          {topItems.length === 0 ? (
            <div className={styles.chartEmpty}>Chưa có dữ liệu</div>
          ) : (
            <div className={styles.trendingList}>
              {topItems.map((item, idx) => (
                <div key={item.id} className={styles.trendingItem}>
                  <span className={styles.trendingRank}>{idx + 1}</span>
                  <div className={styles.trendingImg}>
                    {item.image ? (
                      <img src={assetUrl(item.image)} alt={item.name} />
                    ) : (
                      <span>🍽</span>
                    )}
                  </div>
                  <div className={styles.trendingInfo}>
                    <span className={styles.trendingName}>{item.name}</span>
                    <span className={styles.trendingOrders}>{item.quantity} đã bán</span>
                  </div>
                  <span className={styles.trendingPrice}>{formatCurrency(item.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Doanh thu theo danh mục</h3>
          </div>
          {byCategory.length === 0 ? (
            <div className={styles.chartEmpty}>Chưa có dữ liệu</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={82}
                  paddingAngle={2}
                >
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e8e1d3', borderRadius: 12, fontSize: 13 }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Chỉ số khách & đơn</h3>
          </div>

          {overview && (
            <div className={styles.metricsList}>
              <div className={styles.metricRow}>
                <span>Tỷ lệ khách quay lại</span>
                <strong style={{ color: '#1f9d61' }}>{overview.retention.rate.toFixed(1)}%</strong>
              </div>
              <div className={styles.metricSub}>
                {overview.retention.repeat_customers}/{overview.retention.total_customers} khách quay lại từ 2 lần trở lên
              </div>

              <div className={styles.divider} />

              <div className={styles.metricRow}>
                <span>Đơn đã hoàn thành</span>
                <strong style={{ color: '#1f9d61' }}>{ordersByStatus.completed || 0}</strong>
              </div>
              <div className={styles.metricRow}>
                <span>Đơn đã huỷ</span>
                <strong style={{ color: '#d64545' }}>{ordersByStatus.cancelled || 0}</strong>
              </div>
              <div className={styles.metricRow}>
                <span>Đơn đang xử lý</span>
                <strong style={{ color: '#2f72c4' }}>
                  {(ordersByStatus.pending || 0) + (ordersByStatus.preparing || 0) + (ordersByStatus.served || 0)}
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
