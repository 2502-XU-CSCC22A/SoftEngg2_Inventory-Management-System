// ActivLog.jsx
import React, { useState, useMemo } from 'react';
import { Navbar } from './Navbar';
import styles from './ActivLog.module.css';
import { useTransactions } from '../../hooks/useTransactions';
import { formatDateTime, generateSortedLogs } from './ActivLogUtils';
import ExpandableReason from './ExpandableReason';
import DiffModal from './DiffModal';

const ActivLog = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [activeDiffTransaction, setActiveDiffTransaction] = useState(null);

  const { queryAll } = useTransactions(selectedMonth, selectedYear);
  const transactions = queryAll.data?.data || [];

  // useMemo ensures we only recalculate the logs if 'transactions' actually change
  const sortedLogs = useMemo(() => generateSortedLogs(transactions), [transactions]);

  // Dropdown options
  const monthNames = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2026, i))
  );
  const futureYears = Array.from({ length: 2126 - 2026 + 1 }, (_, i) => 2026 + i);

  return (
    <div className={styles['container-root']}>
      <Navbar />
      <section id="sales" className={styles.page}>
        <div className={styles.actions}>
          <div className={styles['center-title']}>
            <h2 className={styles.title}>Activity Log</h2>
          </div>
        </div>

        <div className={styles.filters}>
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className={styles.yearDropdown}>
            {futureYears.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className={styles.monthDropdown}>
            {monthNames.map((name, index) => <option key={index} value={index + 1}>{name}</option>)}
          </select>
        </div>

        <div className={styles['table-container']}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Activity</th>
                <th>Done at</th>
                <th>Done by</th>
                <th>Activity Description</th>
                <th>Activity Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedLogs.map(log => {
                const canShowDiff = log.activityType === 'correction' && log.transaction_details?.prev_txn_id &&
                  transactions.some(t => t.transaction_id === log.transaction_details.prev_txn_id);

                return (
                  <tr key={log.log_id}>
                    <td>{log.id}</td>
                    <td>{log.activityType}</td>
                    <td>{formatDateTime(log.doneAt, styles)}</td>
                    <td>{log.doneBy}</td>
                    <td>{log.details}</td>
                    <td><ExpandableReason text={log.reason_for_edit} /></td>
                    <td>
                      {canShowDiff && (
                        <button type="button" className={styles['diff-button']} onClick={() => setActiveDiffTransaction(log.transaction_details)}>
                          Show diff
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <DiffModal
          activeTransaction={activeDiffTransaction}
          transactions={transactions}
          onClose={() => setActiveDiffTransaction(null)}
        />
      </section>
    </div>
  );
};

export default ActivLog;