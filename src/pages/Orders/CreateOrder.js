import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../../components/common/Layout';
import Header from '../../components/common/Header';
import { tableService } from '../../services/tableService';
import { menuService } from '../../services/menuService';
import { categoryService } from '../../services/categoryService';
import { customerService } from '../../services/customerService';
import { orderService } from '../../services/orderService';
import { formatCurrency, assetUrl } from '../../utils/format';
import styles from './CreateOrder.module.scss';

const STEPS = [
  { key: 1, label: 'Chọn bàn' },
  { key: 2, label: 'Chọn món' },
  { key: 3, label: 'Xác nhận' },
];

const CreateOrder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectTableId = searchParams.get('table_id');
  const preselectCustomerId = searchParams.get('customer_id');
  const reservationId = searchParams.get('reservation_id');

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Data
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Selection
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]); // [{menu_item, quantity, note}]
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderNote, setOrderNote] = useState('');

  // Filters step 2
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Load tables (only available) + preselect từ URL
  useEffect(() => {
    // Nếu có preselectTableId thì gọi API riêng lấy bàn đó (kể cả occupied)
    // vì luồng đặt bàn → khách đến, bàn đã occupied
    const loadTables = async () => {
      try {
        const { data } = await tableService.list(
          preselectTableId ? {} : { status: 'available' },
        );
        setTables(data);
        if (preselectTableId) {
          const found = data.find((t) => t.id === Number(preselectTableId));
          if (found) {
            setSelectedTable(found);
            setStep(2); // Skip sang chọn món
          }
        }
      } catch {
        toast.error('Không tải được danh sách bàn');
      }
    };
    loadTables();
    // eslint-disable-next-line
  }, []);

  // Preselect customer từ URL
  useEffect(() => {
    if (preselectCustomerId) {
      customerService.getById(preselectCustomerId)
        .then((res) => setSelectedCustomer(res.data))
        .catch(() => {});
    }
    // eslint-disable-next-line
  }, []);

  // Load categories & menu when step 2
  useEffect(() => {
    if (step === 2) {
      categoryService.list().then((res) => setCategories(res.data)).catch(() => {});
      loadMenu();
    }
    // eslint-disable-next-line
  }, [step, menuSearch, menuCategoryFilter]);

  const loadMenu = useCallback(async () => {
    try {
      const { data } = await menuService.list({
        search: menuSearch || undefined,
        category_id: menuCategoryFilter || undefined,
        is_available: 1,
        limit: 100,
      });
      setMenuItems(data.data);
    } catch {
      toast.error('Không tải được thực đơn');
    }
  }, [menuSearch, menuCategoryFilter]);

  // Load customers when step 3
  useEffect(() => {
    if (step === 3) loadCustomers();
    // eslint-disable-next-line
  }, [step, customerSearch]);

  const loadCustomers = useCallback(async () => {
    try {
      const { data } = await customerService.list({
        search: customerSearch || undefined,
        limit: 20,
      });
      setCustomers(data.data);
    } catch {}
  }, [customerSearch]);

  // Cart operations
  const addToCart = (item) => {
    setCart((c) => {
      const existing = c.find((x) => x.menu_item.id === item.id);
      if (existing) {
        return c.map((x) =>
          x.menu_item.id === item.id ? { ...x, quantity: x.quantity + 1 } : x,
        );
      }
      return [...c, { menu_item: item, quantity: 1, note: '' }];
    });
  };

  const updateQty = (itemId, delta) => {
    setCart((c) =>
      c
        .map((x) =>
          x.menu_item.id === itemId ? { ...x, quantity: Math.max(0, x.quantity + delta) } : x,
        )
        .filter((x) => x.quantity > 0),
    );
  };

  const removeFromCart = (itemId) => {
    setCart((c) => c.filter((x) => x.menu_item.id !== itemId));
  };

  const updateNote = (itemId, note) => {
    setCart((c) => c.map((x) => (x.menu_item.id === itemId ? { ...x, note } : x)));
  };

  const cartTotal = cart.reduce((sum, x) => sum + Number(x.menu_item.price) * x.quantity, 0);
  const cartCount = cart.reduce((sum, x) => sum + x.quantity, 0);

  const canNext = () => {
    if (step === 1) return !!selectedTable;
    if (step === 2) return cart.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        table_id: selectedTable.id,
        items: cart.map((x) => ({
          menu_item_id: x.menu_item.id,
          quantity: x.quantity,
          note: x.note || undefined,
        })),
      };
      if (selectedCustomer) payload.customer_id = selectedCustomer.id;
      if (orderNote.trim()) payload.note = orderNote.trim();
      // Nếu đơn này tạo từ đặt bàn → BE sẽ atomic mark reservation = completed
      if (reservationId) payload.reservation_id = Number(reservationId);

      const { data } = await orderService.create(payload);
      toast.success(`Đã tạo đơn ${data.order_code}`);
      navigate(`/orders/${data.id}`);
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Tạo đơn thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Header title="Tạo đơn hàng mới" />

      {/* Stepper */}
      <div className={styles.stepper}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className={`${styles.step} ${step === s.key ? styles.active : ''} ${step > s.key ? styles.done : ''}`}>
              <div className={styles.stepCircle}>
                {step > s.key ? '✓' : s.key}
              </div>
              <span className={styles.stepLabel}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${step > s.key ? styles.doneLine : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Choose table */}
      {step === 1 && (
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Chọn bàn trống</h3>
          {tables.length === 0 ? (
            <p className={styles.empty}>Không có bàn trống</p>
          ) : (
            <div className={styles.tableGrid}>
              {tables.map((t) => (
                <button
                  key={t.id}
                  className={`${styles.tableCard} ${selectedTable?.id === t.id ? styles.selected : ''}`}
                  onClick={() => setSelectedTable(t)}
                >
                  <span className={styles.tableCardName}>{t.name}</span>
                  <span className={styles.tableCardInfo}>{t.capacity} người</span>
                  {t.location && <span className={styles.tableCardLocation}>{t.location}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Choose menu */}
      {step === 2 && (
        <div className={styles.step2Layout}>
          <div className={styles.menuSection}>
            <div className={styles.menuToolbar}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Tìm món..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
              />
              <select
                className={styles.select}
                value={menuCategoryFilter}
                onChange={(e) => setMenuCategoryFilter(e.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.menuGrid}>
              {menuItems.map((m) => {
                const inCart = cart.find((x) => x.menu_item.id === m.id);
                return (
                  <div key={m.id} className={styles.menuCard} onClick={() => addToCart(m)}>
                    <div className={styles.menuImg}>
                      {m.image ? (
                        <img src={assetUrl(m.image)} alt={m.name} />
                      ) : (
                        <div className={styles.menuImgPlaceholder}>🍽</div>
                      )}
                      {inCart && <span className={styles.inCartBadge}>{inCart.quantity}</span>}
                    </div>
                    <div className={styles.menuInfo}>
                      <span className={styles.menuName}>{m.name}</span>
                      <span className={styles.menuPrice}>{formatCurrency(m.price)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart */}
          <aside className={styles.cart}>
            <h3 className={styles.sectionTitle}>
              Giỏ đơn · Bàn {selectedTable?.name}
            </h3>

            {cart.length === 0 ? (
              <p className={styles.cartEmpty}>Chưa có món nào</p>
            ) : (
              <div className={styles.cartList}>
                {cart.map((x) => (
                  <div key={x.menu_item.id} className={styles.cartItem}>
                    <div className={styles.cartItemHead}>
                      <span className={styles.cartItemName}>{x.menu_item.name}</span>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeFromCart(x.menu_item.id)}
                      >
                        ×
                      </button>
                    </div>
                    <div className={styles.cartItemRow}>
                      <div className={styles.qtyControl}>
                        <button onClick={() => updateQty(x.menu_item.id, -1)}>−</button>
                        <span>{x.quantity}</span>
                        <button onClick={() => updateQty(x.menu_item.id, 1)}>+</button>
                      </div>
                      <span className={styles.cartItemPrice}>
                        {formatCurrency(Number(x.menu_item.price) * x.quantity)}
                      </span>
                    </div>
                    <input
                      type="text"
                      className={styles.noteInput}
                      placeholder="Ghi chú món (tuỳ chọn)"
                      value={x.note}
                      onChange={(e) => updateNote(x.menu_item.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div className={styles.cartFooter}>
                <div className={styles.cartTotal}>
                  <span>Tổng ({cartCount} món)</span>
                  <strong>{formatCurrency(cartTotal)}</strong>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className={styles.confirmLayout}>
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Thông tin khách (tuỳ chọn)</h3>

            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm khách theo tên hoặc SĐT..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />

            {selectedCustomer ? (
              <div className={styles.selectedCustomer}>
                <div>
                  <strong>{selectedCustomer.full_name}</strong>
                  <span className={styles.muted}> · {selectedCustomer.phone || 'Không có SĐT'}</span>
                </div>
                <button className={styles.btnSecondary} onClick={() => setSelectedCustomer(null)}>
                  Bỏ chọn
                </button>
              </div>
            ) : (
              <div className={styles.customerList}>
                {customers.length === 0 ? (
                  <p className={styles.muted}>Không có khách nào (có thể bỏ qua)</p>
                ) : (
                  customers.slice(0, 5).map((c) => (
                    <button
                      key={c.id}
                      className={styles.customerItem}
                      onClick={() => setSelectedCustomer(c)}
                    >
                      <div>
                        <strong>{c.full_name}</strong>
                        <span className={styles.muted}> · {c.phone || '—'}</span>
                      </div>
                      <span className={styles.muted}>{c.total_orders} đơn</span>
                    </button>
                  ))
                )}
              </div>
            )}

            <div className={styles.formGroup} style={{ marginTop: 16 }}>
              <label>Ghi chú đơn hàng (tuỳ chọn)</label>
              <textarea
                rows={3}
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="VD: Khách VIP, yêu cầu phục vụ nhanh..."
              />
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Tóm tắt đơn hàng</h3>

            <div className={styles.summaryRow}>
              <span>Bàn</span>
              <strong>{selectedTable?.name}</strong>
            </div>

            <div className={styles.summaryItems}>
              {cart.map((x) => (
                <div key={x.menu_item.id} className={styles.summaryItem}>
                  <span>{x.menu_item.name} × {x.quantity}</span>
                  <span>{formatCurrency(Number(x.menu_item.price) * x.quantity)}</span>
                </div>
              ))}
            </div>

            <div className={styles.summaryTotal}>
              <span>Tổng cộng ({cartCount} món)</span>
              <strong>{formatCurrency(cartTotal)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className={styles.actions}>
        {step > 1 && (
          <button
            className={styles.btnSecondary}
            onClick={() => setStep(step - 1)}
            disabled={submitting}
          >
            ← Quay lại
          </button>
        )}

        <button
          className={styles.btnSecondary}
          onClick={() => navigate('/orders')}
          disabled={submitting}
        >
          Huỷ
        </button>

        {step < 3 ? (
          <button
            className={styles.btnPrimary}
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
          >
            Tiếp theo →
          </button>
        ) : (
          <button
            className={styles.btnPrimary}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Đang tạo đơn...' : 'Xác nhận tạo đơn'}
          </button>
        )}
      </div>
    </Layout>
  );
};

export default CreateOrder;
