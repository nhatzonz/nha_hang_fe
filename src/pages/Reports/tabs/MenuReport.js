import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import ReportDateRange from '../../../components/common/ReportDateRange';
import { reportsService } from '../../../services/reportsService';
import { formatCurrency, assetUrl } from '../../../utils/format';
import { exportToCsv } from '../../../utils/exportCsv';
import styles from '../Reports.module.scss';

const MenuReport = ({ range, setRange }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await reportsService.menuPerformance({ from: range.from, to: range.to });
      setData(data);
    } catch {
      toast.error('Không tải được báo cáo món ăn');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetch(); }, [fetch]);

  const exportBestSellers = () => {
    if (!data?.best_sellers?.length) return;
    exportToCsv(
      `top-mon-ban-chay-${range.from}_${range.to}`,
      [
        { key: 'name', label: 'Tên món' },
        { key: 'category', label: 'Danh mục' },
        { key: 'price', label: 'Giá niêm yết' },
        { key: 'quantity', label: 'Số lượng đã bán' },
        { key: 'revenue', label: 'Doanh thu (VNĐ)' },
      ],
      data.best_sellers,
    );
  };

  const renderItemRow = (item, index) => (
    <tr key={item.id}>
      <td data-label="#">{index + 1}</td>
      <td data-label="Món">
        <div className={styles.itemCell}>
          {item.image ? (
            <img src={assetUrl(item.image)} alt={item.name} className={styles.itemImg} />
          ) : (
            <div className={styles.itemImgPlaceholder}>🍽</div>
          )}
          <div>
            <strong>{item.name}</strong>
            <div className={styles.muted}>{item.category || 'Chưa phân loại'}</div>
          </div>
        </div>
      </td>
      <td data-label="Giá" style={{ textAlign: 'right' }}>{formatCurrency(item.price)}</td>
      <td data-label="Đã bán" style={{ textAlign: 'right', fontWeight: 700 }}>{item.quantity}</td>
      <td data-label="Doanh thu" style={{ textAlign: 'right', color: '#c0392b', fontWeight: 700 }}>
        {formatCurrency(item.revenue)}
      </td>
    </tr>
  );

  return (
    <>
      <div className={styles.toolbar}>
        <ReportDateRange from={range.from} to={range.to} onChange={setRange} />
      </div>

      {/* Summary */}
      {data && (
        <div className={styles.summaryRow}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Tổng số món</span>
            <span className={styles.summaryValue}>{data.summary.total_items}</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Món đã bán trong kỳ</span>
            <span className={styles.summaryValue} style={{ color: '#27ae60' }}>
              {data.summary.sold_items}
            </span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryLabel}>Món chưa bán trong kỳ</span>
            <span className={styles.summaryValue} style={{ color: '#e74c3c' }}>
              {data.summary.never_sold_count}
            </span>
          </div>
        </div>
      )}

      {/* Top 10 best sellers */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Top 10 món bán chạy</h3>
            <p className={styles.cardDesc}>Sắp xếp theo số lượng đã bán</p>
          </div>
          <button
            className={styles.exportBtn}
            onClick={exportBestSellers}
            disabled={!data?.best_sellers?.length}
          >
            Xuất CSV
          </button>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Món</th>
                <th style={{ textAlign: 'right' }}>Giá niêm yết</th>
                <th style={{ textAlign: 'right' }}>Đã bán</th>
                <th style={{ textAlign: 'right' }}>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {loading || !data ? (
                <tr><td colSpan={5} className={styles.emptyCell}>Đang tải...</td></tr>
              ) : !data.best_sellers.length ? (
                <tr><td colSpan={5} className={styles.emptyCell}>Chưa có dữ liệu</td></tr>
              ) : data.best_sellers.map((item, i) => renderItemRow(item, i))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Worst sellers */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Món bán chậm nhất</h3>
            <p className={styles.cardDesc}>Các món bán ít nhất trong kỳ — cân nhắc điều chỉnh</p>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Món</th>
                <th style={{ textAlign: 'right' }}>Giá</th>
                <th style={{ textAlign: 'right' }}>Đã bán</th>
                <th style={{ textAlign: 'right' }}>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {!data?.worst_sellers?.length ? (
                <tr><td colSpan={5} className={styles.emptyCell}>—</td></tr>
              ) : data.worst_sellers.map((item, i) => renderItemRow(item, i))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Never sold */}
      {data?.never_sold?.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>Món chưa từng được bán trong kỳ</h3>
              <p className={styles.cardDesc}>
                {data.never_sold.length} món cần chú ý — marketing hoặc loại khỏi menu
              </p>
            </div>
          </div>
          <div className={styles.neverSoldList}>
            {data.never_sold.map((item) => (
              <div key={item.id} className={styles.neverSoldItem}>
                {item.image ? (
                  <img src={assetUrl(item.image)} alt={item.name} />
                ) : (
                  <div className={styles.itemImgPlaceholder}>🍽</div>
                )}
                <div>
                  <strong>{item.name}</strong>
                  <div className={styles.muted}>
                    {item.category || 'Chưa phân loại'} · {formatCurrency(item.price)}
                    {!item.is_available && ' · Tạm ngưng'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default MenuReport;
