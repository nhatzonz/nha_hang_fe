import React, { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal';
import { bankAccountService } from '../../services/bankAccountService';
import { formatCurrency } from '../../utils/format';
import styles from './Payment.module.scss';

const buildVietQRUrl = (bank, amount, content) => {
  if (!bank) return null;
  const params = new URLSearchParams({
    amount: String(amount),
    addInfo: content,
    accountName: bank.account_name,
  });
  return `https://img.vietqr.io/image/${bank.bank_bin}-${bank.account_number}-compact2.png?${params.toString()}`;
};

/**
 * QR inline card hiển thị trong trang chi tiết đơn hàng.
 * Chỉ hiện khi order chưa terminal (pending/preparing/served).
 */
const OrderPaymentQR = ({ order }) => {
  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState('');
  const [zoomOpen, setZoomOpen] = useState(false);

  useEffect(() => {
    bankAccountService.getActive()
      .then((res) => setBank(res.data))
      .catch(() => setBank(null))
      .finally(() => setLoading(false));
  }, []);

  if (!order) return null;
  const amount = Number(order.final_amount || 0);
  const content = order.order_code || '';
  const qrUrl = buildVietQRUrl(bank, amount, content);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1500);
  };

  return (
    <div className={styles.qrCard}>
      <div className={styles.qrCardHeader}>
        <div className={styles.qrCardTitle}>
          <h3>Mã QR thanh toán</h3>
        </div>
        <button
          className={styles.qrToggle}
          onClick={() => setCollapsed((c) => !c)}
          type="button"
        >
          {collapsed ? 'Hiện' : 'Ẩn'}
        </button>
      </div>

      {!collapsed && (
        <>
          {loading ? (
            <div className={styles.qrInlineEmpty}>Đang tải...</div>
          ) : !bank ? (
            <div className={styles.qrInlineEmpty}>
              <span>⚠️ Chưa có tài khoản ngân hàng được kích hoạt.</span>
              <small>Admin vào Cài đặt → Tài khoản ngân hàng để thêm.</small>
            </div>
          ) : (
            <>
              <img
                src={qrUrl}
                alt="QR Thanh toán"
                className={styles.qrInlineImage}
                onClick={() => setZoomOpen(true)}
                title="Click để phóng to"
              />

              <div className={styles.qrInlineInfo}>
                <div className={styles.qrInlineRow}>
                  <span>Ngân hàng</span>
                  <strong>{bank.bank_name}</strong>
                </div>
                <div className={styles.qrInlineRow}>
                  <span>STK</span>
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
                <div className={styles.qrInlineRow}>
                  <span>Tên TK</span>
                  <strong>{bank.account_name}</strong>
                </div>
                <div className={styles.qrInlineRow}>
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
                <div className={styles.qrInlineRow}>
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
            </>
          )}
        </>
      )}

      {/* Zoom modal */}
      <Modal
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
        title="Quét QR để thanh toán"
        size="md"
      >
        {bank && qrUrl && (
          <div className={styles.qrZoomBox}>
            <img src={qrUrl} alt="QR Thanh toán" className={styles.qrZoomImage} />
            <div className={styles.qrZoomInfo}>
              <div className={styles.qrZoomRow}>
                <span>Ngân hàng</span>
                <strong>{bank.bank_name}</strong>
              </div>
              <div className={styles.qrZoomRow}>
                <span>Số tài khoản</span>
                <strong>{bank.account_number}</strong>
              </div>
              <div className={styles.qrZoomRow}>
                <span>Chủ TK</span>
                <strong>{bank.account_name}</strong>
              </div>
              <div className={styles.qrZoomAmount}>
                <span>Số tiền</span>
                <strong>{formatCurrency(amount)}</strong>
              </div>
              <div className={styles.qrZoomRow}>
                <span>Nội dung</span>
                <strong>{content}</strong>
              </div>
            </div>
            <p className={styles.qrZoomHint}>
              Mở app ngân hàng → quét QR → kiểm tra số tiền và nội dung trước khi chuyển.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderPaymentQR;
