import React, { useCallback, useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { toast } from 'sonner';
import Layout from '../../components/common/Layout';
import Header from '../../components/common/Header';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import { statisticsService } from '../../services/statisticsService';
import { formatCurrency, assetUrl } from '../../utils/format';
import styles from './Dashboard.module.scss';

const CATEGORY_COLORS = ['#c0392b', '#e67e22', '#27ae60', '#3498db', '#8e44ad', '#f39c12', '#16a085', '#e74c3c'];

const formatCompact = (value) => {
  const n = Number(value);
  if (!n) return '0';
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
};

const formatBucket = (bucket) => {
  // "2026-04-17" -> "17/04"
  if (!bucket) return '';
  if (bucket.length === 10) {
    const [, m, d] = bucket.split('-');
    return `${d}/${m}`;
  }
  // month: "2026-04" -> "T4/2026"
  const [y, m] = bucket.split('-');
  return `T${parseInt(m, 10)}/${y}`;
};

const formatChange = (change) => {
  if (change === 0) return '0%';
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
};

const Dashboard = () => {
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);

  const [overview, setOverview] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState({});

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

  const kpiCards = overview ? [
    {
      label: 'Tổng doanh thu',
      value: formatCurrency(overview.revenue.value),
      change: overview.revenue.change,
    },
    {
      label: 'Số đơn hoàn thành',
      value: overview.orders.value.toLocaleString('vi-VN'),
      change: overview.orders.change,
    },
    {
      label: 'Giá trị đơn trung bình',
      value: formatCurrency(overview.avgOrderValue.value),
      change: overview.avgOrderValue.change,
    },
  ] : [];

  const periodLabel = {
    today: 'hôm qua',
    week: 'tuần trước',
    month: 'tháng trước',
    year: 'năm trước',
  }[period];

  return (
    <Layout>
      <div className={styles.dashboardHeader}>
        <Header title="Tổng quan quản lý" />
        <DateRangeFilter value={period} onChange={setPeriod} />
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        {loading && !overview ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`${styles.kpiCard} ${styles.skeleton}`} />
          ))
        ) : (
          kpiCards.map((kpi, i) => (
            <div key={i} className={styles.kpiCard}>
              <span className={styles.kpiLabel}>{kpi.label}</span>
              <div className={styles.kpiValue}>{kpi.value}</div>
              <div
                className={`${styles.kpiChange} ${kpi.change > 0 ? styles.changePos : kpi.change < 0 ? styles.changeNeg : ''}`}
              >
                {formatChange(kpi.change)} so với {periodLabel}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Content grid */}
      <div className={styles.contentGrid}>
        {/* Revenue Chart */}
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
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="bucket"
                  tickFormatter={formatBucket}
                  stroke="#999"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#999"
                  fontSize={11}
                  tickFormatter={formatCompact}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #eee',
                    borderRadius: 8,
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

        {/* Top items */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Món bán chạy</h3>
          </div>
          {topItems.length === 0 ? (
            <div className={styles.chartEmpty}>Chưa có dữ liệu</div>
          ) : (
            <div className={styles.trendingList}>
              {topItems.map((item) => (
                <div key={item.id} className={styles.trendingItem}>
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
      </div>

      {/* Bottom grid */}
      <div className={styles.bottomGrid}>
        {/* Revenue by category */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Doanh thu theo danh mục</h3>
          </div>
          {byCategory.length === 0 ? (
            <div className={styles.chartEmpty}>Chưa có dữ liệu</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, fontSize: 13 }}
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

        {/* Retention + Orders by status */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Chỉ số khách hàng & đơn hàng</h3>
          </div>

          {overview && (
            <div className={styles.metricsList}>
              <div className={styles.metricRow}>
                <span>Tỷ lệ khách quay lại</span>
                <strong style={{ color: '#27ae60' }}>{overview.retention.rate.toFixed(1)}%</strong>
              </div>
              <div className={styles.metricSub}>
                {overview.retention.repeat_customers}/{overview.retention.total_customers} khách quay lại từ 2 lần trở lên
              </div>

              <div className={styles.divider} />

              <div className={styles.metricRow}>
                <span>Đơn đã hoàn thành</span>
                <strong style={{ color: '#27ae60' }}>{ordersByStatus.completed || 0}</strong>
              </div>
              <div className={styles.metricRow}>
                <span>Đơn đã huỷ</span>
                <strong style={{ color: '#e74c3c' }}>{ordersByStatus.cancelled || 0}</strong>
              </div>
              <div className={styles.metricRow}>
                <span>Đơn đang xử lý</span>
                <strong style={{ color: '#3498db' }}>
                  {(ordersByStatus.pending || 0) + (ordersByStatus.preparing || 0) + (ordersByStatus.served || 0)}
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className={styles.pageFooter}>
        <span>© 2026 Hải Sản Biển Đông — Hệ thống quản lý nhà hàng</span>
      </footer>
    </Layout>
  );
};

export default Dashboard;
