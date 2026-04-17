import React, { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal';
import styles from './Table.module.scss';

const defaultValues = {
  name: '',
  capacity: 4,
  status: 'available',
  location: '',
};

const TableForm = ({ open, onClose, onSubmit, initial }) => {
  const isEdit = !!initial;
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initial ? {
        name: initial.name || '',
        capacity: initial.capacity || 4,
        status: initial.status || 'available',
        location: initial.location || '',
      } : defaultValues);
      setErrors({});
    }
  }, [open, initial]);

  const setField = (name, val) => {
    setValues((v) => ({ ...v, [name]: val }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    const name = values.name.trim();
    if (!name) errs.name = 'Vui lòng nhập tên bàn';
    else if (name.length > 50) errs.name = 'Tên bàn tối đa 50 ký tự';

    const cap = Number(values.capacity);
    if (!cap || isNaN(cap) || cap < 1) errs.capacity = 'Sức chứa tối thiểu 1 người';

    if (values.location && values.location.length > 100) errs.location = 'Vị trí tối đa 100 ký tự';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        name: values.name.trim(),
        capacity: Number(values.capacity),
        status: values.status,
      };
      if (values.location.trim()) payload.location = values.location.trim();
      await onSubmit(payload);
    } catch {
      // Toast parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? undefined : onClose}
      title={isEdit ? 'Sửa bàn' : 'Thêm bàn mới'}
      footer={
        <>
          <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={submitting}>Huỷ</button>
          <button type="submit" form="table-form" className={styles.btnPrimary} disabled={submitting}>
            {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </>
      }
    >
      <form id="table-form" onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Tên bàn <span className={styles.required}>*</span></label>
          <input
            type="text"
            value={values.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="VD: Bàn 1, VIP 01"
            maxLength={50}
          />
          {errors.name && <span className={styles.errMsg}>{errors.name}</span>}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Sức chứa (người) <span className={styles.required}>*</span></label>
            <input
              type="number"
              min="1"
              max="50"
              value={values.capacity}
              onChange={(e) => setField('capacity', e.target.value)}
            />
            {errors.capacity && <span className={styles.errMsg}>{errors.capacity}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Trạng thái</label>
            <select
              value={values.status}
              onChange={(e) => setField('status', e.target.value)}
            >
              <option value="available">Trống</option>
              <option value="occupied">Có khách</option>
              <option value="reserved">Đã đặt</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Vị trí (tuỳ chọn)</label>
          <input
            type="text"
            value={values.location}
            onChange={(e) => setField('location', e.target.value)}
            placeholder="VD: Tầng 1, Khu VIP, Ngoài trời"
            maxLength={100}
          />
          {errors.location && <span className={styles.errMsg}>{errors.location}</span>}
        </div>
      </form>
    </Modal>
  );
};

export default TableForm;
