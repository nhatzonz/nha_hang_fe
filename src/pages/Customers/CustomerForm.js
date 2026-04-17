import React, { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal';
import styles from './Customer.module.scss';

const defaultValues = {
  full_name: '',
  phone: '',
  email: '',
  address: '',
};

const CustomerForm = ({ open, onClose, onSubmit, initial }) => {
  const isEdit = !!initial;
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initial ? {
        full_name: initial.full_name || '',
        phone: initial.phone || '',
        email: initial.email || '',
        address: initial.address || '',
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
    const name = values.full_name.trim();
    const phone = values.phone.trim();
    const email = values.email.trim();

    if (!name) errs.full_name = 'Vui lòng nhập họ tên';
    else if (name.length > 100) errs.full_name = 'Tên tối đa 100 ký tự';

    if (phone && !/^0[0-9]{9}$/.test(phone)) errs.phone = 'SĐT phải có 10 chữ số và bắt đầu bằng 0';

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email không hợp lệ';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { full_name: values.full_name.trim() };
      if (values.phone.trim()) payload.phone = values.phone.trim();
      if (values.email.trim()) payload.email = values.email.trim().toLowerCase();
      if (values.address.trim()) payload.address = values.address.trim();
      await onSubmit(payload);
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
      title={isEdit ? 'Sửa khách hàng' : 'Thêm khách hàng mới'}
      footer={
        <>
          <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={submitting}>Huỷ</button>
          <button type="submit" form="customer-form" className={styles.btnPrimary} disabled={submitting}>
            {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </>
      }
    >
      <form id="customer-form" onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Họ tên <span className={styles.required}>*</span></label>
          <input
            type="text"
            value={values.full_name}
            onChange={(e) => setField('full_name', e.target.value)}
            placeholder="Nguyễn Văn A"
            maxLength={100}
          />
          {errors.full_name && <span className={styles.errMsg}>{errors.full_name}</span>}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Số điện thoại</label>
            <input
              type="text"
              value={values.phone}
              onChange={(e) => setField('phone', e.target.value.replace(/\D/g, ''))}
              placeholder="0912345678"
              maxLength={10}
              inputMode="numeric"
            />
            {errors.phone && <span className={styles.errMsg}>{errors.phone}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={values.email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder="email@example.com"
              maxLength={100}
            />
            {errors.email && <span className={styles.errMsg}>{errors.email}</span>}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Địa chỉ</label>
          <textarea
            rows={2}
            value={values.address}
            onChange={(e) => setField('address', e.target.value)}
            placeholder="123 Đường ABC, Quận 1, TP.HCM"
          />
        </div>
      </form>
    </Modal>
  );
};

export default CustomerForm;
