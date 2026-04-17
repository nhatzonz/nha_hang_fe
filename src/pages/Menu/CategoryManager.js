import React, { useState } from 'react';
import { toast } from 'sonner';
import Modal from '../../components/common/Modal';
import { categoryService } from '../../services/categoryService';
import styles from './Menu.module.scss';

const CategoryManager = ({ open, onClose, categories, onChange }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingId(null);
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên danh mục');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { name: name.trim(), description: description.trim() };
      if (editingId) {
        await categoryService.update(editingId, payload);
        toast.success('Đã cập nhật danh mục');
      } else {
        await categoryService.create(payload);
        toast.success('Đã thêm danh mục');
      }
      resetForm();
      onChange();
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Xoá danh mục "${cat.name}"?`)) return;
    setDeletingId(cat.id);
    try {
      await categoryService.remove(cat.id);
      toast.success('Đã xoá danh mục');
      onChange();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xoá thất bại');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Quản lý danh mục"
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.catForm}>
        <div className={styles.catFormRow}>
          <input
            type="text"
            placeholder="Tên danh mục"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
          />
          <input
            type="text"
            placeholder="Mô tả (tuỳ chọn)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit" className={styles.btnPrimary} disabled={submitting}>
            {editingId ? 'Cập nhật' : 'Thêm'}
          </button>
          {editingId && (
            <button type="button" className={styles.btnSecondary} onClick={resetForm}>
              Huỷ
            </button>
          )}
        </div>
      </form>

      <div className={styles.catList}>
        {categories.length === 0 ? (
          <p className={styles.empty}>Chưa có danh mục nào</p>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className={styles.catItem}>
              <div className={styles.catInfo}>
                <span className={styles.catName}>{cat.name}</span>
                {cat.description && <span className={styles.catDesc}>{cat.description}</span>}
              </div>
              <div className={styles.catActions}>
                <button
                  className={styles.iconBtn}
                  onClick={() => handleEdit(cat)}
                  title="Sửa"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  className={`${styles.iconBtn} ${styles.danger}`}
                  onClick={() => handleDelete(cat)}
                  disabled={deletingId === cat.id}
                  title="Xoá"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

export default CategoryManager;
