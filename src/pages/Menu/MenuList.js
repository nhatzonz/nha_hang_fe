import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../../components/common/Layout';
import Header from '../../components/common/Header';
import Modal from '../../components/common/Modal';
import MenuForm from './MenuForm';
import CategoryManager from './CategoryManager';
import { useAuth } from '../../context/AuthContext';
import { menuService } from '../../services/menuService';
import { categoryService } from '../../services/categoryService';
import { formatCurrency, assetUrl } from '../../utils/format';
import styles from './Menu.module.scss';

const MenuList = () => {
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const canEdit = me?.role === 'admin' || me?.role === 'manager';

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availableFilter, setAvailableFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await categoryService.list();
      setCategories(data);
    } catch {
      toast.error('Không tải được danh mục');
    }
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await menuService.list({
        search: search || undefined,
        category_id: categoryFilter || undefined,
        is_available: availableFilter !== '' ? Number(availableFilter) : undefined,
        page,
        limit,
      });
      setItems(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không tải được danh sách món');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, availableFilter, page, limit]);

  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await menuService.summary({
        search: search || undefined,
        is_available: availableFilter !== '' ? Number(availableFilter) : undefined,
      });
      setSummary(data);
    } catch {
      /* thống kê lỗi không chặn danh sách */
    }
  }, [search, availableFilter]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setPage(1); }, [categoryFilter, availableFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleSubmit = async (formData, isEdit) => {
    try {
      if (isEdit) {
        await menuService.update(editing.id, formData);
        toast.success('Đã cập nhật món');
      } else {
        await menuService.create(formData);
        toast.success('Đã thêm món mới');
      }
      setFormOpen(false);
      fetchItems();
      fetchSummary();
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
      await menuService.remove(deleteTarget.id);
      toast.success('Đã xoá món');
      setDeleteTarget(null);
      fetchItems();
      fetchSummary();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xoá thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const catCount = (id) => summary?.byCategory?.find((c) => String(c.id) === String(id))?.count;

  return (
    <Layout>
      <Header title="Thực đơn" />

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Tìm món..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className={styles.segment}>
            {[
              { v: '', label: 'Tất cả' },
              { v: '1', label: 'Đang bán' },
              { v: '0', label: 'Tạm hết' },
            ].map((o) => (
              <button
                key={o.v}
                className={`${styles.segmentBtn} ${availableFilter === o.v ? styles.segmentActive : ''}`}
                onClick={() => setAvailableFilter(o.v)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {canEdit && (
          <div className={styles.actions}>
            <button className={styles.btnSecondary} onClick={() => setCategoryModalOpen(true)}>
              Quản lý danh mục
            </button>
            <button className={styles.btnPrimary} onClick={openCreate}>
              + Thêm món
            </button>
          </div>
        )}
      </div>

      {/* Category chips */}
      <div className={styles.catChips}>
        <button
          className={`${styles.catChip} ${categoryFilter === '' ? styles.catChipActive : ''}`}
          onClick={() => setCategoryFilter('')}
        >
          Tất cả
          {summary && <span className={styles.chipCount}>{summary.total}</span>}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`${styles.catChip} ${String(categoryFilter) === String(c.id) ? styles.catChipActive : ''}`}
            onClick={() => setCategoryFilter(String(c.id))}
          >
            {c.name}
            {catCount(c.id) !== undefined && <span className={styles.chipCount}>{catCount(c.id)}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonImg} />
              <div className={styles.skeletonBody}>
                <span className={styles.skeletonLine} style={{ width: '40%' }} />
                <span className={styles.skeletonLine} style={{ width: '80%' }} />
                <span className={styles.skeletonLine} style={{ width: '55%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
          </svg>
          <p>Không tìm thấy món nào</p>
          {canEdit && (
            <button className={styles.btnPrimary} onClick={openCreate}>+ Thêm món mới</button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <div
              key={item.id}
              className={styles.card}
              onClick={() => navigate(`/menu/${item.id}`)}
              style={{ cursor: 'pointer' }}
              title="Xem chi tiết món"
            >
              <div className={styles.imgWrap}>
                {item.image ? (
                  <img src={assetUrl(item.image)} alt={item.name} />
                ) : (
                  <div className={styles.imgPlaceholder}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                )}
                {!item.is_available && (
                  <span className={styles.unavailableBadge}>Tạm hết</span>
                )}
              </div>

              <div className={styles.cardBody}>
                <span className={styles.cardCategory}>
                  {item.category?.name || 'Chưa phân loại'}
                </span>
                <h3 className={styles.cardName}>{item.name}</h3>
                {item.description && (
                  <p className={styles.cardDesc}>{item.description}</p>
                )}
                <div className={styles.cardFooter}>
                  <span className={styles.cardPrice}>{formatCurrency(item.price)}</span>
                  {canEdit && (
                    <div className={styles.cardActions}>
                      <button onClick={(e) => { e.stopPropagation(); openEdit(item); }} title="Sửa">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }} className={styles.danger} title="Xoá">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span>Trang {page} / {totalPages} · {total} món</span>
          <div className={styles.pageBtns}>
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Trước</button>
            <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Sau →</button>
          </div>
        </div>
      )}

      {/* Form modal */}
      <MenuForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
        categories={categories}
      />

      {/* Category manager modal */}
      <CategoryManager
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        categories={categories}
        onChange={() => {
          fetchCategories();
          fetchItems();
        }}
      />

      {/* Delete confirm */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Xác nhận xoá món"
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
        <p>
          Bạn có chắc muốn xoá món <strong>{deleteTarget?.name}</strong>?
          Ảnh minh hoạ cũng sẽ bị xoá.
        </p>
      </Modal>
    </Layout>
  );
};

export default MenuList;
