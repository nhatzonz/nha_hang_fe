import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { restaurantService } from '../../services/restaurantService';
import styles from './Settings.module.scss';

const defaultValues = {
  name: '',
  address: '',
  phone: '',
  email: '',
  open_time: '08:00',
  close_time: '22:00',
  description: '',
  tax_code: '',
  wifi_password: '',
};

const RestaurantInfoTab = () => {
  const [values, setValues] = useState(defaultValues);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    restaurantService.getInfo()
      .then(({ data }) => {
        if (data) {
          setValues({
            name: data.name || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            open_time: (data.open_time || '08:00:00').slice(0, 5),
            close_time: (data.close_time || '22:00:00').slice(0, 5),
            description: data.description || '',
            tax_code: data.tax_code || '',
            wifi_password: data.wifi_password || '',
          });
        }
      })
      .catch(() => toast.error('Không tải được thông tin nhà hàng'))
      .finally(() => setLoading(false));
  }, []);

  const setField = (name, val) => setValues((v) => ({ ...v, [name]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.name.trim()) return toast.error('Vui lòng nhập tên nhà hàng');

    setSaving(true);
    try {
      const payload = {};
      Object.entries(values).forEach(([k, v]) => {
        const val = typeof v === 'string' ? v.trim() : v;
        if (val || val === '') payload[k] = val || undefined;
      });
      payload.name = values.name.trim();
      await restaurantService.update(payload);
      toast.success('Đã cập nhật thông tin nhà hàng');
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>Đang tải...</div>;

  return (
    <div className={styles.card}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h3>Thông tin chung</h3>

          <div className={styles.formGroup}>
            <label>Tên nhà hàng <span className={styles.required}>*</span></label>
            <input
              type="text"
              value={values.name}
              onChange={(e) => setField('name', e.target.value)}
              maxLength={150}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Địa chỉ</label>
            <input
              type="text"
              value={values.address}
              onChange={(e) => setField('address', e.target.value)}
              placeholder="VD: 56 Đường Trần Phú, Quận Hải Châu, TP. Đà Nẵng"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Số điện thoại</label>
              <input
                type="text"
                value={values.phone}
                onChange={(e) => setField('phone', e.target.value)}
                placeholder="0236 3888 999"
                maxLength={20}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                value={values.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="contact@nhahang.com"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Mô tả</label>
            <textarea
              rows={3}
              value={values.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Giới thiệu ngắn về nhà hàng — hiển thị ở trang đăng nhập và chatbot"
            />
          </div>
        </div>

        <div className={styles.formSection}>
          <h3>Giờ hoạt động</h3>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Giờ mở cửa</label>
              <input type="time" value={values.open_time} onChange={(e) => setField('open_time', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>Giờ đóng cửa</label>
              <input type="time" value={values.close_time} onChange={(e) => setField('close_time', e.target.value)} />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h3>Thông tin bổ sung (in trên hoá đơn)</h3>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Mã số thuế</label>
              <input
                type="text"
                value={values.tax_code}
                onChange={(e) => setField('tax_code', e.target.value)}
                maxLength={50}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Mật khẩu Wi-Fi</label>
              <input
                type="text"
                value={values.wifi_password}
                onChange={(e) => setField('wifi_password', e.target.value)}
                maxLength={100}
              />
            </div>
          </div>
        </div>

        <button type="submit" className={styles.btnPrimary} disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>
    </div>
  );
};

export default RestaurantInfoTab;
