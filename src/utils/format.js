// Format SĐT: 0912345678 -> 0912 345 678
export const formatPhone = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length !== 10) return phone;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
};

// Format tiền VND: 128430500 -> 128.430.500đ (luôn làm tròn phần nguyên)
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0đ';
  const num = Number(value);
  if (isNaN(num)) return '0đ';
  return Math.round(num).toLocaleString('vi-VN') + 'đ';
};

// Format giá khi gõ input: 850000 -> "850.000"
export const formatPriceInput = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Parse giá từ input: "850.000" -> 850000
export const parsePriceInput = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits ? Number(digits) : '';
};

// Chuẩn hoá chuỗi tìm kiếm: bỏ dấu, bỏ space, lowercase
// "Tôm Hùm Nướng" -> "tomhumnuong"
export const normalizeSearch = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '');
};

// Format ngày giờ: 2026-04-16T10:00:00Z -> 16/04/2026
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
};

// URL đầy đủ cho asset (ảnh từ BE)
export const assetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = process.env.REACT_APP_ASSET_URL || 'http://localhost:3001';
  return `${base}/${path.replace(/^\//, '')}`;
};

// Format ngày giờ đầy đủ: 16/04/2026 10:00
export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
