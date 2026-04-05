import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { restaurantService } from '../../services/restaurantService';
import styles from './Login.module.scss';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [restaurant, setRestaurant] = useState(null);

  // Nếu đã đăng nhập → redirect dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Lấy thông tin nhà hàng
  useEffect(() => {
    restaurantService.getInfo()
      .then((res) => setRestaurant(res.data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const brandName = restaurant?.name || 'Hải Sản Biển Đông';

  return (
    <div className={styles.container}>
      {/* Bên trái - Ảnh + Overlay */}
      <div className={styles.banner}>
        <div className={styles.bannerOverlay}>
          <span className={styles.bannerTag}>{brandName.toUpperCase()}</span>
          <h1 className={styles.bannerTitle}>
            Hương Vị<br />Biển Cả.
          </h1>
          <p className={styles.bannerDesc}>
            {restaurant?.description || 'Nơi hải sản tươi ngon hòa quyện cùng nghệ thuật ẩm thực. Quản lý nhà hàng của bạn một cách thông minh.'}
          </p>
        </div>
      </div>

      {/* Bên phải - Form đăng nhập */}
      <div className={styles.formSection}>
        <div className={styles.formWrapper}>
          <h2 className={styles.brand}>{brandName}</h2>

          <h3 className={styles.title}>Chào mừng trở lại</h3>
          <p className={styles.subtitle}>
            Vui lòng đăng nhập để truy cập hệ thống quản lý nhà hàng.
          </p>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>ĐỊA CHỈ EMAIL</label>
              <input
                type="email"
                className={styles.formInput}
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.formLabelRow}>
                <label className={styles.formLabel}>MẬT KHẨU</label>
                <button
                  type="button"
                  className={styles.forgotLink}
                  onClick={() => alert('Vui lòng liên hệ Admin để đặt lại mật khẩu.')}
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={styles.formInput}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className={styles.checkbox}>
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember">Ghi nhớ đăng nhập</label>
            </div>

            <button
              type="submit"
              className={`${styles.loginBtn} ${loading ? styles.loading : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  ĐANG XỬ LÝ...
                </>
              ) : (
                'ĐĂNG NHẬP →'
              )}
            </button>
          </form>

          <div className={styles.divider}>
            <span>hoặc</span>
          </div>

          <p className={styles.footer}>
            Chưa có tài khoản? <strong>Liên hệ Admin</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
