import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './Navbar';
import styles from './ActivLog.module.css';

const ActivLog = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const fetchLog = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Updated to use the correct API endpoint with proxy
        const response = await fetch('/api/reports/activity-log');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch activity log: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching activity log:', err);
        setError(err.message);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLog();
  }, []);

  const formatDateTime = (iso) => {
    if (!iso) return { date: 'N/A', time: 'N/A' };
    
    try {
      const d = new Date(iso);
      // Check if date is valid
      if (isNaN(d.getTime())) {
        return { date: 'Invalid Date', time: 'Invalid Time' };
      }
      
      const date = d.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
      const time = d.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      
      return { date, time };
    } catch (err) {
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }
  };

  const activityLabel = (type) => {
    const labels = { 
      sale: 'Remove', 
      restock: 'Add', 
      remove: 'Remove', 
      add: 'Add',
      SALE: 'Remove',
      RESTOCK: 'Add',
      REMOVE: 'Remove',
      ADD: 'Add'
    };
    return labels[type] || (typeof type === 'string' ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown');
  };

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return transactions;
    
    return transactions.filter((tx) => {
      const productName = (tx.name || tx.product_name || '').toLowerCase();
      const type = (tx.type || '').toLowerCase();
      const activity = activityLabel(tx.type).toLowerCase();
      const quantity = String(tx.qty || tx.quantity_bought || '');
      
      return productName.includes(query) || 
             type.includes(query) || 
             activity.includes(query) ||
             quantity.includes(query);
    });
  }, [searchQuery, transactions]);

  const resultNote = searchQuery
    ? `${filteredTransactions.length} result${filteredTransactions.length !== 1 ? 's' : ''} found`
    : '';

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.loadingState}>Loading activity log...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className={styles.errorState}>
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <input 
          type="search" 
          placeholder="Search by product, activity, or quantity..." 
          className={styles.search1} 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search activity log"
        />
        
        <div className={styles.actions}>
          <div className={styles['center-title']}>
            <h2 className={styles.title}>Activity Log</h2>
            {resultNote && <p className={styles['result-note']}>{resultNote}</p>}
          </div>
        </div>
        
        <div className={styles['table-container']}>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Date & Time</th>
                <th>Quantity</th>
                <th>Activity</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr className={styles['empty-row']}>
                  <td colSpan="4">
                    {searchQuery 
                      ? `No transactions found matching "${searchQuery}"`
                      : 'No transactions found'}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx, index) => {
                  const productName = tx.name || tx.product_name || 'Unknown Product';
                  const quantity = tx.qty || tx.quantity_bought || 0;
                  const type = tx.type || 'unknown';
                  const datetime = tx.datetime || tx.transaction_timestamp || tx.created_at;
                  const { date, time } = formatDateTime(datetime);
                  
                  return (
                    <tr key={tx.id || tx.item_id || index}>
                      <td>
                        <span className={styles.star}>☆</span> {productName}
                      </td>
                      <td>
                        <span className={styles['dt-date']}>{date}</span>
                        <span className={styles['dt-time']}>{time}</span>
                      </td>
                      <td>{quantity}</td>
                      <td>{activityLabel(type)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ActivLog;