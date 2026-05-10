import React, { useState } from 'react';
import { Navbar } from './Navbar';
import styles from './ActivLog.module.css';
import { useTransactions } from '../../hooks/useTransactions';
import { formatToPesos } from '../../utils/utils';


const ExpandableReason = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;

  const isLong = text.length > 15;
  const displayed = expanded || !isLong ? text : text.slice(0, 15) + '\u2026';

  return (
    <span>
      {displayed}
      {isLong && (
        <>
          {' '}
          <button className={styles['see-toggle']} onClick={() => setExpanded(e => !e)}>
            {expanded ? 'See less' : 'See more'}
          </button>
        </>
      )}
    </span>
  );
};

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

  const [activeDiffTransaction, setActiveDiffTransaction] = useState(null);

  const computeRevenue = (transaction) => {
    return (transaction.transaction_items || []).reduce(
      (sum, item) => sum + (item.product_unit_price || 0) * (item.quantity_bought || 0),
      0
    );
  };

  const buildDiffForTransaction = (txn) => {
    if (!txn.prev_txn_id) {
      return null;
    }
  
    const parentTxn = transactions.find(t => t.transaction_id === txn.prev_txn_id);

    if (!parentTxn) {
      return null;
    }
    
    const oldItems = parentTxn.transaction_items || [];
    const newItems = txn.transaction_items || [];
    const itemMap = new Map();

    oldItems.forEach(item => {
      itemMap.set(item.product_id, { oldItem: item });
    });

    newItems.forEach(item => {
      const existing = itemMap.get(item.product_id) || {};
      itemMap.set(item.product_id, { ...existing, newItem: item });
    });

    const itemDiffs = Array.from(itemMap.values()).map(({ oldItem, newItem }) => {
      const oldQuantity = oldItem?.quantity_bought ?? 0;
      const newQuantity = newItem?.quantity_bought ?? 0;
      const unitPrice = newItem?.product_unit_price ?? oldItem?.product_unit_price ?? 0;
      return {
        product_id: oldItem?.product_id ?? newItem?.product_id,
        product_name: newItem?.product_name || oldItem?.product_name || `Product #${oldItem?.product_id ?? newItem?.product_id}`,
        oldQuantity,
        newQuantity,
        quantityDelta: newQuantity - oldQuantity,
        unitPrice,
        revenueDelta: (newQuantity - oldQuantity) * unitPrice,
      };
    }).sort((a, b) => a.product_name.localeCompare(b.product_name));

    return {
      previousTransactionId: parentTxn.transaction_id,
      oldRevenue: computeRevenue(parentTxn),
      newRevenue: computeRevenue(txn),
      revenueDelta: computeRevenue(txn) - computeRevenue(parentTxn),
      itemDiffs,
    };
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {
                sortedLogs.map(log => {
                  const canShowDiff = log.activityType === 'correction' && log.transaction_details?.prev_txn_id &&
                    transactions.some(t => t.transaction_id === log.transaction_details.prev_txn_id);
                  return (
                    <tr key={log.log_id}>
                      <td>{log.id}</td>
                      <td>{log.activityType}</td>
                      <td>{formatDateTime(log.doneAt)}</td>
                      <td>{log.doneBy}</td>
                      <td>{log.details}</td>
                      <td><ExpandableReason text={log.reason_for_edit} /></td>
                      <td>
                        {canShowDiff ? (
                          <button
                            type="button"
                            className={styles['diff-button']}
                            onClick={() => setActiveDiffTransaction(log.transaction_details)}
                          >
                            Show diff
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>

        {activeDiffTransaction && (
          <div className={styles['diff-popup-overlay']} role="dialog" aria-modal="true">
            <div className={styles['diff-popup']}>
              <div className={styles['diff-popup-header']}>
                <div>
                  <h3>Transaction edit diff</h3>
                  <p>Compare sale #{activeDiffTransaction.prev_txn_id} with #{activeDiffTransaction.transaction_id}</p>
                </div>
                <button
                  type="button"
                  className={styles['popup-close']}
                  onClick={() => setActiveDiffTransaction(null)}
                  aria-label="Close diff popup"
                >
                  ×
                </button>
              </div>
              <div className={styles['diff-popup-body']}>
                {(() => {
                  const diff = buildDiffForTransaction(activeDiffTransaction);
                  if (!diff) {
                    return <p className={styles['diff-empty']}>No parent transaction found to compare.</p>;
                  }

                  return (
                    <>
                      <div className={styles['diff-summary']}>
                        <span>Previous revenue: {formatToPesos(diff.oldRevenue)}</span>
                        <span>New revenue: {formatToPesos(diff.newRevenue)}</span>
                        <span className={diff.revenueDelta >= 0 ? styles['delta-positive'] : styles['delta-negative']}>
                          Δ {diff.revenueDelta >= 0 ? '+' : ''}{formatToPesos(diff.revenueDelta)}
                        </span>
                      </div>

                      <div className={styles['diff-table-wrap']}>
                        <table className={styles['diff-table']}>
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Old Qty</th>
                              <th>New Qty</th>
                              <th>Qty Δ</th>
                              <th>Unit Price</th>
                              <th>Δ Revenue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {diff.itemDiffs.map(item => (
                              <tr key={item.product_id}>
                                <td>{item.product_name}</td>
                                <td>{item.oldQuantity}</td>
                                <td>{item.newQuantity}</td>
                                <td className={item.quantityDelta >= 0 ? styles['delta-positive'] : styles['delta-negative']}>
                                  {item.quantityDelta >= 0 ? '+' : ''}{item.quantityDelta}
                                </td>
                                <td>{formatToPesos(item.unitPrice)}</td>
                                <td className={item.revenueDelta >= 0 ? styles['delta-positive'] : styles['delta-negative']}>
                                  {item.revenueDelta >= 0 ? '+' : ''}{formatToPesos(item.revenueDelta)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ActivLog;