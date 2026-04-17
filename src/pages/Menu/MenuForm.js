import React, { useEffect, useRef, useState } from 'react';
import Modal from '../../components/common/Modal';
import { assetUrl, formatPriceInput, parsePriceInput } from '../../utils/format';
import styles from './Menu.module.scss';

const defaultValues = {
  name: '',
  description: '',
  price: '',
  category_id: '',
  is_available: 1,
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const MenuForm = ({ open, onClose, onSubmit, initial, categories }) => {
  const isEdit = !!initial;
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setValues(initial ? {
        name: initial.name || '',
        description: initial.description || '',
        price: initial.price != null ? formatPriceInput(initial.price) : '',
        category_id: initial.category_id || '',
        is_available: initial.is_available ?? 1,
      } : defaultValues);
      setErrors({});
      setImageFile(null);
      setImagePreview(initial?.image ? assetUrl(initial.image) : null);
    }
  }, [open, initial]);

  const setField = (name, val) => {
    setValues((v) => ({ ...v, [name]: val }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrors((er) => ({ ...er, image: 'Chỉ chấp nhận file JPG, PNG, WEBP, GIF' }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((er) => ({ ...er, image: 'Ảnh tối đa 5MB' }));
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((er) => ({ ...er, image: undefined }));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const errs = {};
    const name = values.name.trim();
    if (!name) errs.name = 'Vui lòng nhập tên món';
    else if (name.length > 150) errs.name = 'Tên món tối đa 150 ký tự';

    const priceNum = parsePriceInput(values.price);
    if (priceNum === '' || priceNum === 0) errs.price = 'Vui lòng nhập giá';
    else if (isNaN(priceNum) || priceNum < 0) errs.price = 'Giá không hợp lệ';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name.trim());
      if (values.description.trim()) formData.append('description', values.description.trim());
      formData.append('price', String(parsePriceInput(values.price)));
      if (values.category_id) formData.append('category_id', String(values.category_id));
      formData.append('is_available', String(values.is_available));
      if (imageFile) formData.append('image', imageFile);

      await onSubmit(formData, isEdit);
    } catch {
      // Parent toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? undefined : onClose}
      title={isEdit ? 'Sửa món' : 'Thêm món mới'}
      size="lg"
      footer={
        <>
          <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={submitting}>
            Huỷ
          </button>
          <button type="submit" form="menu-form" className={styles.btnPrimary} disabled={submitting}>
            {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </>
      }
    >
      <form id="menu-form" onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formLayout}>
          {/* Upload ảnh */}
          <div className={styles.imageUpload}>
            <label>Ảnh món ăn</label>
            <div className={styles.imagePreview} onClick={() => fileInputRef.current?.click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" />
              ) : (
                <div className={styles.uploadHint}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span>Chọn ảnh</span>
                  <small>JPG, PNG, WEBP, GIF · Tối đa 5MB</small>
                </div>
              )}
            </div>
            {imagePreview && (
              <button type="button" className={styles.clearImageBtn} onClick={clearImage}>
                Xoá ảnh
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {errors.image && <span className={styles.errMsg}>{errors.image}</span>}
          </div>

          {/* Info */}
          <div className={styles.formFields}>
            <div className={styles.formGroup}>
              <label>Tên món <span className={styles.required}>*</span></label>
              <input
                type="text"
                value={values.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="VD: Tôm hùm nướng phô mai"
                maxLength={150}
              />
              {errors.name && <span className={styles.errMsg}>{errors.name}</span>}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Giá (VNĐ) <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={values.price}
                  onChange={(e) => setField('price', formatPriceInput(e.target.value))}
                  placeholder="850.000"
                />
                {errors.price && <span className={styles.errMsg}>{errors.price}</span>}
              </div>

              <div className={styles.formGroup}>
                <label>Danh mục</label>
                <select
                  value={values.category_id}
                  onChange={(e) => setField('category_id', e.target.value)}
                >
                  <option value="">Chưa phân loại</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Mô tả</label>
              <textarea
                rows={3}
                value={values.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Mô tả ngắn về món ăn, nguyên liệu..."
              />
            </div>

            <div className={styles.formGroup}>
              <label>Trạng thái</label>
              <div className={styles.radioRow}>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    checked={Number(values.is_available) === 1}
                    onChange={() => setField('is_available', 1)}
                  />
                  <span>Đang bán</span>
                </label>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    checked={Number(values.is_available) === 0}
                    onChange={() => setField('is_available', 0)}
                  />
                  <span>Tạm hết</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default MenuForm;
