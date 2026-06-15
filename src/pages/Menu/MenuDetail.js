import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '../../components/common/Layout';
import Header from '../../components/common/Header';
import DishSuggestions from '../../components/ai/DishSuggestions';
import { menuService } from '../../services/menuService';
import { aiService } from '../../services/aiService';
import { formatCurrency, assetUrl } from '../../utils/format';

const MenuDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similar, setSimilar] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    menuService
      .getById(id)
      .then((res) => active && setItem(res.data))
      .catch(() => {
        if (active) toast.error('Không tải được thông tin món');
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    let active = true;
    setSimilarLoading(true);
    aiService
      .similar(id, 6)
      .then((res) => active && setSimilar(res.data?.results || []))
      .catch(() => active && setSimilar([]))
      .finally(() => active && setSimilarLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <Layout>
      <Header title="Chi tiết món" />

      <button onClick={() => navigate('/menu')} style={S.back}>
        ← Quay lại thực đơn
      </button>

      {loading ? (
        <div style={S.muted}>Đang tải...</div>
      ) : !item ? (
        <div style={S.muted}>Không tìm thấy món.</div>
      ) : (
        <div style={S.card}>
          <div style={S.imgWrap}>
            {item.image ? (
              <img src={assetUrl(item.image)} alt={item.name} style={S.img} />
            ) : (
              <div style={{ ...S.img, ...S.imgPlaceholder }}>🍽</div>
            )}
            {!item.is_available && <span style={S.badge}>Tạm hết</span>}
          </div>

          <div style={S.info}>
            <span style={S.category}>
              {item.category?.name || 'Chưa phân loại'}
            </span>
            <h2 style={S.name}>{item.name}</h2>
            <div style={S.price}>{formatCurrency(item.price)}</div>
            <div style={S.status}>
              {item.is_available ? '🟢 Đang bán' : '🔴 Tạm hết'}
            </div>
            {item.description && <p style={S.desc}>{item.description}</p>}
          </div>
        </div>
      )}

      <DishSuggestions
        title="Món tương tự"
        badge="AI"
        items={similar}
        loading={similarLoading}
        emptyText="Chưa có món tương tự (món có thể chưa được lập chỉ mục)."
        onSelect={(it) => navigate(`/menu/${it.menu_item_id}`)}
      />
    </Layout>
  );
};

const S = {
  back: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    cursor: 'pointer',
    fontSize: 14,
    padding: '8px 0',
    marginBottom: 8,
  },
  muted: { color: '#94a3b8', padding: 24 },
  card: {
    display: 'flex',
    gap: 24,
    background: '#fff',
    border: '1px solid #e8edf3',
    borderRadius: 14,
    padding: 20,
    flexWrap: 'wrap',
  },
  imgWrap: { position: 'relative', flex: '0 0 280px', maxWidth: 280 },
  img: { width: '100%', height: 220, objectFit: 'cover', borderRadius: 10 },
  imgPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 60,
    background: '#f1f5f9',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    background: '#ef4444',
    color: '#fff',
    fontSize: 12,
    padding: '3px 10px',
    borderRadius: 999,
  },
  info: { flex: 1, minWidth: 240 },
  category: { fontSize: 13, color: '#2563eb', fontWeight: 600 },
  name: { margin: '6px 0 10px', fontSize: 24, color: '#1f2937' },
  price: { fontSize: 22, fontWeight: 700, color: '#ef4444' },
  status: { marginTop: 8, fontSize: 14, color: '#475569' },
  desc: { marginTop: 14, fontSize: 14, color: '#475569', lineHeight: 1.6 },
};

export default MenuDetail;
