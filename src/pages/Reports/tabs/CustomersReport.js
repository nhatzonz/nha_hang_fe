import React, { useCallback, useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';
import ReportDateRange from '../../../components/common/ReportDateRange';
import { reportsService } from '../../../services/reportsService';
import { formatCurrency, formatPhone, formatDate } from '../../../utils/format';
import { exportToCsv } from '../../../utils/exportCsv';
import styles from '../Reports.module.scss';

const CustomersReport = ({ range, setRange }) => {
  const [top, setTop] = useState(null);
  const [seg, setSeg] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        reportsService.topCustomers({ from: range.from, to: range.to, limit: 20 }),
        reportsService.customerSegmentation({ from: range.from, to: range.to }),
      ]);
      setTop(t.data);
      setSeg(s.data);
    } catch {
      toast.error('Không tải được báo cáo khách hàng');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetch(); }, [fetch]);

  const exportTop = () => {
    if (!top?.data?.length) return;
    exportToCsv(
      `top-khach-hang-${range.from}_${range.to}`,
      [
        { key: 'full_name', label: 'Họ tên' },
        { key: 'phone', label: 'SĐT', format: (v) => formatPhone(v) },
        { key: 'orders', label: 'Số đơn' },
        { key: 'spent', label: 'Tổng chi (VNĐ)' },
        { key: 'avg_order', label: 'TB mỗi đơn', format: (v) => Math.round(v) },
        { key: 'last_visit', label: 'Lần cuối', format: (v) => v ? formatDate(v) : '' },
      ],
      top.data,
    );
  };

  const segData = seg ? [
    { name: 'Khách mới', value: seg.new_customers, color: '#c0392b' },
    { name: 'Khách quay lại', value: seg.returning_customers, color: '#27ae60' },
  ] : [];

  return (
    <>
      <div className={styles.toolbar}>
        <ReportDateRange from={range.from} to={range.to} onChange={setRange} />
      </div>

      {/* Summary */}
      {seg && (
        <div className={styles.summaryRow}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Tổng khách có đơn</span>
            <span className={styles.summaryValue}>{seg.total}</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Khách mới</span>
            <span className={styles.summaryValue} style={{ color: '#c0392b' }}>
              {seg.new_customers}
            </span>
            <span className={styles.summarySub}>{seg.new_rate.toFixed(1)}%</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Khách quay lại</span>
            <span className={styles.summaryValue} style={{ color: '#27ae60' }}>
              {seg.returning_customers}
            </span>
            <span className={styles.summarySub}>{seg.returning_rate.toFixed(1)}%</span>
          </div>
        </div>
      )}

      {/* Pie chart segmentation */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Khách mới vs Khách quay lại</h3>
            <p className={styles.cardDesc}>
              Khách có đơn đầu tiên trong kỳ = mới. Khách từng có đơn trước kỳ = quay lại.
            </p>
          </div>
        </div>
        {!seg || seg.total === 0 ? (
          <div className={styles.empty}>Chưa có dữ liệu</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={segData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={55} paddingAngle={2}>
                {segData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, fontSize: 13 }}
              />
              <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top customers table */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Top khách hàng chi tiêu cao nhất</h3>
            <p className={styles.cardDesc}>Top 20 khách trong kỳ</p>
          </div>
          <button
            className={styles.exportBtn}
            onClick={exportTop}
            disabled={!top?.data?.length}
          >
            Xuất CSV
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Khách hàng</th>
                <th>SĐT</th>
                <th style={{ textAlign: 'right' }}>Số đơn</th>
                <th style={{ textAlign: 'right' }}>Tổng chi</th>
                <th style={{ textAlign: 'right' }}>TB/đơn</th>
                <th>Lần cuối</th>
              </tr>
            </thead>
            <tbody>
              {loading || !top ? (
                <tr><td colSpan={7} className={styles.emptyCell}>Đang tải...</td></tr>
              ) : !top.data.length ? (
                <tr><td colSpan={7} className={styles.emptyCell}>Chưa có dữ liệu</td></tr>
              ) : top.data.map((c, i) => (
                <tr key={c.id}>
                  <td data-label="#">{i + 1}</td>
                  <td data-label="Khách hàng"><strong>{c.full_name}</strong></td>
                  <td data-label="SĐT" className={styles.muted}>{c.phone ? formatPhone(c.phone) : '—'}</td>
                  <td data-label="Số đơn" style={{ textAlign: 'right' }}>{c.orders}</td>
                  <td data-label="Tổng chi" style={{ textAlign: 'right', color: '#c0392b', fontWeight: 700 }}>
                    {formatCurrency(c.spent)}
                  </td>
                  <td data-label="TB/đơn" style={{ textAlign: 'right' }}>{formatCurrency(c.avg_order)}</td>
                  <td data-label="Lần cuối" className={styles.muted}>{c.last_visit ? formatDate(c.last_visit) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CustomersReport;
