import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../../components/common/Layout';
import Header from '../../components/common/Header';
import Modal from '../../components/common/Modal';
import { orderService, ORDER_STATUS_LABELS } from '../../services/orderService';
import { formatCurrency, formatRelativeTime, formatDateTime } from '../../utils/format';
import styles from './Order.module.scss';

const statusClass = {
  pending: styles.badgePending,
  preparing: styles.badgePreparing,
  served: styles.badgeServed,
  completed: styles.badgeCompleted,
  cancelled: styles.badgeCancelled,
};

const DATE_PRESETS = [
  { key: 'today', label: 'Hôm nay' },
  { key: '7d', label: '7 ngày' },
  { key: '30d', label: '30 ngày' },
  { key: 'all', label: 'Tất cả' },
];

const getFromDate = (preset) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (preset === 'today') return startOfToday.toISOString();
  if (preset === '7d') {
    const d = new Date(startOfToday);
    d.setDate(d.getDate() - 6);
    return d.toISOString();
  }
  if (preset === '30d') {
    const d = new Date(startOfToday);
    d.setDate(d.getDate() - 29);
    return d.toISOString();
  }
  return undefined;
};

const STATUS_TABS = ['pending', 'preparing', 'served', 'completed', 'cancelled'];

const itemsPreview = (details) => {
  if (!details || details.length === 0) return null;
  const names = details
    .map((d) => d.menu_item?.name)
    .filter(Boolean);
  const totalQty = details.reduce((s, d) => s + (d.quantity || 0), 0);
  const head = names.slice(0, 2).join(', ');
  const more = names.length > 2 ? ` +${names.length - 2}` : '';
  return { text: head + more || `${details.length} món`, totalQty, count: details.length };
};

const OrderList = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [datePreset, setDatePreset] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 15;

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fromDate = useMemo(() => getFromDate(datePreset), [datePreset]);

  const baseParams = useMemo(
    () => ({ search: search || undefined, from_date: fromDate }),
    [search, fromDate],
  );

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await orderService.list({
        ...baseParams,
        status: statusFilter || undefined,
        page,
        limit,
      });
      setOrders(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không tải được danh sách');
    } finally {
      setLoading(false);
    }
  }, [baseParams, statusFilter, page]);

  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await orderService.summary(baseParams);
      setSummary(data);
    } catch {
    }
  }, [baseParams]);

  useEffect(() => { fetchList(); }, [fetchList]);
  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setPage(1); }, [statusFilter, datePreset]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await orderService.remove(deleteTarget.id);
      toast.success(`Đã xoá đơn ${deleteTarget.order_code}`);
      setDeleteTarget(null);
      fetchList();
      fetchSummary();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xoá thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const cb = summary?.countByStatus;
  const processing = cb ? cb.pending + cb.preparing + cb.served : 0;

  const stats = [
    {
      key: 'revenue',
      label: 'Doanh thu',
      value: formatCurrency(summary?.revenue ?? 0),
      sub: `${summary?.completedCount ?? 0} đơn hoàn thành`,
      tone: 'primary',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      key: 'total',
      label: 'Tổng đơn',
      value: (summary?.total ?? 0).toLocaleString('vi-VN'),
      sub: 'trong phạm vi lọc',
      tone: 'blue',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11H3v10h6V11zM21 3h-6v18h6V3zM15 7H9v14h6V7z" />
        </svg>
      ),
    },
    {
      key: 'processing',
      label: 'Đang xử lý',
      value: processing.toLocaleString('vi-VN'),
      sub: 'chờ · chế biến · phục vụ',
      tone: 'amber',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      key: 'avg',
      label: 'Trung bình / đơn',
      value: formatCurrency(summary?.avgOrderValue ?? 0),
      sub: 'theo đơn hoàn thành',
      tone: 'green',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
  ];

  return (
    <Layout>
      <Header title="Đơn hàng" />

      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <div key={s.key} className={`${styles.statCard} ${styles[`tone_${s.tone}`]}`}>
            <div className={styles.statIcon}>{s.icon}</div>
            <div className={styles.statBody}>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statValue}>{summary ? s.value : '-'}</span>
              <span className={styles.statSub}>{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Tìm mã đơn, tên hoặc SĐT khách..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <div className={styles.segment}>
              {DATE_PRESETS.map((p) => (
                <button
                  key={p.key}
                  className={`${styles.segmentBtn} ${datePreset === p.key ? styles.segmentActive : ''}`}
                  onClick={() => setDatePreset(p.key)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <button className={styles.btnPrimary} onClick={() => navigate('/orders/create')}>
            + Tạo đơn mới
          </button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${statusFilter === '' ? styles.tabActive : ''}`}
            onClick={() => setStatusFilter('')}
          >
            Tất cả
            <span className={styles.tabCount}>{summary?.total ?? 0}</span>
          </button>
          {STATUS_TABS.map((st) => (
            <button
              key={st}
              className={`${styles.tab} ${statusFilter === st ? styles.tabActive : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              <span className={`${styles.dot} ${styles[`dot_${st}`]}`} />
              {ORDER_STATUS_LABELS[st]}
              <span className={styles.tabCount}>{cb ? cb[st] : 0}</span>
            </button>
          ))}
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Bàn</th>
                <th>Khách hàng</th>
                <th>Món</th>
                <th style={{ textAlign: 'right' }}>Thành tiền</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
                <th style={{ width: 90, textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`sk-${i}`} className={styles.skeletonRow}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j}><span className={styles.skeleton} /></td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.empty}>
                    <div className={styles.emptyState}>
                      <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M9 11H3v10h6V11zM21 3h-6v18h6V3zM15 7H9v14h6V7z" />
                      </svg>
                      <p>Không có đơn hàng nào</p>
                      <button className={styles.btnPrimary} onClick={() => navigate('/orders/create')}>
                        + Tạo đơn đầu tiên
                      </button>
                    </div>
                  </td>
                </tr>
              ) : orders.map((o) => {
                const prev = itemsPreview(o.order_details);
                return (
                  <tr key={o.id} onClick={() => navigate(`/orders/${o.id}`)} className={styles.clickableRow}>
                    <td data-label="Mã đơn" className={styles.orderCode}>{o.order_code}</td>
                    <td data-label="Bàn">{o.table?.name || '-'}</td>
                    <td data-label="Khách hàng">
                      {o.customer?.full_name
                        ? <span className={styles.customerCell}>
                            <span className={styles.avatar}>{o.customer.full_name.trim().charAt(0).toUpperCase()}</span>
                            {o.customer.full_name}
                          </span>
                        : <span className={styles.muted}>Khách lẻ</span>}
                    </td>
                    <td data-label="Món">
                      {prev
                        ? <span className={styles.itemsPreview} title={prev.text}>
                            <span className={styles.itemsQty}>{prev.totalQty}×</span>{prev.text}
                          </span>
                        : <span className={styles.muted}>-</span>}
                    </td>
                    <td data-label="Thành tiền" className={styles.amountCell}>
                      {formatCurrency(o.final_amount)}
                    </td>
                    <td data-label="Trạng thái">
                      <span className={`${styles.badge} ${statusClass[o.status]}`}>
                        <span className={`${styles.dot} ${styles[`dot_${o.status}`]}`} />
                        {ORDER_STATUS_LABELS[o.status]}
                      </span>
                    </td>
                    <td data-label="Thời gian" className={styles.muted} title={formatDateTime(o.created_at)}>
                      {formatRelativeTime(o.created_at)}
                    </td>
                    <td data-label="Thao tác" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                      <div className={styles.rowActions}>
                        <button
                          className={styles.iconBtn}
                          onClick={() => navigate(`/orders/${o.id}`)}
                          title="Xem / sửa"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className={`${styles.iconBtn} ${styles.danger}`}
                          onClick={() => setDeleteTarget(o)}
                          title="Xoá đơn"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" /><path d="M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <span>Trang {page} / {totalPages} · {total} đơn</span>
            <div className={styles.pageBtns}>
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Trước</button>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Sau →</button>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Xoá đơn hàng"
        size="sm"
        footer={
          <>
            <button className={styles.btnSecondary} onClick={() => setDeleteTarget(null)} disabled={deleting}>Huỷ</button>
            <button className={styles.btnDanger} onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Đang xoá...' : 'Xoá vĩnh viễn'}
            </button>
          </>
        }
      >
        <p>
          Xoá vĩnh viễn đơn <strong>{deleteTarget?.order_code}</strong>?
        </p>
        <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 8 }}>
          Đơn và toàn bộ món sẽ bị xoá khỏi hệ thống. Thao tác không thể hoàn tác.
        </p>
      </Modal>
    </Layout>
  );
};

export default OrderList;
