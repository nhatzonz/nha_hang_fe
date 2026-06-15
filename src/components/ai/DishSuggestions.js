import React from 'react';
import { formatCurrency, assetUrl } from '../../utils/format';
import GeminiIcon from './GeminiIcon';

const DishSuggestions = ({
  title = 'Gợi ý',
  items = [],
  loading = false,
  emptyText = 'Chưa có gợi ý phù hợp.',
  onPick,
  onSelect,
  badge,
}) => {
  const handler = onPick || onSelect;
  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <span style={S.title}>
          <GeminiIcon size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />
          {title}
        </span>
        {badge && <span style={S.badge}>{badge}</span>}
      </div>

      {loading ? (
        <div style={S.muted}>Đang tải gợi ý...</div>
      ) : items.length === 0 ? (
        <div style={S.muted}>{emptyText}</div>
      ) : (
        <div style={S.list}>
          {items.map((it) => {
            const Tag = handler ? 'button' : 'div';
            return (
              <Tag
                key={it.menu_item_id}
                type={handler ? 'button' : undefined}
                onClick={handler ? () => handler(it) : undefined}
                style={{ ...S.card, ...(handler ? S.cardClickable : {}) }}
                title={onPick ? 'Bấm để thêm vào đơn' : onSelect ? 'Xem chi tiết món' : undefined}
              >
                {it.image ? (
                  <img src={assetUrl(it.image)} alt={it.name} style={S.img} />
                ) : (
                  <div style={{ ...S.img, ...S.imgPlaceholder }}>🍽</div>
                )}
                <div style={S.info}>
                  <div style={S.name}>{it.name}</div>
                  <div style={S.price}>{formatCurrency(it.price || 0)}</div>
                  {typeof it.score === 'number' && (
                    <div style={S.score}>độ phù hợp {(it.score * 100).toFixed(0)}%</div>
                  )}
                </div>
                {onPick && <span style={S.plus}>+</span>}
              </Tag>
            );
          })}
        </div>
      )}
    </div>
  );
};

const S = {
  wrap: { marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 10, border: '1px solid #e8edf3' },
  header: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  title: { fontWeight: 600, fontSize: 14, color: '#1f2937' },
  badge: { fontSize: 11, color: '#2563eb', background: '#e0ecff', padding: '2px 8px', borderRadius: 999 },
  muted: { color: '#94a3b8', fontSize: 13 },
  list: { display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 },
  card: { display: 'flex', flexDirection: 'column', minWidth: 130, maxWidth: 130, background: '#fff', border: '1px solid #e8edf3', borderRadius: 8, padding: 8, textAlign: 'left', position: 'relative' },
  cardClickable: { cursor: 'pointer' },
  img: { width: '100%', height: 80, objectFit: 'cover', borderRadius: 6 },
  imgPlaceholder: { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, background: '#f1f5f9' },
  info: { marginTop: 6 },
  name: { fontSize: 12, fontWeight: 600, color: '#1f2937', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  price: { fontSize: 12, color: '#ef4444', fontWeight: 600, marginTop: 2 },
  score: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  plus: { position: 'absolute', top: 6, right: 6, width: 20, height: 20, lineHeight: '18px', textAlign: 'center', background: '#2563eb', color: '#fff', borderRadius: '50%', fontSize: 14 },
};

export default DishSuggestions;
