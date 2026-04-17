import React, { useCallback, useEffect, useState } from 'react';
import Modal from '../../components/common/Modal';
import { customerService } from '../../services/customerService';
import { formatPhone, formatCurrency } from '../../utils/format';
import styles from './Reservation.module.scss';

const defaultNew = { full_name: '', phone: '', email: '' };

const CustomerPicker = ({ open, onClose, onSelect }) => {
  const [tab, setTab] = useState('existing'); // 'existing' | 'new'

  // Existing
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // New
  const [newCustomer, setNewCustomer] = useState(defaultNew);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setTab('existing');
      setSearchInput('');
      setSearch('');
      setNewCustomer(defaultNew);
      setErrors({});
    }
  }, [open]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await customerService.list({
        search: search || undefined,
        limit: 20,
        page: 1,
      });
      setCustomers(data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (open && tab === 'existing') loadCustomers();
  }, [open, tab, loadCustomers]);

  const handlePickExisting = (c) => {
    onSelect({
      isNew: false,
      id: c.id,
      full_name: c.full_name,
      phone: c.phone,
      email: c.email,
      total_orders: c.total_orders,
      total_spent: c.total_spent,
    });
  };

  const validateNew = () => {
    const errs = {};
    const name = newCustomer.full_name.trim();
    const phone = newCustomer.phone.trim();
    const email = newCustomer.email.trim();

    if (!name) errs.full_name = 'Vui lòng nhập tên';
    if (!/^0[0-9]{9}$/.test(phone)) errs.phone = 'SĐT phải 10 số bắt đầu bằng 0';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email không hợp lệ';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUseNew = () => {
    if (!validateNew()) return;
    onSelect({
      isNew: true,
      full_name: newCustomer.full_name.trim(),
      phone: newCustomer.phone.trim(),
      email: newCustomer.email.trim().toLowerCase() || undefined,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Chọn khách hàng" size="md">
      <div className={styles.pickerTabs}>
        <button
          className={`${styles.pickerTab} ${tab === 'existing' ? styles.pickerTabActive : ''}`}
          onClick={() => setTab('existing')}
        >
          Khách có sẵn
        </button>
        <button
          className={`${styles.pickerTab} ${tab === 'new' ? styles.pickerTabActive : ''}`}
          onClick={() => setTab('new')}
        >
          + Khách mới
        </button>
      </div>

      {tab === 'existing' ? (
        <div className={styles.pickerExisting}>
          <div className={styles.pickerSearch}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Tìm theo tên hoặc SĐT..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              autoFocus
            />
          </div>

          <div className={styles.pickerList}>
            {loading ? (
              <div className={styles.pickerEmpty}>Đang tải...</div>
            ) : customers.length === 0 ? (
              <div className={styles.pickerEmpty}>
                Không tìm thấy khách. Bạn có thể chuyển sang tab "+ Khách mới" để tạo.
              </div>
            ) : customers.map((c) => (
              <button
                key={c.id}
                type="button"
                className={styles.pickerItem}
                onClick={() => handlePickExisting(c)}
              >
                <div className={styles.pickerItemMain}>
                  <strong>{c.full_name}</strong>
                  <span className={styles.muted}>
                    {c.phone ? formatPhone(c.phone) : 'Không có SĐT'}
                    {c.email && ` · ${c.email}`}
                  </span>
                </div>
                <div className={styles.pickerItemStats}>
                  <span>{c.total_orders || 0} đơn</span>
                  <span className={styles.spent}>{formatCurrency(c.total_spent || 0)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.pickerNew}>
          <div className={styles.formGroup}>
            <label>Tên khách <span className={styles.required}>*</span></label>
            <input
              type="text"
              value={newCustomer.full_name}
              onChange={(e) => setNewCustomer((v) => ({ ...v, full_name: e.target.value }))}
              maxLength={100}
              placeholder="VD: Nguyễn Văn A"
              autoFocus
            />
            {errors.full_name && <span className={styles.errMsg}>{errors.full_name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>SĐT <span className={styles.required}>*</span></label>
            <input
              type="text"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer((v) => ({ ...v, phone: e.target.value.replace(/\D/g, '') }))}
              maxLength={10}
              inputMode="numeric"
              placeholder="0912345678"
            />
            {errors.phone && <span className={styles.errMsg}>{errors.phone}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Email (tuỳ chọn)</label>
            <input
              type="email"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer((v) => ({ ...v, email: e.target.value }))}
              maxLength={100}
              placeholder="email@example.com"
            />
            {errors.email && <span className={styles.errMsg}>{errors.email}</span>}
          </div>

          <button type="button" className={styles.pickerUseNewBtn} onClick={handleUseNew}>
            Dùng khách này
          </button>

          <p className={styles.pickerHint}>
            💡 Khách mới sẽ được lưu vào hệ thống khi bạn ấn "Tạo đặt bàn".
          </p>
        </div>
      )}
    </Modal>
  );
};

export default CustomerPicker;
