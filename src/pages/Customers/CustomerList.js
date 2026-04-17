import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import Layout from '../../components/common/Layout';
import Header from '../../components/common/Header';
import Modal from '../../components/common/Modal';
import CustomerForm from './CustomerForm';
import { customerService } from '../../services/customerService';
import { formatPhone, formatCurrency, formatDate } from '../../utils/format';
import styles from './Customer.module.scss';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await customerService.list({
        search: search || undefined,
        page,
        limit,
      });
      setCustomers(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không tải được danh sách');
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (c) => { setEditing(c); setFormOpen(true); };

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        await customerService.update(editing.id, values);
        toast.success('Đã cập nhật khách hàng');
      } else {
        await customerService.create(values);
        toast.success('Đã thêm khách hàng');
      }
      setFormOpen(false);
      fetch();
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Thao tác thất bại');
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await customerService.remove(deleteTarget.id);
      toast.success('Đã xoá khách hàng');
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
      <Header title="Khách hàng" />

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button className={styles.btnPrimary} onClick={openCreate}>
            + Thêm khách hàng
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>SĐT</th>
                <th>Email</th>
                <th style={{ textAlign: 'right' }}>Số đơn</th>
                <th style={{ textAlign: 'right' }}>Tổng chi tiêu</th>
                <th>Ngày tạo</th>
                <th style={{ width: 110 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className={styles.empty}>Đang tải...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={7} className={styles.empty}>Không có khách hàng nào</td></tr>
              ) : customers.map((c) => (
                <tr key={c.id}>
                  <td data-label="Họ tên">
                    <div className={styles.nameCell}>
                      <div className={styles.avatar}>{c.full_name.charAt(0).toUpperCase()}</div>
                      <span>{c.full_name}</span>
                    </div>
                  </td>
                  <td data-label="SĐT">{c.phone ? formatPhone(c.phone) : '—'}</td>
                  <td data-label="Email" className={styles.muted}>{c.email || '—'}</td>
                  <td data-label="Số đơn" style={{ textAlign: 'right', fontWeight: 600 }}>{c.total_orders || 0}</td>
                  <td data-label="Tổng chi tiêu" style={{ textAlign: 'right', fontWeight: 600, color: '#c0392b' }}>
                    {formatCurrency(c.total_spent)}
                  </td>
                  <td data-label="Ngày tạo" className={styles.muted}>{formatDate(c.created_at)}</td>
                  <td data-label="Thao tác">
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} onClick={() => openEdit(c)} title="Sửa">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.danger}`}
                        onClick={() => setDeleteTarget(c)}
                        title="Xoá"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
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
            <span>Trang {page} / {totalPages} · {total} khách</span>
            <div className={styles.pageBtns}>
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Trước</button>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Sau →</button>
            </div>
          </div>
        )}
      </div>

      <CustomerForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Xác nhận xoá khách hàng"
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
        <p>Bạn có chắc muốn xoá khách hàng <strong>{deleteTarget?.full_name}</strong>?</p>
        <p className={styles.warning}>
          Các đơn hàng của khách này vẫn được giữ, nhưng không còn liên kết với khách nữa.
        </p>
      </Modal>
    </Layout>
  );
};

export default CustomerList;
