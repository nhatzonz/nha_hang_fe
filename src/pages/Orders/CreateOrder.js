import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../../components/common/Layout';
import Header from '../../components/common/Header';
import { tableService } from '../../services/tableService';
import { menuService } from '../../services/menuService';
import { categoryService } from '../../services/categoryService';
import { customerService } from '../../services/customerService';
import { orderService } from '../../services/orderService';
import { aiService } from '../../services/aiService';
import DishSuggestions from '../../components/ai/DishSuggestions';
import { formatCurrency, assetUrl } from '../../utils/format';
import styles from './CreateOrder.module.scss';

const STEPS = [
  { key: 1, label: 'Chọn bàn' },
  { key: 2, label: 'Chọn khách' },
  { key: 3, label: 'Chọn món' },
];

// Bộ lọc sức chứa bàn
const CAPACITY_FILTERS = [
  { key: 'all', label: 'Tất cả', match: () => true },
  { key: 's', label: '1–2 người', match: (c) => c <= 2 },
  { key: 'm', label: '3–4 người', match: (c) => c >= 3 && c <= 4 },
  { key: 'l', label: '5+ người', match: (c) => c >= 5 },
];

const UsersIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CheckMini = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

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
  const [tablesLoading, setTablesLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [customers, setCustomers] = useState([]);

  // Selection
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]); // [{menu_item, quantity, note}]
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orderNote, setOrderNote] = useState('');

  // Filters
  const [capacityFilter, setCapacityFilter] = useState('all');
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Gợi ý món cá nhân hoá theo khách (AI)
  const [recommend, setRecommend] = useState([]);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommendStrategy, setRecommendStrategy] = useState(null);

  // Load tables (only available) + preselect từ URL
  useEffect(() => {
    const loadTables = async () => {
      setTablesLoading(true);
      try {
        const { data } = await tableService.list(
          preselectTableId ? {} : { status: 'available' },
        );
        setTables(data);
        if (preselectTableId) {
          const found = data.find((t) => t.id === Number(preselectTableId));
          if (found) {
            setSelectedTable(found);
            setStep(2);
          }
        }
      } catch {
        toast.error('Không tải được danh sách bàn');
      } finally {
        setTablesLoading(false);
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

  // Load categories & menu when step 3 (chọn món)
  useEffect(() => {
    if (step === 3) {
      categoryService.list().then((res) => setCategories(res.data)).catch(() => {});
      loadMenu();
    }
    // eslint-disable-next-line
  }, [step, menuSearch, menuCategoryFilter]);

  const loadMenu = useCallback(async () => {
    setMenuLoading(true);
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
    } finally {
      setMenuLoading(false);
    }
  }, [menuSearch, menuCategoryFilter]);

  // Load customers when step 2 (chọn khách)
  useEffect(() => {
    if (step === 2) loadCustomers();
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

  // Tải gợi ý món cho khách khi đã chọn khách.
  useEffect(() => {
    if (!selectedCustomer?.id) {
      setRecommend([]);
      setRecommendStrategy(null);
      return;
    }
    let active = true;
    setRecommendLoading(true);
    aiService
      .recommend(selectedCustomer.id, 6)
      .then((res) => {
        if (!active) return;
        setRecommend(res.data?.results || []);
        setRecommendStrategy(res.data?.strategy || null);
      })
      .catch(() => {
        if (active) setRecommend([]);
      })
      .finally(() => {
        if (active) setRecommendLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedCustomer]);

  const addSuggestionToCart = (it) => {
    addToCart({
      id: it.menu_item_id,
      name: it.name,
      price: it.price,
      image: it.image,
    });
    toast.success(`Đã thêm "${it.name}" vào đơn`);
  };

  const cartTotal = cart.reduce((sum, x) => sum + Number(x.menu_item.price) * x.quantity, 0);
  const cartCount = cart.reduce((sum, x) => sum + x.quantity, 0);

  // Lọc + nhóm bàn theo khu vực
  const tableGroups = useMemo(() => {
    const matcher = CAPACITY_FILTERS.find((f) => f.key === capacityFilter)?.match || (() => true);
    const filtered = tables.filter((t) => matcher(Number(t.capacity)));
    const groups = {};
    filtered.forEach((t) => {
      const loc = t.location?.trim() || 'Khu vực khác';
      (groups[loc] = groups[loc] || []).push(t);
    });
    return Object.entries(groups);
  }, [tables, capacityFilter]);

  const handleSubmit = async () => {
    if (cart.length === 0 || !selectedTable) return;
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

  // Panel giỏ hàng — hiện ở bước Chọn khách & Chọn món.
  const cartAside = (
    <aside className={styles.cart}>
      <h3 className={styles.cartHeader}>
        Giỏ đơn
        {cartCount > 0 && <span className={styles.cartCountBadge}>{cartCount}</span>}
      </h3>

      {cart.length === 0 ? (
        <div className={styles.cartEmpty}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span>Chưa có món nào</span>
          <small>Chọn món từ thực đơn để thêm vào đơn</small>
        </div>
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

      <div className={styles.cartFooter}>
        <div className={styles.cartTotal}>
          <span>Tổng ({cartCount} món)</span>
          <strong>{formatCurrency(cartTotal)}</strong>
        </div>
        <button
          className={styles.cartConfirmBtn}
          onClick={handleSubmit}
          disabled={submitting || cart.length === 0 || !selectedTable}
          title={cart.length === 0 ? 'Chưa chọn món' : ''}
        >
          {submitting ? 'Đang tạo đơn...' : 'Xác nhận tạo đơn'}
        </button>
      </div>
    </aside>
  );

  return (
    <Layout>
      <Header title="Tạo đơn hàng mới" />

      {/* Stepper */}
      <div className={styles.stepper}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className={`${styles.step} ${step === s.key ? styles.active : ''} ${step > s.key ? styles.done : ''}`}>
              <div className={styles.stepCircle}>
                {step > s.key ? <CheckMini /> : s.key}
              </div>
              <span className={styles.stepLabel}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${step > s.key ? styles.doneLine : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Thanh tóm tắt đơn — luôn hiển thị */}
      <div className={styles.summaryBar}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Bàn</span>
          <span className={styles.summaryValue}>{selectedTable?.name || <em>Chưa chọn</em>}</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Khách</span>
          <span className={styles.summaryValue}>{selectedCustomer?.full_name || 'Khách lẻ'}</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Số món</span>
          <span className={styles.summaryValue}>{cartCount}</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={`${styles.summaryItem} ${styles.summaryTotal}`}>
          <span className={styles.summaryLabel}>Tổng tiền</span>
          <span className={styles.summaryValue}>{formatCurrency(cartTotal)}</span>
        </div>
      </div>

      {/* Step 1: Choose table */}
      {step === 1 && (
        <div className={styles.card}>
          <div className={styles.tableHeader}>
            <h3 className={styles.sectionTitle}>Chọn bàn trống</h3>
            <div className={styles.filterChips}>
              {CAPACITY_FILTERS.map((f) => (
                <button
                  key={f.key}
                  className={`${styles.filterChip} ${capacityFilter === f.key ? styles.filterChipActive : ''}`}
                  onClick={() => setCapacityFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {tablesLoading ? (
            <div className={styles.tableGrid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          ) : tableGroups.length === 0 ? (
            <div className={styles.emptyState}>
              <UsersIcon />
              <p>Không có bàn trống phù hợp</p>
            </div>
          ) : (
            tableGroups.map(([loc, list]) => (
              <div key={loc} className={styles.tableGroup}>
                <div className={styles.tableGroupTitle}>
                  {loc} <span>· {list.length} bàn</span>
                </div>
                <div className={styles.tableGrid}>
                  {list.map((t) => (
                    <button
                      key={t.id}
                      className={`${styles.tableCard} ${selectedTable?.id === t.id ? styles.selected : ''}`}
                      onClick={() => setSelectedTable(t)}
                    >
                      {selectedTable?.id === t.id && (
                        <span className={styles.tableCheck}><CheckMini /></span>
                      )}
                      <span className={styles.tableCardName}>{t.name}</span>
                      <span className={styles.tableCardInfo}>
                        <UsersIcon />
                        {t.capacity} người
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Step 3: Choose menu */}
      {step === 3 && (
        <div className={styles.step2Layout}>
          <div className={styles.menuSection}>
            <div className={styles.menuToolbar}>
              <div className={styles.searchBox}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm món..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Danh mục dạng chip */}
            <div className={styles.catChips}>
              <button
                className={`${styles.catChip} ${menuCategoryFilter === '' ? styles.catChipActive : ''}`}
                onClick={() => setMenuCategoryFilter('')}
              >
                Tất cả
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  className={`${styles.catChip} ${menuCategoryFilter === String(c.id) ? styles.catChipActive : ''}`}
                  onClick={() => setMenuCategoryFilter(String(c.id))}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {selectedCustomer && recommend.length > 0 && (
              <DishSuggestions
                title="Gợi ý cho khách"
                badge={recommendStrategy === 'personalized' ? 'cá nhân hoá' : 'phổ biến'}
                items={recommend}
                loading={recommendLoading}
                emptyText="Chưa có gợi ý."
                onPick={addSuggestionToCart}
              />
            )}

            {menuLoading ? (
              <div className={styles.menuGrid}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={styles.skeletonMenuCard} />
                ))}
              </div>
            ) : menuItems.length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
                </svg>
                <p>Không tìm thấy món phù hợp</p>
              </div>
            ) : (
              <div className={styles.menuGrid}>
                {menuItems.map((m) => {
                  const inCart = cart.find((x) => x.menu_item.id === m.id);
                  return (
                    <div key={m.id} className={`${styles.menuCard} ${inCart ? styles.menuCardActive : ''}`}>
                      <div className={styles.menuImg} onClick={() => addToCart(m)}>
                        {m.image ? (
                          <img src={assetUrl(m.image)} alt={m.name} />
                        ) : (
                          <div className={styles.menuImgPlaceholder}>🍽</div>
                        )}
                        {inCart && <span className={styles.inCartBadge}>{inCart.quantity}</span>}
                      </div>
                      <div className={styles.menuInfo}>
                        <span className={styles.menuName} onClick={() => addToCart(m)}>{m.name}</span>
                        {m.description && <span className={styles.menuDesc}>{m.description}</span>}
                        <div className={styles.menuBottom}>
                          <span className={styles.menuPrice}>{formatCurrency(m.price)}</span>
                          {inCart ? (
                            <div className={styles.qtyControlMini}>
                              <button onClick={() => updateQty(m.id, -1)}>−</button>
                              <span>{inCart.quantity}</span>
                              <button onClick={() => updateQty(m.id, 1)}>+</button>
                            </div>
                          ) : (
                            <button className={styles.addBtn} onClick={() => addToCart(m)}>
                              + Thêm
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {cartAside}
        </div>
      )}

      {/* Step 2: Choose customer */}
      {step === 2 && (
        <div className={styles.step2Layout}>
          <div className={styles.card}>
            <h3 className={styles.sectionTitle}>Chọn khách hàng (tuỳ chọn)</h3>

            <div className={styles.searchBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Tìm khách theo tên hoặc SĐT..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
            </div>

            {selectedCustomer ? (
              <div className={styles.selectedCustomer}>
                <div className={styles.selectedCustomerInfo}>
                  <span className={styles.avatar}>
                    {selectedCustomer.full_name?.trim().charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <strong>{selectedCustomer.full_name}</strong>
                    <span className={styles.muted}> · {selectedCustomer.phone || 'Không có SĐT'}</span>
                  </div>
                </div>
                <button className={styles.btnSecondary} onClick={() => setSelectedCustomer(null)}>
                  Bỏ chọn
                </button>
              </div>
            ) : null}

            {selectedCustomer && (
              <DishSuggestions
                title="Gợi ý cho khách"
                badge={recommendStrategy === 'personalized' ? 'cá nhân hoá' : 'phổ biến'}
                items={recommend}
                loading={recommendLoading}
                emptyText="Chưa có gợi ý cho khách này."
                onPick={addSuggestionToCart}
              />
            )}

            {!selectedCustomer && (
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
                      <div className={styles.customerItemMain}>
                        <span className={styles.avatar}>{c.full_name?.trim().charAt(0).toUpperCase()}</span>
                        <div>
                          <strong>{c.full_name}</strong>
                          <span className={styles.muted}> · {c.phone || '—'}</span>
                        </div>
                      </div>
                      <span className={styles.customerOrders}>{c.total_orders} đơn</span>
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

          {cartAside}
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

        {step < 3 && (
          <button
            className={styles.btnPrimary}
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && !selectedTable}
            title={step === 1 && !selectedTable ? 'Hãy chọn bàn trước' : ''}
          >
            Tiếp theo →
          </button>
        )}
      </div>
    </Layout>
  );
};

export default CreateOrder;
