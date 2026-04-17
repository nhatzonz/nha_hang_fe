import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import Modal from '../../components/common/Modal';
import { bankAccountService } from '../../services/bankAccountService';
import styles from './Settings.module.scss';

// Danh sách ngân hàng VN phổ biến + BIN (để chọn nhanh)
const BANKS = [
  { bin: '970436', name: 'Vietcombank' },
  { bin: '970415', name: 'VietinBank' },
  { bin: '970418', name: 'BIDV' },
  { bin: '970405', name: 'Agribank' },
  { bin: '970422', name: 'MB Bank' },
  { bin: '970432', name: 'VPBank' },
  { bin: '970407', name: 'Techcombank' },
  { bin: '970423', name: 'TPBank' },
  { bin: '970443', name: 'SHB' },
  { bin: '970403', name: 'Sacombank' },
  { bin: '970437', name: 'HDBank' },
  { bin: '970454', name: 'VIB' },
  { bin: '970416', name: 'ACB' },
  { bin: '970448', name: 'OCB' },
  { bin: '970441', name: 'VIB' },
  { bin: '970429', name: 'SCB' },
];

const defaultForm = {
  bank_bin: '',
  bank_name: '',
  account_number: '',
  account_name: '',
};

const BankAccountsTab = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await bankAccountService.list();
      setAccounts(data);
    } catch {
      toast.error('Không tải được danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (acc) => {
    setEditing(acc);
    setForm({
      bank_bin: acc.bank_bin,
      bank_name: acc.bank_name,
      account_number: acc.account_number,
      account_name: acc.account_name,
    });
    setErrors({});
    setFormOpen(true);
  };

  const onBankChange = (bin) => {
    const bank = BANKS.find((b) => b.bin === bin);
    setForm((f) => ({ ...f, bank_bin: bin, bank_name: bank?.name || '' }));
    setErrors((e) => ({ ...e, bank_bin: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.bank_bin) errs.bank_bin = 'Chọn ngân hàng';
    if (!/^[0-9]{6,30}$/.test(form.account_number)) errs.account_number = 'Số tài khoản phải 6-30 chữ số';
    if (!form.account_name.trim()) errs.account_name = 'Nhập chủ tài khoản';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        bank_bin: form.bank_bin,
        bank_name: form.bank_name,
        account_number: form.account_number,
        account_name: form.account_name.trim().toUpperCase(),
      };
      if (editing) {
        await bankAccountService.update(editing.id, payload);
        toast.success('Đã cập nhật tài khoản');
      } else {
        await bankAccountService.create(payload);
        toast.success('Đã thêm tài khoản');
      }
      setFormOpen(false);
      fetch();
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (acc) => {
    try {
      await bankAccountService.activate(acc.id);
      toast.success(`Đã kích hoạt ${acc.bank_name}`);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kích hoạt thất bại');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await bankAccountService.remove(deleteTarget.id);
      toast.success('Đã xoá tài khoản');
      setDeleteTarget(null);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xoá thất bại');
    }
  };

  return (
    <div>
      <div className={styles.bankHeader}>
        <div>
          <h3>Tài khoản nhận thanh toán</h3>
          <p className={styles.muted}>
            Tài khoản đang <strong>kích hoạt</strong> sẽ được dùng sinh mã QR cho khách thanh toán.
          </p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}>
          + Thêm tài khoản
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Đang tải...</div>
      ) : accounts.length === 0 ? (
        <div className={styles.emptyCard}>
          <span>💳</span>
          <p>Chưa có tài khoản ngân hàng. Thêm tài khoản đầu tiên để nhận thanh toán qua QR.</p>
        </div>
      ) : (
        <div className={styles.bankList}>
          {accounts.map((acc) => (
            <div key={acc.id} className={`${styles.bankCard} ${acc.is_active ? styles.bankActive : ''}`}>
              <div className={styles.bankCardMain}>
                <div className={styles.bankLogo}>
                  {acc.bank_name.charAt(0)}
                </div>
                <div className={styles.bankInfo}>
                  <div className={styles.bankNameRow}>
                    <strong>{acc.bank_name}</strong>
                    {acc.is_active === 1 && <span className={styles.activeBadge}>ĐANG DÙNG</span>}
                  </div>
                  <div className={styles.accNum}>{acc.account_number}</div>
                  <div className={styles.muted}>{acc.account_name}</div>
                </div>
              </div>

              <div className={styles.bankActions}>
                {acc.is_active !== 1 && (
                  <button className={styles.btnActivate} onClick={() => handleActivate(acc)}>
                    Kích hoạt
                  </button>
                )}
                <button className={styles.btnSecondary} onClick={() => openEdit(acc)}>
                  Sửa
                </button>
                <button
                  className={styles.btnDanger}
                  onClick={() => setDeleteTarget(acc)}
                  disabled={acc.is_active === 1}
                  title={acc.is_active === 1 ? 'Kích hoạt tài khoản khác trước khi xoá' : ''}
                >
                  Xoá
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      <Modal
        open={formOpen}
        onClose={saving ? undefined : () => setFormOpen(false)}
        title={editing ? 'Sửa tài khoản' : 'Thêm tài khoản ngân hàng'}
        footer={
          <>
            <button className={styles.btnSecondary} onClick={() => setFormOpen(false)} disabled={saving}>Huỷ</button>
            <button type="submit" form="bank-form" className={styles.btnPrimary} disabled={saving}>
              {saving ? 'Đang lưu...' : (editing ? 'Cập nhật' : 'Thêm')}
            </button>
          </>
        }
      >
        <form id="bank-form" onSubmit={handleSave} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Ngân hàng <span className={styles.required}>*</span></label>
            <select
              value={form.bank_bin}
              onChange={(e) => onBankChange(e.target.value)}
            >
              <option value="">-- Chọn ngân hàng --</option>
              {BANKS.map((b) => (
                <option key={b.bin} value={b.bin}>{b.name}</option>
              ))}
            </select>
            {errors.bank_bin && <span className={styles.errMsg}>{errors.bank_bin}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Số tài khoản <span className={styles.required}>*</span></label>
            <input
              type="text"
              value={form.account_number}
              onChange={(e) => setForm((f) => ({ ...f, account_number: e.target.value.replace(/\D/g, '') }))}
              maxLength={30}
              inputMode="numeric"
              placeholder="VD: 1234567890"
            />
            {errors.account_number && <span className={styles.errMsg}>{errors.account_number}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Chủ tài khoản <span className={styles.required}>*</span></label>
            <input
              type="text"
              value={form.account_name}
              onChange={(e) => setForm((f) => ({ ...f, account_name: e.target.value }))}
              maxLength={100}
              placeholder="NGUYEN VAN A"
              style={{ textTransform: 'uppercase' }}
            />
            {errors.account_name && <span className={styles.errMsg}>{errors.account_name}</span>}
            <span className={styles.hint}>Tên không dấu, đúng theo tài khoản ngân hàng</span>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Xoá tài khoản ngân hàng"
        size="sm"
        footer={
          <>
            <button className={styles.btnSecondary} onClick={() => setDeleteTarget(null)}>Huỷ</button>
            <button className={styles.btnDanger} onClick={handleDelete}>Xoá</button>
          </>
        }
      >
        <p>Bạn có chắc muốn xoá tài khoản <strong>{deleteTarget?.bank_name} · {deleteTarget?.account_number}</strong>?</p>
      </Modal>
    </div>
  );
};

export default BankAccountsTab;
