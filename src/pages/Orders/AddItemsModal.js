import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import Modal from '../../components/common/Modal';
import { menuService } from '../../services/menuService';
import { categoryService } from '../../services/categoryService';
import { formatCurrency, assetUrl } from '../../utils/format';
import createStyles from './CreateOrder.module.scss';
import styles from './Order.module.scss';
import addStyles from './AddItems.module.scss';

const AddItemsModal = ({ open, onClose, onSubmit }) => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadMenu = useCallback(async () => {
    try {
      const { data } = await menuService.list({
        search: search || undefined,
        category_id: categoryFilter || undefined,
        is_available: 1,
        limit: 100,
      });
      setMenuItems(data.data);
    } catch {
      toast.error('Không tải được thực đơn');
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    if (open) {
      setCart([]);
      setSearch('');
      setCategoryFilter('');
      categoryService.list().then((res) => setCategories(res.data)).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    if (open) loadMenu();
  }, [open, loadMenu]);

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

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      await onSubmit(cart.map((x) => ({
        menu_item_id: x.menu_item.id,
        quantity: x.quantity,
        note: x.note || undefined,
      })));
      onClose();
    } catch {
      // Toast in parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? undefined : onClose}
      title="Thêm món vào đơn"
      size="xl"
      footer={
        <>
          <button className={styles.btnSecondary} onClick={onClose} disabled={submitting}>
            Huỷ
          </button>
          <button
            className={styles.btnPrimary}
            onClick={handleSubmit}
            disabled={submitting || cart.length === 0}
          >
            {submitting ? 'Đang thêm...' : cart.length === 0 ? 'Chọn món' : `Thêm ${cartCount} món · ${formatCurrency(cartTotal)}`}
          </button>
        </>
      }
    >
      <div className={addStyles.layout}>
        {/* LEFT: Menu list */}
        <div className={addStyles.menuCol}>
          <div className={addStyles.toolbar}>
            <input
              type="text"
              className={addStyles.searchInput}
              placeholder="Tìm món..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className={addStyles.select}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className={addStyles.menuList}>
            {menuItems.length === 0 ? (
              <div className={addStyles.empty}>Không có món nào</div>
            ) : menuItems.map((m) => {
              const inCart = cart.find((x) => x.menu_item.id === m.id);
              return (
                <div
                  key={m.id}
                  className={`${addStyles.menuRow} ${inCart ? addStyles.inCart : ''}`}
                  onClick={() => addToCart(m)}
                >
                  <div className={addStyles.menuImg}>
                    {m.image ? (
                      <img src={assetUrl(m.image)} alt={m.name} />
                    ) : (
                      <div className={addStyles.menuImgPlaceholder}>🍽</div>
                    )}
                  </div>
                  <div className={addStyles.menuInfo}>
                    <div className={addStyles.menuName}>{m.name}</div>
                    {m.category?.name && (
                      <div className={addStyles.menuCategory}>{m.category.name}</div>
                    )}
                    {m.description && (
                      <div className={addStyles.menuDesc}>{m.description}</div>
                    )}
                  </div>
                  <div className={addStyles.menuRight}>
                    <div className={addStyles.menuPrice}>{formatCurrency(m.price)}</div>
                    {inCart ? (
                      <span className={addStyles.inCartBadge}>Đã chọn {inCart.quantity}</span>
                    ) : (
                      <span className={addStyles.addHint}>+ Thêm</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Cart */}
        <aside className={addStyles.cartCol}>
          <h3 className={addStyles.cartTitle}>
            Món chọn thêm
            {cart.length > 0 && <span className={addStyles.cartCountBadge}>{cartCount}</span>}
          </h3>

          {cart.length === 0 ? (
            <div className={addStyles.cartEmpty}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span>Chưa chọn món nào</span>
            </div>
          ) : (
            <>
              <div className={addStyles.cartList}>
                {cart.map((x) => (
                  <div key={x.menu_item.id} className={addStyles.cartItem}>
                    <div className={addStyles.cartItemHead}>
                      <span className={addStyles.cartItemName}>{x.menu_item.name}</span>
                      <button
                        className={addStyles.removeBtn}
                        onClick={() => removeFromCart(x.menu_item.id)}
                      >
                        ×
                      </button>
                    </div>
                    <div className={addStyles.cartItemRow}>
                      <div className={addStyles.qtyControl}>
                        <button onClick={() => updateQty(x.menu_item.id, -1)}>−</button>
                        <span>{x.quantity}</span>
                        <button onClick={() => updateQty(x.menu_item.id, 1)}>+</button>
                      </div>
                      <span className={addStyles.cartItemPrice}>
                        {formatCurrency(Number(x.menu_item.price) * x.quantity)}
                      </span>
                    </div>
                    <input
                      type="text"
                      className={addStyles.noteInput}
                      placeholder="Ghi chú món (tuỳ chọn)"
                      value={x.note}
                      onChange={(e) => updateNote(x.menu_item.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className={addStyles.cartFooter}>
                <span>Tổng cộng</span>
                <strong>{formatCurrency(cartTotal)}</strong>
              </div>
            </>
          )}
        </aside>
      </div>
    </Modal>
  );
};

export default AddItemsModal;
