import React, { useState } from 'react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Gọi API login
    console.log({ email, password, remember });
  };

  return (
    <div className="login-container">
      {/* Bên trái - Ảnh + Overlay */}
      <div className="login-banner">
        <div className="login-banner-overlay">
          <span className="login-banner-tag">HẢI SẢN BIỂN ĐÔNG</span>
          <h1 className="login-banner-title">
            Hương Vị<br />Biển Cả.
          </h1>
          <p className="login-banner-desc">
            Nơi hải sản tươi ngon hòa quyện cùng nghệ thuật ẩm thực.
            Quản lý nhà hàng của bạn một cách thông minh.
          </p>
        </div>
      </div>

      {/* Bên phải - Form đăng nhập */}
      <div className="login-form-section">
        <div className="login-form-wrapper">
          <h2 className="login-brand">Hải Sản Biển Đông</h2>

          <h3 className="login-title">Chào mừng trở lại</h3>
          <p className="login-subtitle">
            Vui lòng đăng nhập để truy cập hệ thống quản lý nhà hàng.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">ĐỊA CHỈ EMAIL</label>
              <input
                type="email"
                className="form-input"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">MẬT KHẨU</label>
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={() => alert('Vui lòng liên hệ Admin để đặt lại mật khẩu.')}
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className="form-checkbox">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember">Ghi nhớ đăng nhập</label>
            </div>

            <button type="submit" className="login-btn">
              ĐĂNG NHẬP →
            </button>
          </form>

          <p className="login-footer">
            Chưa có tài khoản? <strong>Liên hệ Admin</strong>
          </p>

          <div className="login-icons">
            <span>🍴</span>
            <span>🦐</span>
            <span>🍷</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
