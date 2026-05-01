import React, { useState, useMemo } from 'react';
import { Navbar } from './Navbar';
import styles from './ActivLog.module.css';


// temporary data for visualization only, pwede na siya i-replace sa actual data nga mag-generate sa backend
const transactions = [
  { name: 'Wireless Earbuds Pro', datetime: '2026-04-05T10:32:00', qty: 2, type: 'remove' },
  { name: 'USB-C Hub 7-in-1', datetime: '2026-04-04T15:15:00', qty: 1, type: 'add' },
  { name: 'Mechanical Keyboard', datetime: '2026-04-03T11:20:00', qty: 3, type: 'remove' },
  { name: 'Gaming Monitor 27"', datetime: '2026-04-02T09:45:00', qty: 1, type: 'add' },
  { name: 'Webcam HD 1080p', datetime: '2026-04-01T14:05:00', qty: 10, type: 'remove' },
  { name: 'Wireless Earbuds Pro', datetime: '2026-03-31T08:50:00', qty: 20, type: 'add' },
  { name: 'Laptop Stand Aluminum', datetime: '2026-03-30T16:30:00', qty: 2, type: 'remove' },
  { name: 'Noise-Cancel Headset', datetime: '2026-03-29T12:00:00', qty: 1, type: 'add' },
  { name: 'Smart Power Strip', datetime: '2026-03-28T10:10:00', qty: 5, type: 'remove' },
  { name: 'Ergonomic Mouse', datetime: '2026-03-27T17:45:00', qty: 15, type: 'add' },
];

const ActivLog = () => {
  const [searchQuery, setSearchQuery] = useState('');

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

  const activityLabel = (type) => { const labels = { sale: 'Remove', restock: 'Add' }; return labels[type] || type;};

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return query ? transactions.filter((tx) =>
          tx.name.toLowerCase().includes(query) ||
          tx.type.toLowerCase().includes(query) ||
          activityLabel(tx.type).toLowerCase().includes(query)
        )
      : transactions;
  }, [searchQuery]);

  const resultNote = searchQuery
    ? `${filteredTransactions.length} result${filteredTransactions.length !== 1 ? 's' : ''} found`
    : '';

  return (
    <>
      <Navbar />
      <input
        type="search"
        placeholder="Search..."
        className={styles.search1}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

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
                  const qtyDisplay = tx.type === 'adjust'
                    ? (tx.qty > 0 ? '+' + tx.qty : String(tx.qty))
                    : tx.qty;
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