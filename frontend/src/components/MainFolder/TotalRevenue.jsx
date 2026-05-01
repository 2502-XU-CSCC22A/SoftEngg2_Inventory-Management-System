import React from 'react';
import { Navbar } from './Navbar';
import styles from './TotalRevenue.module.css';

const TotalRevenue = () => {
  const handleBack = () => {
    window.history.back();
  };

 

  return (
    <>
      <Navbar />
      <div className={`${styles.container} ${styles['total-revenue-page']}`}>
        {/* Left Panel */}
        <div className={`${styles['left-panel']} ${styles['revenue-panel']}`}>
          <div className={styles['revenue-summary']}>
            <h1>₱20,000</h1>
            <p className={styles.date}>Overall Revenue</p>
          </div>
          <button className={styles['back-btn']} onClick={handleBack}>Back</button>
        </div>

        
        <div className={styles['right-panel']}>
         
          <div className={styles['chart-box']}>
            // Placeholder for the chart component, pwede na siya i-replace sa actual chart nga mag-display sa revenue data
          </div>

          <div className={styles.info}>
            <h2 className={styles['section-title']}>Overall</h2>

            <div className={styles['info-item']}>
              <span className={styles['star-icon']}>★</span>
              <div className={styles['info-text']}>
                <p className={styles.label}>Income</p>
                <p className={styles['sub-label']}>Overall Sales</p>
              </div>
              <p className={styles.value}>₱10,000</p>
            </div>

            <div className={styles['info-item']}>
              <span className={styles['star-icon']}>★</span>
              <div className={styles['info-text']}>
                <p className={styles.label}>Quantity Sold</p>
                <p className={styles['sub-label']}>Overall Sold Products</p>
              </div>
              <p className={styles.value}>100</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TotalRevenue;