import React, { useCallback, useEffect, useState } from 'react';
import Modal from '../../components/common/Modal';
import CustomerPicker from './CustomerPicker';
import { tableService } from '../../services/tableService';
import { formatCurrency, formatPhone } from '../../utils/format';
import styles from './Reservation.module.scss';

const toDateStr = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

const defaultValues = () => ({
  table_id: '',
  reservation_date: toDateStr(new Date()),
  reservation_time: '19:00',
  guest_count: 2,
  note: '',
});

const ReservationForm = ({ open, onClose, onSubmit, initial }) => {
  const isEdit = !!initial;
  const [values, setValues] = useState(defaultValues());
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [tables, setTables] = useState([]);

  // Selected customer info — either existing (has id) or new (no id, will be auto-created by BE)
  const [customer, setCustomer] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const loadTables = useCallback(async () => {
    try {
      const { data } = await tableService.list();
      setTables(data);
    } catch {}
  }, []);

  useEffect(() => {
    if (open) {
      loadTables();
      setValues(initial ? {
        table_id: initial.table_id || '',
        reservation_date: initial.reservation_date || toDateStr(new Date()),
        reservation_time: (initial.reservation_time || '19:00:00').slice(0, 5),
        guest_count: initial.guest_count || 2,
        note: initial.note || '',
      } : defaultValues());
      setErrors({});

      if (initial?.customer) {
        setCustomer({
          isNew: false,
          id: initial.customer.id,
          full_name: initial.customer.full_name,
          phone: initial.customer.phone,
          email: initial.customer.email,
          total_orders: initial.customer.total_orders,
          total_spent: initial.customer.total_spent,
        });
      } else if (initial) {
        // Reservation cũ chưa có customer (legacy) — load từ customer_name/phone của reservation
        setCustomer({
          isNew: false,
          full_name: initial.customer_name,
          phone: initial.phone,
          email: initial.email,
        });
      } else {
        setCustomer(null);
      }
    }
  }, [open, initial, loadTables]);

  const setField = (name, val) => {
    setValues((v) => ({ ...v, [name]: val }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};

    if (!customer) errs.customer = 'Vui lòng chọn khách hàng';
    if (!values.reservation_date) errs.reservation_date = 'Chọn ngày';
    if (!values.reservation_time) errs.reservation_time = 'Chọn giờ';
    if (!values.guest_count || Number(values.guest_count) < 1) errs.guest_count = 'Số khách ≥ 1';

    if (values.table_id) {
      const table = tables.find((t) => t.id === Number(values.table_id));
      if (table && Number(values.guest_count) > table.capacity) {
        errs.guest_count = `Bàn ${table.name} chỉ chứa ${table.capacity} người`;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // BE auto-link hoặc tạo mới customer theo phone
      const payload = {
        customer_name: customer.full_name,
        phone: customer.phone,
        reservation_date: values.reservation_date,
        reservation_time: values.reservation_time,
        guest_count: Number(values.guest_count),
      };
      if (customer.email) payload.email = customer.email;
      if (values.table_id) payload.table_id = Number(values.table_id);
      if (values.note.trim()) payload.note = values.note.trim();

      // Staff tạo → confirm ngay (block bàn nếu có)
      if (!isEdit) payload.status = 'confirmed';

      await onSubmit(payload);
    } catch {
      // Toast ở parent
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectCustomer = (data) => {
    setCustomer(data);
    setPickerOpen(false);
    setErrors((e) => ({ ...e, customer: undefined }));
  };

  return (
    <>
      <Modal
        open={open}
        onClose={submitting ? undefined : onClose}
        title={isEdit ? 'Sửa đặt bàn' : 'Tạo đặt bàn mới'}
        footer={
          <>
            <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={submitting}>
              Huỷ
            </button>
            <button type="submit" form="reservation-form" className={styles.btnPrimary} disabled={submitting}>
              {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo đặt bàn'}
            </button>
          </>
        }
      >
        <form id="reservation-form" onSubmit={handleSubmit} className={styles.form}>
          {/* Customer section */}
          <div className={styles.formGroup}>
            <label>Khách hàng <span className={styles.required}>*</span></label>
            {!customer ? (
              <button
                type="button"
                className={styles.pickCustomerBtn}
                onClick={() => setPickerOpen(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                <span>Chọn khách hàng</span>
              </button>
            ) : (
              <div className={styles.customerSelected}>
                <div className={styles.customerSelectedIcon}>
                  {customer.isNew ? '🆕' : '⭐'}
                </div>
                <div className={styles.customerSelectedInfo}>
                  <strong>{customer.full_name}</strong>
                  <span className={styles.muted}>
                    {customer.phone ? formatPhone(customer.phone) : '—'}
                    {customer.email && ` · ${customer.email}`}
                  </span>
                  {!customer.isNew && Number(customer.total_orders) > 0 && (
                    <span className={styles.customerStats}>
                      🛒 {customer.total_orders} đơn · 💰 {formatCurrency(customer.total_spent || 0)}
                      <span className={styles.vipTag}>Khách quen</span>
                    </span>
                  )}
                  {customer.isNew && (
                    <span className={styles.newTag}>Khách mới — sẽ được tạo khi bấm "Tạo đặt bàn"</span>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={() => setPickerOpen(true)}
                >
                  Đổi
                </button>
              </div>
            )}
            {errors.customer && <span className={styles.errMsg}>{errors.customer}</span>}
          </div>

          {/* Date / Time */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Ngày <span className={styles.required}>*</span></label>
              <input
                type="date"
                value={values.reservation_date}
                onChange={(e) => setField('reservation_date', e.target.value)}
                min={toDateStr(new Date())}
              />
              {errors.reservation_date && <span className={styles.errMsg}>{errors.reservation_date}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Giờ <span className={styles.required}>*</span></label>
              <input
                type="time"
                value={values.reservation_time}
                onChange={(e) => setField('reservation_time', e.target.value)}
              />
              {errors.reservation_time && <span className={styles.errMsg}>{errors.reservation_time}</span>}
            </div>
          </div>

          {/* Guest / Table */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Số khách <span className={styles.required}>*</span></label>
              <input
                type="number"
                min={1}
                value={values.guest_count}
                onChange={(e) => setField('guest_count', e.target.value)}
              />
              {errors.guest_count && <span className={styles.errMsg}>{errors.guest_count}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Bàn (tuỳ chọn)</label>
              <select
                value={values.table_id}
                onChange={(e) => setField('table_id', e.target.value)}
              >
                <option value="">Chưa chọn bàn</option>
                {tables.map((t) => (
                  <option key={t.id} value={t.id} disabled={t.status === 'occupied'}>
                    {t.name} ({t.capacity} người · {t.status === 'available' ? 'Trống' : t.status === 'reserved' ? 'Đã đặt' : 'Có khách'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Ghi chú</label>
            <textarea
              rows={2}
              value={values.note}
              onChange={(e) => setField('note', e.target.value)}
              placeholder="VD: Sinh nhật, ghế cao cho trẻ em..."
            />
          </div>
        </form>
      </Modal>

      <CustomerPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelectCustomer}
      />
    </>
  );
};

export default ReservationForm;
