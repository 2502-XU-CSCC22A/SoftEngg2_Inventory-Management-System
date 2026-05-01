import React, { useState } from 'react';

import { Navbar } from './Navbar';
import styles from './Monthlyreport.module.css';

//temporary data rani for monthly report, pwede na siya i-replace sa actual data gikan sa backend
const Monthlyreport = () => {
  const monthlyData = {
    'January': { revenue: 5000, income: 800, quantity: 5 },
    'February': { revenue: 6200, income: 950, quantity: 7 },
    'March': { revenue: 7700, income: 1000, quantity: 10 },
    'April': { revenue: 8500, income: 1200, quantity: 12 },
    'May': { revenue: 9200, income: 1350, quantity: 15 },
    'June': { revenue: 10100, income: 1500, quantity: 18 },
    'July': { revenue: 10900, income: 1600, quantity: 20 },
    'August': { revenue: 11400, income: 1750, quantity: 22 },
    'September': { revenue: 12500, income: 1900, quantity: 24 },
    'October': { revenue: 13100, income: 2050, quantity: 27 },
    'November': { revenue: 14000, income: 2200, quantity: 30 },
    'December': { revenue: 15200, income: 2400, quantity: 35 }
  };

  const months = Object.keys(monthlyData);
  const [currentMonth, setCurrentMonth] = useState('March');
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const data = monthlyData[currentMonth];

  const handleMonthSelect = (month) => {
    setCurrentMonth(month);
    setIsPopupOpen(false);
  };

  const handleOverallRevenue = () => {
    window.location.href = '/totalrevenue';
  };

  return (
    <>
      <Navbar />
      
      <div className={styles.container}>
        <div className={styles['left-panel']}>
          <h1>₱{data.revenue.toLocaleString()}</h1>
          <p className={styles.date}>{currentMonth}</p>
          <button className={styles['revenue-btn']} onClick={handleOverallRevenue}>
            Overall Revenue
          </button>
        </div>

        <div className={styles['right-panel']}>
          <div className={styles['chart-box']}></div>
          <div className={styles.info}>
            <div className={styles['month-select']}>
              <h2>Select a Month</h2>
              <button
                className={styles['arrow-btn']}
                onClick={() => setIsPopupOpen(!isPopupOpen)}
              ></button>
            </div>

            <hr className={styles.divider} />

            {/* Income Info */}
            <div className={styles['info-item']}>
              <span className={styles['star-icon']}>&#9734;</span>
              <div className={styles['info-text']}>
                <p className={styles.label}>Income</p>
                <p className={styles['sub-label']}>Overall Sales</p>
              </div>
              <p className={styles.value}>₱{data.income}</p>
            </div>

            <hr className={styles.divider} />

            <div className={styles['info-item']}>
              <span className={styles['star-icon']}>&#9734;</span>
              <div className={styles['info-text']}>
                <p className={styles.label}>Quantity Sold</p>
                <p className={styles['sub-label']}>Overall Sold Products</p>
              </div>
              <p className={styles.value}>{data.quantity}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pop-up for monthly selection */}
      <div
        className={`${styles['month-popup-overlay']} ${isPopupOpen ? '' : styles.hidden}`}
        onClick={() => setIsPopupOpen(false)}
      >
        <div className={styles['month-popup-card']} onClick={(e) => e.stopPropagation()}>
          <div className={styles['month-popup-header']}>
            <h3>Select a Month</h3>
            <button className={styles['close-popup']} onClick={() => setIsPopupOpen(false)}>
              x
            </button>
          </div>
          <div className={styles['month-grid']}>
            {months.map((month) => (
              <button
                key={month}
                className={styles['month-option']}
                onClick={() => handleMonthSelect(month)}
              >
                {month}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Monthlyreport;