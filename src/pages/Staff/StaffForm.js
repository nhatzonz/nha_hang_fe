import React, { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal';
import styles from './StaffList.module.scss';

const defaultValues = {
  full_name: '',
  email: '',
  password: '',
  phone: '',
  role: 'staff',
  is_active: 1,
};

const StaffForm = ({ open, onClose, onSubmit, initial }) => {
  const isEdit = !!initial;
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(
        initial
          ? {
              full_name: initial.full_name || '',
              email: initial.email || '',
              password: '',
              phone: initial.phone || '',
              role: initial.role || 'staff',
              is_active: initial.is_active ?? 1,
            }
          : defaultValues,
      );
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
    const email = values.email.trim();
    const phone = values.phone.trim();

    if (!name) errs.full_name = 'Vui lòng nhập họ tên';
    else if (name.length > 100) errs.full_name = 'Tên tối đa 100 ký tự';

    if (!email) errs.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email không hợp lệ';
    else if (email.length > 100) errs.email = 'Email tối đa 100 ký tự';

    if (!isEdit && !values.password) errs.password = 'Vui lòng nhập mật khẩu';
    if (values.password && values.password.length < 6) errs.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (values.password && values.password.length > 72) errs.password = 'Mật khẩu tối đa 72 ký tự';

    if (phone && !/^0[0-9]{9}$/.test(phone)) errs.phone = 'SĐT phải có 10 chữ số và bắt đầu bằng 0';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        full_name: values.full_name.trim(),
        email: values.email.trim().toLowerCase(),
        role: values.role,
      };
      if (values.password) payload.password = values.password;
      if (values.phone.trim()) payload.phone = values.phone.trim();
      if (isEdit) payload.is_active = values.is_active;
      await onSubmit(payload);
    } catch {
      // Lỗi đã toast ở parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? undefined : onClose}
      title={isEdit ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}
      footer={
        <>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onClose}
            disabled={submitting}
          >
            Huỷ
          </button>
          <button
            type="submit"
            form="staff-form"
            className={styles.btnPrimary}
            disabled={submitting}
          >
            {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </>
      }
    >
      <form id="staff-form" onSubmit={handleSubmit} className={styles.form}>
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

        <div className={styles.formGroup}>
          <label>Email <span className={styles.required}>*</span></label>
          <input
            type="email"
            value={values.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder="email@example.com"
            maxLength={100}
          />
          {errors.email && <span className={styles.errMsg}>{errors.email}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>
            Mật khẩu {!isEdit && <span className={styles.required}>*</span>}
            {isEdit && <span className={styles.hint}> (để trống nếu không đổi)</span>}
          </label>
          <input
            type="password"
            value={values.password}
            onChange={(e) => setField('password', e.target.value)}
            placeholder={isEdit ? '••••••••' : 'Tối thiểu 6 ký tự'}
            maxLength={72}
          />
          {errors.password && <span className={styles.errMsg}>{errors.password}</span>}
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
            <label>Vai trò <span className={styles.required}>*</span></label>
            <select
              value={values.role}
              onChange={(e) => setField('role', e.target.value)}
            >
              <option value="staff">Nhân viên</option>
              <option value="manager">Quản lý</option>
              <option value="admin">Quản trị</option>
            </select>
          </div>
        </div>

        {isEdit && (
          <div className={styles.formGroup}>
            <label>Trạng thái</label>
            <div className={styles.radioRow}>
              <label className={styles.radio}>
                <input
                  type="radio"
                  checked={values.is_active === 1}
                  onChange={() => setField('is_active', 1)}
                />
                <span>Hoạt động</span>
              </label>
              <label className={styles.radio}>
                <input
                  type="radio"
                  checked={values.is_active === 0}
                  onChange={() => setField('is_active', 0)}
                />
                <span>Vô hiệu hoá</span>
              </label>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default StaffForm;
