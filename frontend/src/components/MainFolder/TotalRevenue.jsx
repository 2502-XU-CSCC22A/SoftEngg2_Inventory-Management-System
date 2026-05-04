import React, { useState, useMemo } from 'react';
import { Navbar } from './Navbar';
import styles from './TotalRevenue.module.css';
import { useTransactions } from '../../hooks/useTransactions.js';
import { formatToPesos } from '../../utils/utils.js';

const TotalRevenue = () => {
  const { query } = useTransactions();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isYearPopupOpen, setIsYearPopupOpen] = useState(false);

  const yearlyData = useMemo(() => {
    const transactions = query.data || [];
    const years = {};

    transactions.forEach(txn => {
      const date = new Date(txn.transaction_timestamp);
      const year = date.getFullYear();
      
      if (!years[year]) {
        years[year] = {
          revenue: 0,
          quantity: 0,
          monthlyData: {}
        };
      }
     
      const month = date.getMonth(); // 0-11
      if (!years[year].monthlyData[month]) {
        years[year].monthlyData[month] = { revenue: 0, quantity: 0 };
      }

      txn.transaction_items?.forEach(item => {
        const revenue = item.quantity_bought * item.product_unit_price;
        years[year].revenue += revenue;
        years[year].quantity += item.quantity_bought;
        years[year].monthlyData[month].revenue += revenue;
        years[year].monthlyData[month].quantity += item.quantity_bought;
      });
    });

    return years;
  }, [query.data]);

  // Get available years (sorted descending)
  const availableYears = useMemo(() => {
    const years = Object.keys(yearlyData).map(Number);
    return years.sort((a, b) => b - a);
  }, [yearlyData]);

  // Get data for selected year
  const currentYearData = useMemo(() => {
    return yearlyData[selectedYear] || { revenue: 0, quantity: 0, monthlyData: {} };
  }, [yearlyData, selectedYear]);

  // Prepare chart data (max revenue for scaling)
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map((_, index) => {
      return currentYearData.monthlyData[index]?.revenue || 0;
    });
    
    const maxRevenue = Math.max(...data, 1);
    const chartHeight = 160;
    
    return { data, maxRevenue, chartHeight };
  }, [currentYearData]);

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    setIsYearPopupOpen(false);
  };

  const handleBack = () => {
    window.history.back();
  };

  if (query.isLoading) return <div className={styles.loading}>Loading yearly data...</div>;
  if (query.isError) return <div className={styles.error}>Failed to load transactions.</div>;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <>
      <Navbar />
      <div className={`${styles.container} ${styles['total-revenue-page']}`}>
        {/* Left Panel */}
        <div className={`${styles['left-panel']} ${styles['revenue-panel']}`}>
          <div className={styles['revenue-summary']}>
            <h1>{formatToPesos(currentYearData.revenue)}</h1>
            <p className={styles.date}>Total Revenue for {selectedYear}</p>
          </div>
          <button className={styles['back-btn']} onClick={handleBack}>
            Back
          </button>
        </div>

        <div className={styles['right-panel']}>
          <div className={styles['chart-box']}>
            <h3 className={styles['chart-title']}>Monthly Revenue {selectedYear}</h3>
            <div className={styles['chart-container']}>
              {chartData.data.map((revenue, index) => {
                const barHeight = (revenue / chartData.maxRevenue) * chartData.chartHeight;
                return (
                  <div key={index} className={styles['chart-bar-wrapper']}>
                    <div className={styles['chart-bar']} style={{ height: `${barHeight}px` }}>
                      <span className={styles['chart-tooltip']}>
                        {formatToPesos(revenue)}
                      </span>
                    </div>
                    <span className={styles['chart-label']}>{monthNames[index].slice(0, 3)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.info}>
            <div className={styles['section-header']}>
              <h2 className={styles['section-title']}>Year {selectedYear} Summary</h2>
              <button className={styles['year-selector-btn']} onClick={() => setIsYearPopupOpen(true)} aria-label="Select year">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10.25" stroke="#222" strokeWidth="2" />
                  <path d="M8 11l4 4 4-4" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            <div className={styles['info-item']}>
              <span className={styles['star-icon']}>★</span>
              <div className={styles['info-text']}>
                <p className={styles.label}>Total Income</p>
                <p className={styles['sub-label']}>Overall Sales Revenue</p>
              </div>
              <p className={styles.value}>{formatToPesos(currentYearData.revenue)}</p>
            </div>

            <div className={styles['info-item']}>
              <span className={styles['star-icon']}>★</span>
              <div className={styles['info-text']}>
                <p className={styles.label}>Total Quantity Sold</p>
                <p className={styles['sub-label']}>Overall Products Sold</p>
              </div>
              <p className={styles.value}>{currentYearData.quantity.toLocaleString()}</p>
            </div>

            <div className={styles['info-item']}>
              <span className={styles['star-icon']}>★</span>
              <div className={styles['info-text']}>
                <p className={styles.label}>Average Monthly Revenue</p>
                <p className={styles['sub-label']}>Revenue ÷ 12 months</p>
              </div>
              <p className={styles.value}>
                {formatToPesos(Math.round(currentYearData.revenue / 12))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isYearPopupOpen && (
        <div className={styles['year-popup-overlay']} onClick={() => setIsYearPopupOpen(false)}>
          <div className={styles['year-popup-card']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['year-popup-header']}>
              <h3>Select a Year</h3>
              <button className={styles['close-popup']} onClick={() => setIsYearPopupOpen(false)}>
                ×
              </button>
            </div>
            <div className={styles['year-grid']}>
              {availableYears.length === 0 ? (<p>No transactions yet.</p> ) : ( availableYears.map((year) => (
                  <button key={year} className={`${styles['year-option']} ${selectedYear === year ? styles.active : ''}`} onClick={() => handleYearSelect(year)}>
                    {year}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TotalRevenue;