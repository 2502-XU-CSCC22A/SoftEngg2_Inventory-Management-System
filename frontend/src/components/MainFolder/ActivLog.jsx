import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './Navbar';
import styles from './ActivLog.module.css';

const ActivLog = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const fetchLog = async () => {
      try {
        const response = await fetch('/api/activity-log');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setTransactions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLog();
  }, []);

  const formatDateTime = (iso) => {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return (
      <>
        <span className={styles['dt-date']}>{date}</span>
        <span className={styles['dt-time']}>{time}</span>
      </>
    );
  };

  const activityLabel = (type) => {
    const labels = { sale: 'Remove', restock: 'Add', remove: 'Remove', add: 'Add' };
    return labels[type] || type;
  };

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return transactions;
    return transactions.filter((tx) =>
      tx.name.toLowerCase().includes(query) ||
      tx.type.toLowerCase().includes(query) ||
      activityLabel(tx.type).toLowerCase().includes(query)
    );
  }, [searchQuery, transactions]);

  const resultNote = searchQuery
    ? `${filteredTransactions.length} result${filteredTransactions.length !== 1 ? 's' : ''} found`
    : '';

  if (loading) return <div>Loading activity log...</div>;

  return (
    <>
      <Navbar />
      <input type="search" placeholder="Search..." className={styles.search1} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
      <section id="sales" className={styles.page}>
        <div className={styles.actions}>
          <div className={styles['center-title']}>
            <h2 className={styles.title}>Activity Log</h2>
            <p className={styles['result-note']}>{resultNote}</p>
          </div>
        </div>
        <div className={styles['table-container']}>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Date&time</th>
                <th>Quantity</th>
                <th>Activity</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr className={styles['empty-row']}>
                  <td colSpan="4">No transactions found.</td>
                </tr>
              ) : (
                filteredTransactions.map((tx, index) => {
                  const qtyDisplay = tx.qty;
                  return (
                    <tr key={index}>
                      <td><span className={styles.star}>&#9734;</span> {tx.name}</td>
                      <td>{formatDateTime(tx.datetime)}</td>
                      <td>{qtyDisplay}</td>
                      <td>{activityLabel(tx.type)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default ActivLog;