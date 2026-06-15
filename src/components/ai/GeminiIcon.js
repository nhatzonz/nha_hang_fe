import React from 'react';

/**
 * Icon "tia sáng" Gemini (ngôi sao 4 cánh).
 * - Mặc định tô gradient xanh → tím → hồng (đúng nhận diện Gemini).
 * - Truyền `color` để tô đặc 1 màu (vd "#fff" khi đặt trên nền gradient).
 */
const GeminiIcon = ({ size = 18, color, className, style }) => {
  const fill = color || 'url(#geminiGrad)';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {!color && (
        <defs>
          <linearGradient id="geminiGrad" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#4285F4" />
            <stop offset="0.5" stopColor="#9B72CB" />
            <stop offset="1" stopColor="#D96570" />
          </linearGradient>
        </defs>
      )}
      <path
        fill={fill}
        d="M12 0c0 6.627-5.373 12-12 12 6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z"
      />
    </svg>
  );
};

export default GeminiIcon;
