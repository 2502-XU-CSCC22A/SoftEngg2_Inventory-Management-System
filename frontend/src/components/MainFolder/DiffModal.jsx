// DiffModal.jsx
import React from 'react';
import styles from './ActivLog.module.css';
import { formatToPesos } from '../../utils/utils';
import { buildDiffForTransaction } from './ActivLogUtils';

const DiffModal = ({ activeTransaction, transactions, onClose }) => {
    if (!activeTransaction) return null;

    const diff = buildDiffForTransaction(activeTransaction, transactions);

    return (
        <div className={styles['diff-popup-overlay']} role="dialog" aria-modal="true">
            <div className={styles['diff-popup']}>
                <div className={styles['diff-popup-header']}>
                    <div>
                        <h3>Transaction edit diff</h3>
                        <p>Compare sale #{activeTransaction.prev_txn_id} with #{activeTransaction.transaction_id}</p>
                    </div>
                    <button type="button" className={styles['popup-close']} onClick={onClose} aria-label="Close diff popup">
                        ×
                    </button>
                </div>
                <div className={styles['diff-popup-body']}>
                    {!diff ? (
                        <p className={styles['diff-empty']}>No parent transaction found to compare.</p>
                    ) : (
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
                                                <td className={item.quantityDelta > 0 ? styles['delta-positive'] : item.quantityDelta === 0 ? styles['delta-neutral'] : styles['delta-negative']}>
                                                    {item.quantityDelta >= 0 ? '+' : ''}{item.quantityDelta}
                                                </td>
                                                <td>{formatToPesos(item.unitPrice)}</td>
                                                <td className={item.revenueDelta > 0 ? styles['delta-positive'] : item.revenueDelta === 0 ? styles['delta-neutral'] : styles['delta-negative']}>
                                                    {item.revenueDelta >= 0 ? '+' : ''}{formatToPesos(item.revenueDelta)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DiffModal;