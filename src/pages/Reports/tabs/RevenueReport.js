import React, { useCallback, useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { toast } from 'sonner';
import ReportDateRange from '../../../components/common/ReportDateRange';
import { reportsService } from '../../../services/reportsService';
import { formatCurrency } from '../../../utils/format';
import { exportToCsv } from '../../../utils/exportCsv';
import styles from '../Reports.module.scss';

const toCompact = (n) => {
  if (!n) return '0';
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
};

const RevenueReport = ({ range, setRange }) => {
  const [singleDate, setSingleDate] = useState(range.to);
  const [byHour, setByHour] = useState(null);
  const [byWeekday, setByWeekday] = useState(null);
  const [byStaff, setByStaff] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [h, w, s] = await Promise.all([
        reportsService.revenueByHour(singleDate),
        reportsService.revenueByWeekday({ from: range.from, to: range.to }),
        reportsService.revenueByStaff({ from: range.from, to: range.to }),
      ]);
      setByHour(h.data);
      setByWeekday(w.data);
      setByStaff(s.data);
    } catch {
      toast.error('Không tải được báo cáo doanh thu');
    } finally {
      setLoading(false);
    }
  }, [singleDate, range]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const peakHour = byHour?.data?.reduce((max, h) => h.revenue > (max?.revenue || 0) ? h : max, null);
  const peakWeekday = byWeekday?.data?.reduce((max, w) => w.revenue > (max?.revenue || 0) ? w : max, null);
  const topStaff = byStaff?.data?.[0];

  const exportStaffCsv = () => {
    if (!byStaff?.data?.length) return;
    exportToCsv(
      `bao-cao-doanh-thu-nhan-vien-${range.from}_${range.to}`,
      [
        { key: 'full_name', label: 'Họ tên' },
        { key: 'role', label: 'Vai trò' },
        { key: 'orders', label: 'Số đơn' },
        { key: 'revenue', label: 'Doanh thu (VNĐ)' },
        { key: 'avg_order_value', label: 'TB mỗi đơn (VNĐ)', format: (v) => Math.round(v) },
      ],
      byStaff.data,
    );
  };

  return (
    <>
      <div className={styles.toolbar}>
        <ReportDateRange from={range.from} to={range.to} onChange={setRange} />
      </div>

      {/* Summary cards */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Giờ bán chạy nhất</span>
          <span className={styles.summaryValue}>
            {peakHour && peakHour.revenue > 0 ? `${peakHour.hour}:00 - ${peakHour.hour + 1}:00` : '—'}
          </span>
          <span className={styles.summarySub}>
            {peakHour ? formatCurrency(peakHour.revenue) : ''}
          </span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Ngày đông khách nhất</span>
          <span className={styles.summaryValue}>
            {peakWeekday && peakWeekday.revenue > 0 ? peakWeekday.weekday : '—'}
          </span>
          <span className={styles.summarySub}>
            {peakWeekday ? formatCurrency(peakWeekday.revenue) : ''}
          </span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Nhân viên dẫn đầu</span>
          <span className={styles.summaryValue}>{topStaff?.full_name || '—'}</span>
          <span className={styles.summarySub}>
            {topStaff ? `${formatCurrency(topStaff.revenue)} · ${topStaff.orders} đơn` : ''}
          </span>
        </div>
      </div>

      {/* Doanh thu theo giờ */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Doanh thu theo giờ</h3>
            <p className={styles.cardDesc}>Biểu đồ đường 24 giờ — tìm giờ cao điểm</p>
          </div>
          <label className={styles.datePicker}>
            <span>Ngày:</span>
            <input
              type="date"
              value={singleDate}
              onChange={(e) => setSingleDate(e.target.value)}
            />
          </label>
        </div>

        {loading || !byHour ? (
          <div className={styles.empty}>Đang tải...</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={byHour.data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="hour" stroke="#999" fontSize={11} tickFormatter={(h) => `${h}h`} axisLine={false} tickLine={false} />
              <YAxis stroke="#999" fontSize={11} tickFormatter={toCompact} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, fontSize: 13 }}
                formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                labelFormatter={(h) => `${h}:00 - ${h + 1}:00`}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#c0392b"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Doanh thu theo thứ */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Doanh thu theo thứ trong tuần</h3>
            <p className={styles.cardDesc}>Tổng hợp cả kỳ {range.from} → {range.to}</p>
          </div>
        </div>

        {loading || !byWeekday ? (
          <div className={styles.empty}>Đang tải...</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byWeekday.data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="weekday" stroke="#999" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis stroke="#999" fontSize={11} tickFormatter={toCompact} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, fontSize: 13 }}
                formatter={(value, name) => name === 'revenue' ? [formatCurrency(value), 'Doanh thu'] : [value, 'Đơn']}
              />
              <Bar dataKey="revenue" fill="#c0392b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bảng nhân viên */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Doanh thu theo nhân viên</h3>
            <p className={styles.cardDesc}>Ranking theo tổng doanh thu</p>
          </div>
          <button
            className={styles.exportBtn}
            onClick={exportStaffCsv}
            disabled={!byStaff?.data?.length}
          >
            Xuất CSV
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Nhân viên</th>
                <th>Vai trò</th>
                <th style={{ textAlign: 'right' }}>Số đơn</th>
                <th style={{ textAlign: 'right' }}>Doanh thu</th>
                <th style={{ textAlign: 'right' }}>TB mỗi đơn</th>
              </tr>
            </thead>
            <tbody>
              {!byStaff?.data?.length ? (
                <tr><td colSpan={6} className={styles.emptyCell}>Chưa có dữ liệu</td></tr>
              ) : byStaff.data.map((s, i) => (
                <tr key={s.id}>
                  <td data-label="#">{i + 1}</td>
                  <td data-label="Nhân viên"><strong>{s.full_name}</strong></td>
                  <td data-label="Vai trò" className={styles.muted}>{s.role}</td>
                  <td data-label="Số đơn" style={{ textAlign: 'right' }}>{s.orders}</td>
                  <td data-label="Doanh thu" style={{ textAlign: 'right', color: '#c0392b', fontWeight: 700 }}>
                    {formatCurrency(s.revenue)}
                  </td>
                  <td data-label="TB mỗi đơn" style={{ textAlign: 'right' }}>{formatCurrency(s.avg_order_value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default RevenueReport;
