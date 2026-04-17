import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import Layout from '../../components/common/Layout';
import Header from '../../components/common/Header';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { assetUrl, formatPhone } from '../../utils/format';
import styles from './Profile.module.scss';

const roleLabel = {
  admin: 'Quản trị viên',
  manager: 'Quản lý',
  staff: 'Nhân viên',
};

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [tab, setTab] = useState('info');

  // Info form
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingInfo, setSavingInfo] = useState(false);

  // Password form
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  // Avatar
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  if (!user) return null;

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    const name = fullName.trim();
    const ph = phone.trim();
    if (!name) return toast.error('Vui lòng nhập họ tên');
    if (ph && !/^0[0-9]{9}$/.test(ph)) return toast.error('SĐT phải 10 số bắt đầu bằng 0');

    setSavingInfo(true);
    try {
      const { data } = await authService.updateProfile({
        full_name: name,
        phone: ph || undefined,
      });
      updateUser(data);
      toast.success('Đã cập nhật thông tin');
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Cập nhật thất bại');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPw) return toast.error('Vui lòng nhập mật khẩu hiện tại');
    if (newPw.length < 6) return toast.error('Mật khẩu mới tối thiểu 6 ký tự');
    if (newPw !== confirmPw) return toast.error('Xác nhận mật khẩu không khớp');
    if (oldPw === newPw) return toast.error('Mật khẩu mới phải khác mật khẩu cũ');

    setSavingPw(true);
    try {
      await authService.changePassword(oldPw, newPw);
      toast.success('Đã đổi mật khẩu thành công');
      setOldPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Đổi mật khẩu thất bại');
    } finally {
      setSavingPw(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Ảnh tối đa 2MB');
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await authService.uploadAvatar(formData);
      updateUser(data);
      toast.success('Đã cập nhật ảnh đại diện');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload thất bại');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const initial = user.full_name?.charAt(0)?.toUpperCase() || '?';

  return (
    <Layout>
      <Header title="Hồ sơ cá nhân" subtitle="Quản lý thông tin và mật khẩu của bạn" />

      <div className={styles.layout}>
        {/* Card thông tin cơ bản */}
        <div className={styles.infoCard}>
          <div className={styles.avatarBox} onClick={() => fileInputRef.current?.click()}>
            {user.avatar ? (
              <img src={assetUrl(user.avatar)} alt={user.full_name} />
            ) : (
              <span>{initial}</span>
            )}
            <div className={styles.avatarOverlay}>
              {uploadingAvatar ? 'Đang tải...' : 'Đổi ảnh'}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />

          <h3>{user.full_name}</h3>
          <span className={styles.role}>{roleLabel[user.role] || user.role}</span>

          <div className={styles.statRow}>
            <div className={styles.stat}>
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>
            <div className={styles.stat}>
              <span>SĐT</span>
              <strong>{user.phone ? formatPhone(user.phone) : '—'}</strong>
            </div>
          </div>
        </div>

        {/* Card tabs */}
        <div className={styles.formCard}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === 'info' ? styles.tabActive : ''}`}
              onClick={() => setTab('info')}
            >
              Thông tin cá nhân
            </button>
            <button
              className={`${styles.tab} ${tab === 'password' ? styles.tabActive : ''}`}
              onClick={() => setTab('password')}
            >
              Đổi mật khẩu
            </button>
          </div>

          {tab === 'info' && (
            <form onSubmit={handleSaveInfo} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Họ tên <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Số điện thoại</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="0912345678"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email</label>
                <input type="email" value={user.email} disabled />
                <span className={styles.hint}>Email không thể thay đổi. Liên hệ Admin nếu cần.</span>
              </div>

              <div className={styles.formGroup}>
                <label>Vai trò</label>
                <input type="text" value={roleLabel[user.role] || user.role} disabled />
              </div>

              <button type="submit" className={styles.btnPrimary} disabled={savingInfo}>
                {savingInfo ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          )}

          {tab === 'password' && (
            <form onSubmit={handleChangePassword} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Mật khẩu hiện tại <span className={styles.required}>*</span></label>
                <input
                  type="password"
                  value={oldPw}
                  onChange={(e) => setOldPw(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Mật khẩu mới <span className={styles.required}>*</span></label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  autoComplete="new-password"
                  maxLength={72}
                />
                <span className={styles.hint}>Tối thiểu 6 ký tự</span>
              </div>

              <div className={styles.formGroup}>
                <label>Xác nhận mật khẩu mới <span className={styles.required}>*</span></label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  autoComplete="new-password"
                  maxLength={72}
                />
              </div>

              <button type="submit" className={styles.btnPrimary} disabled={savingPw}>
                {savingPw ? 'Đang đổi...' : 'Đổi mật khẩu'}
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
