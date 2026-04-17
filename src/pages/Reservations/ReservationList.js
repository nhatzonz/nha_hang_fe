import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../../components/common/Layout';
import Header from '../../components/common/Header';
import Modal from '../../components/common/Modal';
import ReservationForm from './ReservationForm';
import {
  reservationService,
  RESERVATION_STATUS_LABELS,
} from '../../services/reservationService';
import { formatPhone } from '../../utils/format';
import styles from './Reservation.module.scss';

const statusClass = {
  pending: styles.badgePending,
  confirmed: styles.badgeConfirmed,
  cancelled: styles.badgeCancelled,
  completed: styles.badgeCompleted,
};

const ReservationList = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [changing, setChanging] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await reservationService.list({
        search: search || undefined,
        status: statusFilter || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        page,
        limit,
      });
      setList(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không tải được danh sách');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, fromDate, toDate, page, limit]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setPage(1); }, [statusFilter, fromDate, toDate]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (r) => { setEditing(r); setFormOpen(true); };

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await reservationService.update(editing.id, values);
        toast.success('Đã cập nhật đặt bàn');
      } else {
        await reservationService.create(values);
        toast.success('Đã tạo đặt bàn');
      }
      setFormOpen(false);
      fetch();
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Thao tác thất bại');
      throw err;
    }
  };

  const handleChangeStatus = async (r, status) => {
    setChanging(true);
    try {
      await reservationService.changeStatus(r.id, status);
      toast.success('Đã cập nhật trạng thái');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setChanging(false);
    }
  };

  // "Đã đến + Tạo đơn": chỉ navigate kèm reservation_id
  // Atomic: reservation sẽ completed KHI VÀ CHỈ KHI order được tạo thành công
  // Nếu user bấm quay lại → reservation giữ nguyên status confirmed
  const handleArriveAndCreateOrder = (r) => {
    const params = new URLSearchParams();
    params.set('reservation_id', r.id);
    if (r.table_id) params.set('table_id', r.table_id);
    if (r.customer_id) params.set('customer_id', r.customer_id);
    navigate(`/orders/create?${params.toString()}`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setChanging(true);
    try {
      await reservationService.remove(deleteTarget.id);
      toast.success('Đã xoá đặt bàn');
      setDeleteTarget(null);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xoá thất bại');
    } finally {
      setChanging(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Layout>
      <Header title="Đặt bàn" subtitle="Quản lý đặt bàn online của khách" />

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Tìm tên, SĐT, email..."
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
              {Object.entries(RESERVATION_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            <input
              type="date"
              className={styles.dateInput}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              placeholder="Từ ngày"
              title="Từ ngày"
            />
            <input
              type="date"
              className={styles.dateInput}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              placeholder="Đến ngày"
              title="Đến ngày"
            />
          </div>

          <button className={styles.btnPrimary} onClick={openCreate}>
            + Tạo đặt bàn
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Khách</th>
                <th>SĐT</th>
                <th>Bàn</th>
                <th>Ngày</th>
                <th>Giờ</th>
                <th style={{ textAlign: 'center' }}>Số khách</th>
                <th>Trạng thái</th>
                <th style={{ width: 220 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className={styles.empty}>Đang tải...</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={8} className={styles.empty}>Chưa có đặt bàn nào</td></tr>
              ) : list.map((r) => {
                const isReturning = r.customer && Number(r.customer.total_orders) > 0;
                return (
                <tr key={r.id}>
                  <td data-label="Khách">
                    <div className={styles.customerCell}>
                      <strong>{r.customer_name}</strong>
                      {isReturning && (
                        <span className={styles.vipBadge} title={`Khách quen: ${r.customer.total_orders} đơn`}>
                          ⭐ Khách quen
                        </span>
                      )}
                    </div>
                    {r.note && <div className={styles.noteText}>{r.note}</div>}
                  </td>
                  <td data-label="SĐT">{formatPhone(r.phone)}</td>
                  <td data-label="Bàn">{r.table?.name || <span className={styles.muted}>Chưa gán</span>}</td>
                  <td data-label="Ngày">{r.reservation_date}</td>
                  <td data-label="Giờ">{r.reservation_time?.slice(0, 5)}</td>
                  <td data-label="Số khách" style={{ textAlign: 'center', fontWeight: 600 }}>{r.guest_count}</td>
                  <td data-label="Trạng thái">
                    <span className={`${styles.badge} ${statusClass[r.status]}`}>
                      {RESERVATION_STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td data-label="Thao tác">
                    <div className={styles.actions}>
                      {r.status === 'pending' && (
                        <>
                          <button
                            className={styles.confirmBtn}
                            onClick={() => handleChangeStatus(r, 'confirmed')}
                            disabled={changing}
                            title="Xác nhận"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            Xác nhận
                          </button>
                          <button
                            className={styles.cancelBtn}
                            onClick={() => handleChangeStatus(r, 'cancelled')}
                            disabled={changing}
                            title="Huỷ"
                          >
                            Huỷ
                          </button>
                        </>
                      )}
                      {r.status === 'confirmed' && (
                        <>
                          <button
                            className={styles.completeBtn}
                            onClick={() => handleArriveAndCreateOrder(r)}
                            disabled={changing}
                            title="Khách đã đến — chuyển sang tạo đơn"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            Tạo đơn
                          </button>
                          <button
                            className={styles.cancelBtn}
                            onClick={() => handleChangeStatus(r, 'cancelled')}
                            disabled={changing}
                          >
                            Huỷ
                          </button>
                        </>
                      )}
                      {(r.status === 'cancelled') && (
                        <button
                          className={styles.iconBtn}
                          onClick={() => setDeleteTarget(r)}
                          title="Xoá"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          </svg>
                        </button>
                      )}
                      {(r.status === 'pending' || r.status === 'confirmed') && (
                        <button
                          className={styles.iconBtn}
                          onClick={() => openEdit(r)}
                          title="Sửa"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                      )}
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
            <span>Trang {page} / {totalPages} · {total} đặt bàn</span>
            <div className={styles.pageBtns}>
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Trước</button>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Sau →</button>
            </div>
          </div>
        )}
      </div>

      <ReservationForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Xoá đặt bàn"
        size="sm"
        footer={
          <>
            <button className={styles.btnSecondary} onClick={() => setDeleteTarget(null)} disabled={changing}>Huỷ</button>
            <button className={styles.btnDanger} onClick={handleDelete} disabled={changing}>
              {changing ? 'Đang xoá...' : 'Xoá'}
            </button>
          </>
        }
      >
        <p>Xoá đặt bàn của <strong>{deleteTarget?.customer_name}</strong>?</p>
      </Modal>
    </Layout>
  );
};

export default ReservationList;
