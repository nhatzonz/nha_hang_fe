import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../../components/common/Layout';
import Header from '../../components/common/Header';
import Modal from '../../components/common/Modal';
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

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await orderService.remove(deleteTarget.id);
      toast.success(`Đã xoá đơn ${deleteTarget.order_code}`);
      setDeleteTarget(null);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xoá thất bại');
    } finally {
      setDeleting(false);
    }
  };

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
                <th style={{ width: 90, textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className={styles.empty}>Đang tải...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className={styles.empty}>Không có đơn hàng nào</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} onClick={() => navigate(`/orders/${o.id}`)} className={styles.clickableRow}>
                  <td data-label="Mã đơn" className={styles.orderCode}>{o.order_code}</td>
                  <td data-label="Bàn">{o.table?.name || '—'}</td>
                  <td data-label="Khách hàng">{o.customer?.full_name || <span className={styles.muted}>Khách lẻ</span>}</td>
                  <td data-label="Nhân viên" className={styles.muted}>{o.staff?.full_name || '—'}</td>
                  <td data-label="Thành tiền" style={{ textAlign: 'right', fontWeight: 700, color: '#c0392b' }}>
                    {formatCurrency(o.final_amount)}
                  </td>
                  <td data-label="Trạng thái">
                    <span className={`${styles.badge} ${statusClass[o.status]}`}>
                      {ORDER_STATUS_LABELS[o.status]}
                    </span>
                  </td>
                  <td data-label="Thời gian" className={styles.muted}>{formatDateTime(o.created_at)}</td>
                  <td data-label="Thao tác" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                    <div className={styles.rowActions}>
                      <button
                        className={styles.iconBtn}
                        onClick={() => navigate(`/orders/${o.id}`)}
                        title="Xem / sửa"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.danger}`}
                        onClick={() => setDeleteTarget(o)}
                        title="Xoá đơn"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6"/>
                          <path d="M14 11v6"/>
                        </svg>
                      </button>
                    </div>
                  </td>
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
