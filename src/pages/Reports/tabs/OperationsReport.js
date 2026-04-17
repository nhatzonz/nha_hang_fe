import React, { useCallback, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toast } from 'sonner';
import ReportDateRange from '../../../components/common/ReportDateRange';
import { reportsService } from '../../../services/reportsService';
import { formatCurrency, formatDateTime } from '../../../utils/format';
import { exportToCsv } from '../../../utils/exportCsv';
import styles from '../Reports.module.scss';

const OperationsReport = ({ range, setRange }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await reportsService.cancellationAnalysis({ from: range.from, to: range.to });
      setData(data);
    } catch {
      toast.error('Không tải được báo cáo vận hành');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetch(); }, [fetch]);

  const exportCancelled = () => {
    if (!data?.recent?.length) return;
    exportToCsv(
      `danh-sach-don-huy-${range.from}_${range.to}`,
      [
        { key: 'order_code', label: 'Mã đơn' },
        { key: 'table.name', label: 'Bàn' },
        { key: 'staff.full_name', label: 'Nhân viên' },
        { key: 'final_amount', label: 'Thành tiền (VNĐ)' },
        { key: 'cancelled_reason', label: 'Lý do' },
        { key: 'created_at', label: 'Ngày tạo', format: (v) => formatDateTime(v) },
      ],
      data.recent,
    );
  };

  const reasonChart = data?.reasons?.slice(0, 10) || [];

  return (
    <>
      <div className={styles.toolbar}>
        <ReportDateRange from={range.from} to={range.to} onChange={setRange} />
      </div>

      {/* Summary */}
      {data && (
        <div className={styles.summaryRow}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Tổng đơn trong kỳ</span>
            <span className={styles.summaryValue}>{data.total_orders}</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Số đơn đã huỷ</span>
            <span className={styles.summaryValue} style={{ color: '#e74c3c' }}>
              {data.cancelled_count}
            </span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Tỷ lệ huỷ đơn</span>
            <span
              className={styles.summaryValue}
              style={{ color: data.cancellation_rate > 10 ? '#e74c3c' : '#27ae60' }}
            >
              {data.cancellation_rate.toFixed(1)}%
            </span>
            <span className={styles.summarySub}>
              {data.cancellation_rate > 10 ? 'Cao — cần xem xét' : 'Bình thường'}
            </span>
          </div>
        </div>
      )}

      {/* Lý do huỷ */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Lý do huỷ đơn</h3>
            <p className={styles.cardDesc}>Nhóm theo nội dung lý do</p>
          </div>
        </div>

        {loading || !data ? (
          <div className={styles.empty}>Đang tải...</div>
        ) : !reasonChart.length ? (
          <div className={styles.empty}>Không có đơn nào bị huỷ trong kỳ</div>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(220, reasonChart.length * 40)}>
            <BarChart
              data={reasonChart}
              layout="vertical"
              margin={{ top: 10, right: 40, left: 140, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" stroke="#999" fontSize={11} allowDecimals={false} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="reason"
                stroke="#333"
                fontSize={12}
                width={130}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #eee', borderRadius: 8, fontSize: 13 }}
              />
              <Bar dataKey="count" fill="#e74c3c" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Danh sách đơn huỷ gần đây */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Danh sách đơn huỷ gần đây</h3>
            <p className={styles.cardDesc}>Tối đa 20 đơn mới nhất trong kỳ</p>
          </div>
          <button
            className={styles.exportBtn}
            onClick={exportCancelled}
            disabled={!data?.recent?.length}
          >
            Xuất CSV
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Bàn</th>
                <th>Nhân viên</th>
                <th style={{ textAlign: 'right' }}>Thành tiền</th>
                <th>Lý do</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {loading || !data ? (
                <tr><td colSpan={6} className={styles.emptyCell}>Đang tải...</td></tr>
              ) : !data.recent.length ? (
                <tr><td colSpan={6} className={styles.emptyCell}>Không có đơn huỷ</td></tr>
              ) : data.recent.map((o) => (
                <tr key={o.id}>
                  <td data-label="Mã đơn" className={styles.orderCode}>{o.order_code}</td>
                  <td data-label="Bàn">{o.table?.name || '—'}</td>
                  <td data-label="Nhân viên" className={styles.muted}>{o.staff?.full_name || '—'}</td>
                  <td data-label="Thành tiền" style={{ textAlign: 'right', fontWeight: 600 }}>
                    {formatCurrency(o.final_amount)}
                  </td>
                  <td data-label="Lý do">{o.cancelled_reason || '—'}</td>
                  <td data-label="Ngày tạo" className={styles.muted}>{formatDateTime(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default OperationsReport;
