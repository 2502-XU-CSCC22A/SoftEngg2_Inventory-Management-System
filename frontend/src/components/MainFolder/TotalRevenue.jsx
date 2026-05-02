import React, { useEffect, useState } from 'react';
import { Navbar } from './Navbar';
import styles from './TotalRevenue.module.css';

const TotalRevenue = () => {
  const [data, setData] = useState({
    revenue: 0,
    quantity: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchTotalRevenue = async () => {
      try {
        // Updated to use the correct API endpoint with proxy
        const res = await fetch('/api/reports/total-revenue');
        
        if (!res.ok) {
          throw new Error('Failed to fetch total revenue data');
        }

        const result = await res.json();

        setData({  
          revenue: result.totalRevenue || 0, 
          quantity: result.totalQuantitySold || 0, 
          loading: false, 
          error: null
        });
      } catch (err) {
        console.error('Error fetching total revenue:', err);
        setData(prev => ({ 
          ...prev, 
          loading: false, 
          error: err.message 
        }));
      }
    };
    
    fetchTotalRevenue();
  }, []);

  if (data.loading) return <div className={styles.loadingState}>Loading...</div>;
  if (data.error) return <div className={styles.errorState}>Error: {data.error}</div>;

  return (
    <>
      <Navbar />

      <div className={styles.container}>

        <div className={styles.leftPanel}>
          <div className={styles.leftContent}>
            <h1 className={styles.revenueAmount}>
              ₱{data.revenue.toLocaleString()}
            </h1>
            <p className={styles.date}>Overall Revenue</p>
          </div>

          <button
            className={styles.revenueBtn}
            onClick={() => window.history.back()}
          >
            Back
          </button>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.chartBox}>
            <p style={{ textAlign: 'center', color: '#aaa' }}>
              Overall Revenue Trend
            </p>
          </div>

          <div className={styles.info}>

            <h2 className={styles.monthSelectTitle}>Overall</h2>
            <hr className={styles.divider} />
            <div className={styles.infoItem}>
              <span className={styles.starIcon}>☆</span>
              <div className={styles.infoText}>
                <p className={styles.label}>Income</p>
                <p className={styles.subLabel}>Overall Sales</p>
              </div>
              <p className={styles.value}>
                ₱{data.revenue.toLocaleString()}
              </p>
            </div>

            <hr className={styles.divider} />

            <div className={styles.infoItem}>
              <span className={styles.starIcon}>☆</span>
              <div className={styles.infoText}>
                <p className={styles.label}>Quantity Sold</p>
                <p className={styles.subLabel}>Overall Sold Products</p>
              </div>
              <p className={styles.value}>{data.quantity.toLocaleString()}</p>
            </div>

          </div>
          
        </div>
      </div>
    </>
  );
};

export default TotalRevenue;