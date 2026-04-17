import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import Modal from '../../components/common/Modal';
import { bankAccountService } from '../../services/bankAccountService';
import { formatCurrency, formatPriceInput, parsePriceInput } from '../../utils/format';
import styles from './Payment.module.scss';

/**
 * Sinh URL VietQR image.
 * Format: https://img.vietqr.io/image/{BIN}-{ACCOUNT}-{TEMPLATE}.png?amount=X&addInfo=Y&accountName=Z
 */
const buildVietQRUrl = (bank, amount, content) => {
  if (!bank) return null;
  const params = new URLSearchParams({
    amount: String(amount),
    addInfo: content,
    accountName: bank.account_name,
  });
  return `https://img.vietqr.io/image/${bank.bank_bin}-${bank.account_number}-compact2.png?${params.toString()}`;
};

const PaymentModal = ({ open, onClose, order, onConfirm, submitting }) => {
  const [tab, setTab] = useState('cash');
  const [bank, setBank] = useState(null);
  const [loadingBank, setLoadingBank] = useState(false);
  const [cashGiven, setCashGiven] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (open) {
      setTab('cash');
      setCashGiven('');
      setCopied('');
      setLoadingBank(true);
      bankAccountService.getActive()
        .then((res) => setBank(res.data))
        .catch(() => setBank(null))
        .finally(() => setLoadingBank(false));
    }
  }, [open]);

  const amount = Number(order?.final_amount || 0);
  const content = order?.order_code || '';

  const cashNum = parsePriceInput(cashGiven) || 0;
  const change = cashNum - amount;

  const qrUrl = useMemo(() => buildVietQRUrl(bank, amount, content), [bank, amount, content]);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1500);
  };

  const handleConfirm = () => {
    if (tab === 'cash' && cashNum < amount) {
      toast.error('Tiền khách đưa chưa đủ');
      return;
    }
    onConfirm(tab);
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? undefined : onClose}
      title="Thanh toán đơn hàng"
      size="md"
      footer={
        <>
          <button className={styles.btnSecondary} onClick={onClose} disabled={submitting}>
            Huỷ
          </button>
          <button
            className={styles.btnPrimary}
            onClick={handleConfirm}
            disabled={submitting || (tab === 'qr' && !bank)}
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận đã thanh toán'}
          </button>
        </>
      }
    >
      {/* Order summary */}
      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span>Mã đơn</span>
          <strong className={styles.orderCode}>{order?.order_code}</strong>
        </div>
        <div className={styles.summaryRow}>
          <span>Bàn</span>
          <strong>{order?.table?.name || '—'}</strong>
        </div>
        <div className={styles.summaryTotal}>
          <span>Thành tiền</span>
          <strong>{formatCurrency(amount)}</strong>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'cash' ? styles.tabActive : ''}`}
          onClick={() => setTab('cash')}
          type="button"
        >
          Tiền mặt
        </button>
        <button
          className={`${styles.tab} ${tab === 'qr' ? styles.tabActive : ''}`}
          onClick={() => setTab('qr')}
          type="button"
        >
          Chuyển khoản QR
        </button>
      </div>

      {/* Cash */}
      {tab === 'cash' && (
        <div className={styles.cashBox}>
          <div className={styles.formGroup}>
            <label>Khách đưa</label>
            <input
              type="text"
              inputMode="numeric"
              value={cashGiven}
              onChange={(e) => setCashGiven(formatPriceInput(e.target.value))}
              placeholder={formatCurrency(amount)}
              autoFocus
            />
          </div>

          {/* Suggestion chips */}
          <div className={styles.cashChips}>
            {[amount, 500000, 1000000, 2000000, 5000000]
              .filter((v, i, arr) => arr.indexOf(v) === i && v >= amount)
              .slice(0, 5)
              .map((v) => (
                <button
                  key={v}
                  type="button"
                  className={styles.cashChip}
                  onClick={() => setCashGiven(formatPriceInput(v))}
                >
                  {formatCurrency(v)}
                </button>
              ))}
          </div>

          <div className={styles.changeBox}>
            <span>Tiền thừa trả khách</span>
            <strong className={change < 0 ? styles.changeNeg : styles.changePos}>
              {change >= 0 ? formatCurrency(change) : `Thiếu ${formatCurrency(-change)}`}
            </strong>
          </div>
        </div>
      )}

      {/* QR */}
      {tab === 'qr' && (
        <div className={styles.qrBox}>
          {loadingBank ? (
            <div className={styles.qrEmpty}>Đang tải thông tin ngân hàng...</div>
          ) : !bank ? (
            <div className={styles.qrEmpty}>
              <span>⚠️</span>
              <p>
                Chưa có tài khoản ngân hàng được kích hoạt.
                <br />
                Admin vào <strong>Cài đặt → Tài khoản ngân hàng</strong> để thêm và kích hoạt.
              </p>
            </div>
          ) : (
            <>
              <img src={qrUrl} alt="QR Thanh toán" className={styles.qrImage} />

              <div className={styles.bankInfo}>
                <div className={styles.bankRow}>
                  <span>Ngân hàng</span>
                  <strong>{bank.bank_name}</strong>
                </div>
                <div className={styles.bankRow}>
                  <span>Số tài khoản</span>
                  <div className={styles.copyCell}>
                    <strong>{bank.account_number}</strong>
                    <button
                      type="button"
                      className={styles.copyBtn}
                      onClick={() => copyToClipboard(bank.account_number, 'account')}
                    >
                      {copied === 'account' ? '✓' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className={styles.bankRow}>
                  <span>Chủ tài khoản</span>
                  <strong>{bank.account_name}</strong>
                </div>
                <div className={styles.bankRow}>
                  <span>Số tiền</span>
                  <div className={styles.copyCell}>
                    <strong style={{ color: '#c0392b' }}>{formatCurrency(amount)}</strong>
                    <button
                      type="button"
                      className={styles.copyBtn}
                      onClick={() => copyToClipboard(String(amount), 'amount')}
                    >
                      {copied === 'amount' ? '✓' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className={styles.bankRow}>
                  <span>Nội dung</span>
                  <div className={styles.copyCell}>
                    <strong>{content}</strong>
                    <button
                      type="button"
                      className={styles.copyBtn}
                      onClick={() => copyToClipboard(content, 'content')}
                    >
                      {copied === 'content' ? '✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              <p className={styles.qrHint}>
                Khách quét QR bằng app ngân hàng. Khi đã nhận được tiền, bấm <strong>"Xác nhận đã thanh toán"</strong> để hoàn tất đơn.
              </p>
            </>
          )}
        </div>
      )}
    </Modal>
  );
};

export default PaymentModal;
