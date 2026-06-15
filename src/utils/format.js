export const formatPhone = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length !== 10) return phone;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
};

export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0đ';
  const num = Number(value);
  if (isNaN(num)) return '0đ';
  return Math.round(num).toLocaleString('vi-VN') + 'đ';
};

export const formatPriceInput = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parsePriceInput = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits ? Number(digits) : '';
};

export const normalizeSearch = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '');
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
};

export const assetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = process.env.REACT_APP_ASSET_URL || 'http://localhost:3001';
  return `${base}/${path.replace(/^\//, '')}`;
};

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

export const formatRelativeTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  if (diff < 0) return formatDateTime(date);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'Vừa xong';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} phút trước`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour} giờ trước`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day} ngày trước`;
  return formatDateTime(date);
};
