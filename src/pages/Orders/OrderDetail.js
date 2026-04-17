import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../../components/common/Layout';
import Header from '../../components/common/Header';
import Modal from '../../components/common/Modal';
import AddItemsModal from './AddItemsModal';
import PaymentModal from './PaymentModal';
import OrderPaymentQR from './OrderPaymentQR';
import {
  orderService,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_FLOW,
  NEXT_STATUS_LABELS,
} from '../../services/orderService';
import { formatCurrency, formatDateTime, formatPhone } from '../../utils/format';
import styles from './Order.module.scss';

const statusClass = {
  pending: styles.badgePending,
  preparing: styles.badgePreparing,
  served: styles.badgeServed,
  completed: styles.badgeCompleted,
  cancelled: styles.badgeCancelled,
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);

  const [addItemsOpen, setAddItemsOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [editingDetailId, setEditingDetailId] = useState(null);
  const [editQty, setEditQty] = useState(1);
  const [editNote, setEditNote] = useState('');

  const [deleteDetail, setDeleteDetail] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await orderService.getById(id);
      setOrder(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không tải được đơn hàng');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetch(); }, [fetch]);

  const advanceStatus = async () => {
    if (!order) return;
    // Ở trạng thái served → completed: mở modal thanh toán thay vì chuyển thẳng
    if (order.status === 'served') {
      setPaymentOpen(true);
      return;
    }
    const next = ORDER_STATUS_FLOW[order.status];
    if (!next) return;
    setChanging(true);
    try {
      await orderService.changeStatus(order.id, { status: next });
      toast.success('Đã cập nhật trạng thái');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setChanging(false);
    }
  };

  const confirmPayment = async () => {
    setChanging(true);
    try {
      await orderService.changeStatus(order.id, { status: 'completed' });
      toast.success('Đã thanh toán thành công');
      setPaymentOpen(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thanh toán thất bại');
    } finally {
      setChanging(false);
    }
  };

  const cancelOrder = async () => {
    setChanging(true);
    try {
      await orderService.changeStatus(order.id, {
        status: 'cancelled',
        cancelled_reason: cancelReason.trim() || undefined,
      });
      toast.success('Đã huỷ đơn hàng');
      setCancelOpen(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Huỷ thất bại');
    } finally {
      setChanging(false);
    }
  };

  const handleAddItems = async (items) => {
    try {
      await orderService.addItems(order.id, items);
      toast.success(`Đã thêm ${items.length} món`);
      fetch();
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Thêm món thất bại');
      throw err;
    }
  };

  const startEdit = (detail) => {
    setEditingDetailId(detail.id);
    setEditQty(detail.quantity);
    setEditNote(detail.note || '');
  };

  const cancelEdit = () => {
    setEditingDetailId(null);
  };

  const saveEdit = async (detailId) => {
    if (editQty < 1) {
      toast.error('Số lượng tối thiểu 1');
      return;
    }
    setChanging(true);
    try {
      await orderService.updateItem(order.id, detailId, {
        quantity: editQty,
        note: editNote,
      });
      toast.success('Đã cập nhật món');
      setEditingDetailId(null);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setChanging(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteDetail) return;
    setChanging(true);
    try {
      await orderService.removeItem(order.id, deleteDetail.id);
      toast.success('Đã xoá món');
      setDeleteDetail(null);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xoá thất bại');
    } finally {
      setChanging(false);
    }
  };

  if (loading || !order) {
    return <Layout><div className={styles.empty}>Đang tải...</div></Layout>;
  }

  const isTerminal = order.status === 'completed' || order.status === 'cancelled';
  const nextStatus = ORDER_STATUS_FLOW[order.status];
  // Cho phép thêm / sửa / xoá món ở mọi trạng thái (kể cả đơn đã hoàn thành)
  const canAddItems = true;
  const canEditItems = true;

  return (
    <Layout>
      <Header
        title={`Đơn hàng ${order.order_code}`}
        subtitle={`Tạo lúc ${formatDateTime(order.created_at)}`}
      />

      <div className={styles.detailLayout}>
        {/* Left: Items */}
        <div className={styles.card}>
          <div className={styles.cardHeaderRow}>
            <h3 className={styles.sectionTitle}>Chi tiết món ({order.order_details.length})</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className={`${styles.badge} ${statusClass[order.status]}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
              {canAddItems && (
                <button className={styles.btnPrimary} onClick={() => setAddItemsOpen(true)}>
                  + Thêm món
                </button>
              )}
            </div>
          </div>

          <table className={styles.detailsTable}>
            <thead>
              <tr>
                <th>Món</th>
                <th style={{ width: 120, textAlign: 'center' }}>SL</th>
                <th style={{ textAlign: 'right' }}>Đơn giá</th>
                <th style={{ textAlign: 'right' }}>Thành tiền</th>
                {canEditItems && <th style={{ width: 90 }}></th>}
              </tr>
            </thead>
            <tbody>
              {order.order_details.map((d) => {
                const isEditing = editingDetailId === d.id;
                return (
                  <tr key={d.id}>
                    <td>
                      <div>
                        <strong>{d.menu_item?.name || 'Món đã xoá'}</strong>
                        {isEditing ? (
                          <input
                            type="text"
                            className={styles.inlineInput}
                            placeholder="Ghi chú món..."
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                          />
                        ) : (
                          d.note && <div className={styles.itemNote}>{d.note}</div>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isEditing ? (
                        <div className={styles.qtyInline}>
                          <button onClick={() => setEditQty(Math.max(1, editQty - 1))}>−</button>
                          <span>{editQty}</span>
                          <button onClick={() => setEditQty(editQty + 1)}>+</button>
                        </div>
                      ) : (
                        d.quantity
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(d.unit_price)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatCurrency(
                        isEditing ? Number(d.unit_price) * editQty : d.subtotal,
                      )}
                    </td>
                    {canEditItems && (
                      <td>
                        <div className={styles.rowActions}>
                          {isEditing ? (
                            <>
                              <button
                                className={styles.iconBtnPrimary}
                                onClick={() => saveEdit(d.id)}
                                disabled={changing}
                                title="Lưu"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <polyline points="20 6 9 17 4 12"/>
                                </svg>
                              </button>
                              <button
                                className={styles.iconBtn}
                                onClick={cancelEdit}
                                title="Huỷ"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className={styles.iconBtn}
                                onClick={() => startEdit(d)}
                                title="Sửa"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                              <button
                                className={`${styles.iconBtn} ${styles.danger}`}
                                onClick={() => setDeleteDetail(d)}
                                title="Xoá"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {order.note && (
            <div className={styles.orderNote}>
              <strong>Ghi chú đơn:</strong> {order.note}
            </div>
          )}

          {order.cancelled_reason && (
            <div className={styles.cancelNote}>
              <strong>Lý do huỷ:</strong> {order.cancelled_reason}
            </div>
          )}
        </div>

        {/* Right: Info + Actions */}
        <div className={styles.sideCol}>
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Thông tin</h3>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span>Bàn</span>
                <strong>{order.table?.name || '—'}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Khách hàng</span>
                <strong>
                  {order.customer ? (
                    <>
                      {order.customer.full_name}
                      {order.customer.phone && (
                        <div className={styles.muted}>{formatPhone(order.customer.phone)}</div>
                      )}
                    </>
                  ) : 'Khách lẻ'}
                </strong>
              </div>
              <div className={styles.infoRow}>
                <span>Nhân viên</span>
                <strong>{order.staff?.full_name || '—'}</strong>
              </div>
              {order.completed_at && (
                <div className={styles.infoRow}>
                  <span>Thanh toán lúc</span>
                  <strong>{formatDateTime(order.completed_at)}</strong>
                </div>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Tổng tiền</h3>
            <div className={styles.totalList}>
              <div className={styles.totalRow}>
                <span>Tạm tính</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className={styles.totalRow}>
                  <span>Giảm giá</span>
                  <span>- {formatCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className={styles.totalFinal}>
                <span>Thành tiền</span>
                <strong>{formatCurrency(order.final_amount)}</strong>
              </div>
            </div>
          </div>

          {!isTerminal && <OrderPaymentQR order={order} />}

          {!isTerminal && (
            <div className={styles.card}>
              <h3 className={styles.sectionTitle}>Thao tác</h3>
              <div className={styles.actionsStack}>
                {nextStatus && (
                  <button
                    className={styles.btnPrimary}
                    onClick={advanceStatus}
                    disabled={changing}
                  >
                    {NEXT_STATUS_LABELS[order.status]} →
                  </button>
                )}
                <button
                  className={styles.btnDangerOutline}
                  onClick={() => setCancelOpen(true)}
                  disabled={changing}
                >
                  Huỷ đơn
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add items modal */}
      <AddItemsModal
        open={addItemsOpen}
        onClose={() => setAddItemsOpen(false)}
        onSubmit={handleAddItems}
      />

      {/* Payment modal */}
      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        order={order}
        onConfirm={confirmPayment}
        submitting={changing}
      />

      {/* Delete item confirm */}
      <Modal
        open={!!deleteDetail}
        onClose={() => setDeleteDetail(null)}
        title="Xoá món khỏi đơn"
        size="sm"
        footer={
          <>
            <button className={styles.btnSecondary} onClick={() => setDeleteDetail(null)} disabled={changing}>Huỷ</button>
            <button className={styles.btnDanger} onClick={handleDeleteItem} disabled={changing}>
              {changing ? 'Đang xoá...' : 'Xoá'}
            </button>
          </>
        }
      >
        <p>Bạn có chắc muốn xoá <strong>{deleteDetail?.menu_item?.name}</strong> khỏi đơn?</p>
      </Modal>

      {/* Cancel order modal */}
      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Huỷ đơn hàng"
        size="sm"
        footer={
          <>
            <button className={styles.btnSecondary} onClick={() => setCancelOpen(false)} disabled={changing}>
              Đóng
            </button>
            <button className={styles.btnDanger} onClick={cancelOrder} disabled={changing}>
              {changing ? 'Đang huỷ...' : 'Xác nhận huỷ'}
            </button>
          </>
        }
      >
        <p>Bạn có chắc muốn huỷ đơn <strong>{order.order_code}</strong>?</p>
        <div className={styles.formGroup} style={{ marginTop: 12 }}>
          <label>Lý do huỷ</label>
          <textarea
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="VD: Khách đổi ý, hết nguyên liệu..."
          />
        </div>
      </Modal>
    </Layout>
  );
};

export default OrderDetail;
