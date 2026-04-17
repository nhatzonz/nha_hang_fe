import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import Layout from '../../components/common/Layout';
import Header from '../../components/common/Header';
import Modal from '../../components/common/Modal';
import TableForm from './TableForm';
import { useAuth } from '../../context/AuthContext';
import { tableService } from '../../services/tableService';
import styles from './Table.module.scss';

const statusConfig = {
  available: { label: 'Trống', className: 'available' },
  occupied: { label: 'Có khách', className: 'occupied' },
  reserved: { label: 'Đã đặt', className: 'reserved' },
};

const TableList = () => {
  const { user: me } = useAuth();
  const canEdit = me?.role === 'admin' || me?.role === 'manager';

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const params = { include_upcoming: 1 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await tableService.list(params);
      setTables(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không tải được danh sách bàn');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setFormOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await tableService.update(editing.id, values);
        toast.success('Đã cập nhật bàn');
      } else {
        await tableService.create(values);
        toast.success('Đã thêm bàn mới');
      }
      setFormOpen(false);
      fetchTables();
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Thao tác thất bại');
      throw err;
    }
  };

  const handleStatusChange = async (table, newStatus) => {
    try {
      await tableService.updateStatus(table.id, newStatus);
      toast.success('Đã cập nhật trạng thái');
      fetchTables();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await tableService.remove(deleteTarget.id);
      toast.success('Đã xoá bàn');
      setDeleteTarget(null);
      fetchTables();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xoá thất bại');
    } finally {
      setDeleting(false);
    }
  };

  // Stats
  const stats = tables.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <Layout>
      <Header title="Quản lý bàn" />

      {/* Stats summary */}
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.available}`}>
          <span className={styles.statLabel}>Trống</span>
          <span className={styles.statValue}>{stats.available || 0}</span>
        </div>
        <div className={`${styles.statCard} ${styles.occupied}`}>
          <span className={styles.statLabel}>Có khách</span>
          <span className={styles.statValue}>{stats.occupied || 0}</span>
        </div>
        <div className={`${styles.statCard} ${styles.reserved}`}>
          <span className={styles.statLabel}>Đã đặt</span>
          <span className={styles.statValue}>{stats.reserved || 0}</span>
        </div>
        <div className={`${styles.statCard} ${styles.total}`}>
          <span className={styles.statLabel}>Tổng</span>
          <span className={styles.statValue}>{tables.length}</span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <select
          className={styles.select}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="available">Trống</option>
          <option value="occupied">Có khách</option>
          <option value="reserved">Đã đặt</option>
        </select>

        {canEdit && (
          <button className={styles.btnPrimary} onClick={openCreate}>
            + Thêm bàn
          </button>
        )}
      </div>

      {loading ? (
        <div className={styles.empty}>Đang tải...</div>
      ) : tables.length === 0 ? (
        <div className={styles.empty}>Không có bàn nào</div>
      ) : (
        <div className={styles.grid}>
          {tables.map((t) => {
            const cfg = statusConfig[t.status] || statusConfig.available;
            const nextReservation = t.upcoming_reservations?.[0];
            return (
              <div key={t.id} className={`${styles.tableCard} ${styles[cfg.className]}`}>
                <div className={styles.tableHeader}>
                  <h3 className={styles.tableName}>{t.name}</h3>
                  <span className={styles.statusBadge}>{cfg.label}</span>
                </div>

                <div className={styles.tableInfo}>
                  <div className={styles.infoRow}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                    </svg>
                    <span>{t.capacity} người</span>
                  </div>
                  {t.location && (
                    <div className={styles.infoRow}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span>{t.location}</span>
                    </div>
                  )}
                </div>

                {nextReservation && (
                  <div
                    className={`${styles.reservationBadge} ${nextReservation.status === 'confirmed' ? styles.reservationConfirmed : styles.reservationPending}`}
                    title={`Khách: ${nextReservation.customer_name} (${nextReservation.phone}) — ${nextReservation.guest_count} người${nextReservation.note ? ' · ' + nextReservation.note : ''}`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                      <polyline points="12 7 12 12 15 14"/>
                    </svg>
                    <span>
                      {nextReservation.status === 'pending' ? 'Chờ XN' : 'Đặt'}{' '}
                      {nextReservation.reservation_time?.slice(0, 5)}
                      {' · '}{nextReservation.guest_count} khách
                    </span>
                    {t.upcoming_reservations.length > 1 && (
                      <span className={styles.reservationMore}>
                        +{t.upcoming_reservations.length - 1}
                      </span>
                    )}
                  </div>
                )}

                <div className={styles.tableActions}>
                  <select
                    className={styles.statusSelect}
                    value={t.status}
                    onChange={(e) => handleStatusChange(t, e.target.value)}
                  >
                    <option value="available">Trống</option>
                    <option value="occupied">Có khách</option>
                    <option value="reserved">Đã đặt</option>
                  </select>

                  {canEdit && (
                    <div className={styles.iconActions}>
                      <button onClick={() => openEdit(t)} title="Sửa">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(t)}
                        className={styles.danger}
                        title="Xoá"
                        disabled={t.status === 'occupied'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TableForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Xác nhận xoá bàn"
        size="sm"
        footer={
          <>
            <button className={styles.btnSecondary} onClick={() => setDeleteTarget(null)} disabled={deleting}>Huỷ</button>
            <button className={styles.btnDanger} onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Đang xoá...' : 'Xoá'}
            </button>
          </>
        }
      >
        <p>Bạn có chắc muốn xoá bàn <strong>{deleteTarget?.name}</strong>?</p>
      </Modal>
    </Layout>
  );
};

export default TableList;
