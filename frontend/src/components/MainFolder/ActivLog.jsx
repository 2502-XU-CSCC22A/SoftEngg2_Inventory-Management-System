import React, { useState } from 'react';
import { Navbar } from './Navbar';
import styles from './ActivLog.module.css';
import { useTransactions } from '../../hooks/useTransactions';


// temporary data for visualization only, pwede na siya i-replace sa actual data nga mag-generate sa backend
const ActivLog = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const { queryAll } = useTransactions(selectedMonth, selectedYear);

  const transactions = queryAll.data?.data || [];

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

  const logs = transactions.flatMap(txn => {
    const entries = [];

    if (txn.prev_txn_id) {
      entries.push({
        id: txn.transaction_id,
        activityType: 'correction',
        details: `Adjusted sale #${txn.prev_txn_id} as sale #${txn.transaction_id}`,
        doneAt: txn.created_at,
        doneBy: txn.created_by_user.username,
        transaction_details: txn,
        reason_for_edit: txn.reason_for_edit,
      });
    }
    else {
      entries.push({
        id: txn.transaction_id,
        activityType: 'sale',
        details: `Create sale #${txn.transaction_id}`,
        doneAt: txn.created_at,
        doneBy: txn.created_by_user.username,
        transaction_details: txn,
        reason_for_edit: txn.reason_for_edit,
      });
    }

    if (txn.voided_at) {
      entries.push({
        id: txn.transaction_id,
        activityType: 'voided',
        details: `Voided sale #${txn.transaction_id}`,
        doneAt: txn.voided_at,
        doneBy: txn.created_by_user.username, // change to voided_by later
        transaction_details: txn,
        reason_for_edit: txn.reason_for_edit,
      });
    }

    return entries;
  });
  
  const activityPriority = {
    sale: 3,
    voided: 2,
    correction: 1
  };

  const sortedLogs = logs.sort((a, b) => {
    const dateA = new Date(a.doneAt).getTime();
    const dateB = new Date(b.doneAt).getTime();

    if (dateB === dateA) {
      const priorityA = activityPriority[a.activityType] || 99;
      const priorityB = activityPriority[b.activityType] || 99;

      return priorityA - priorityB;
    }

    return dateB - dateA;
  }).map((log, index) => ({ ...log, log_id: index + 1 }));

  const monthNames = Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2026, i))
  );

  const startYear = 2026;
  const endYear = 2126;

  const futureYears = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  
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
          <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className={styles.yearDropdown}
          >
              {futureYears.map(year => (
                  <option key={year} value={year}>
                      {year}
                  </option>
              ))}
          </select>
        
          <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className={styles.monthDropdown}
          >
            {monthNames.map((name, index) => (
                <option key={index} value={index + 1}>
                    {name}
                </option>
            ))}
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
              </tr>
            </thead>
            <tbody>
              {
                sortedLogs.map(log => (
                  <tr key={log.log_id}>
                    <td>{log.id}</td>
                    <td>{log.activityType}</td>
                    <td>{formatDateTime(log.doneAt)}</td>
                    <td>{log.doneBy}</td>
                    <td>{log.details}</td>
                    <td>{log.reason_for_edit}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ActivLog;