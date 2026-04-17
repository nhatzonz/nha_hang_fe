import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../../components/common/Layout';
import Header from '../../components/common/Header';
import { orderService, ORDER_STATUS_LABELS } from '../../services/orderService';
import { formatCurrency, formatDateTime } from '../../utils/format';
import styles from './Order.module.scss';

const statusClass = {
  pending: styles.badgePending,
  preparing: styles.badgePreparing,
  served: styles.badgeServed,
  completed: styles.badgeCompleted,
  cancelled: styles.badgeCancelled,
};

const OrderList = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await orderService.list({
        search: search || undefined,
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
  }, [search, statusFilter, page, limit]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setPage(1); }, [statusFilter]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Layout>
      <Header title="Đơn hàng" />

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Tìm mã đơn..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <select
              className={styles.select}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <button className={styles.btnPrimary} onClick={() => navigate('/orders/create')}>
            + Tạo đơn mới
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Bàn</th>
                <th>Khách hàng</th>
                <th>Nhân viên</th>
                <th style={{ textAlign: 'right' }}>Thành tiền</th>
                <th>Trạng thái</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className={styles.empty}>Đang tải...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className={styles.empty}>Không có đơn hàng nào</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} onClick={() => navigate(`/orders/${o.id}`)} className={styles.clickableRow}>
                  <td className={styles.orderCode}>{o.order_code}</td>
                  <td>{o.table?.name || '—'}</td>
                  <td>{o.customer?.full_name || <span className={styles.muted}>Khách lẻ</span>}</td>
                  <td className={styles.muted}>{o.staff?.full_name || '—'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#c0392b' }}>
                    {formatCurrency(o.final_amount)}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${statusClass[o.status]}`}>
                      {ORDER_STATUS_LABELS[o.status]}
                    </span>
                  </td>
                  <td className={styles.muted}>{formatDateTime(o.created_at)}</td>
                </tr>
              ))}
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
    </Layout>
  );
};

export default OrderList;
