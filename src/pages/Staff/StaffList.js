import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import Layout from '../../components/common/Layout';
import Header from '../../components/common/Header';
import Modal from '../../components/common/Modal';
import StaffForm from './StaffForm';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { formatPhone } from '../../utils/format';
import styles from './StaffList.module.scss';

const roleLabel = {
  admin: 'Quản trị',
  manager: 'Quản lý',
  staff: 'Nhân viên',
};

const roleClass = {
  admin: styles.roleAdmin,
  manager: styles.roleManager,
  staff: styles.roleStaff,
};

const StaffList = () => {
  const { user: me } = useAuth();
  const isAdmin = me?.role === 'admin';

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userService.list({
        search: search || undefined,
        role: roleFilter || undefined,
        page,
        limit,
      });
      setUsers(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không tải được danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(t);
  }, [search, roleFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setFormOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        const payload = { ...values };
        if (!payload.password) delete payload.password;
        await userService.update(editing.id, payload);
        toast.success('Đã cập nhật nhân viên');
      } else {
        await userService.create(values);
        toast.success('Đã thêm nhân viên mới');
      }
      setFormOpen(false);
      fetchUsers();
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
      await userService.remove(deleteTarget.id);
      toast.success('Đã xoá nhân viên');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xoá thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Layout>
      <Header title="Quản lý nhân viên" />

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Tìm theo tên, email, SĐT..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className={styles.select}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Tất cả vai trò</option>
              <option value="admin">Quản trị</option>
              <option value="manager">Quản lý</option>
              <option value="staff">Nhân viên</option>
            </select>
          </div>

          {isAdmin && (
            <button className={styles.addBtn} onClick={openCreate}>
              + Thêm nhân viên
            </button>
          )}
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                {isAdmin && <th style={{ width: 120 }}>Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={isAdmin ? 7 : 6} className={styles.empty}>Đang tải...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={isAdmin ? 7 : 6} className={styles.empty}>Không có nhân viên nào</td></tr>
              ) : users.map((u) => (
                <tr key={u.id}>
                  <td data-label="Họ tên">
                    <div className={styles.nameCell}>
                      <div className={styles.avatar}>{u.full_name.charAt(0).toUpperCase()}</div>
                      <span>{u.full_name}</span>
                    </div>
                  </td>
                  <td data-label="Email">{u.email}</td>
                  <td data-label="SĐT">{u.phone ? formatPhone(u.phone) : '—'}</td>
                  <td data-label="Vai trò">
                    <span className={`${styles.badge} ${roleClass[u.role]}`}>
                      {roleLabel[u.role]}
                    </span>
                  </td>
                  <td data-label="Trạng thái">
                    <span className={`${styles.status} ${u.is_active ? styles.active : styles.inactive}`}>
                      {u.is_active ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </td>
                  <td data-label="Ngày tạo" className={styles.muted}>
                    {new Date(u.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  {isAdmin && (
                    <td data-label="Thao tác">
                      <div className={styles.actions}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => openEdit(u)}
                          title="Sửa"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.danger}`}
                          onClick={() => setDeleteTarget(u)}
                          disabled={u.id === me?.id}
                          title={u.id === me?.id ? 'Không thể xoá chính bạn' : 'Xoá'}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>
              Trang {page} / {totalPages} · {total} nhân viên
            </span>
            <div className={styles.pageBtns}>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Trước
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form modal */}
      <StaffForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />

      {/* Confirm delete */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Xác nhận xoá nhân viên"
        size="sm"
        footer={
          <>
            <button
              className={styles.btnSecondary}
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Huỷ
            </button>
            <button
              className={styles.btnDanger}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Đang xoá...' : 'Xoá'}
            </button>
          </>
        }
      >
        <p>
          Bạn có chắc muốn xoá nhân viên <strong>{deleteTarget?.full_name}</strong>?
          Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </Layout>
  );
};

export default StaffList;
