// ActivLogUtils.js
import React from 'react';

export const formatDateTime = (iso, styles) => {
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

export const computeRevenue = (transaction) => {
    return (transaction.transaction_items || []).reduce(
        (sum, item) => sum + (item.product_unit_price || 0) * (item.quantity_bought || 0),
        0
    );
};

export const buildDiffForTransaction = (txn, transactions) => {
    if (!txn.prev_txn_id) return null;

    const parentTxn = transactions.find(t => t.transaction_id === txn.prev_txn_id);
    if (!parentTxn) return null;

    const oldItems = parentTxn.transaction_items || [];
    const newItems = txn.transaction_items || [];
    const itemMap = new Map();

    oldItems.forEach(item => itemMap.set(item.product_id, { oldItem: item }));
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

export const generateSortedLogs = (transactions) => {
    const activityPriority = { cancel: 5, pending: 4, sale: 3, voided: 2, correction: 1 };

    const logs = transactions.flatMap(txn => {
        const entries = [];
        // checks if txn is new or edit
        if (txn.prev_txn_id) {
            entries.push({
                id: txn.transaction_id,
                activityType: 'correction',
                details: `Adjusted ${txn.status === 'pending' ? 'pending' : 'completed'} sale #${txn.prev_txn_id} as sale #${txn.transaction_id}`,
                doneAt: txn.created_at,
                doneBy: txn.created_by_user.username,
                transaction_details: txn,
                reason_for_edit: txn.reason_for_edit,
            })
        } else {
            const isDirectSale = txn.status === 'completed' &&
                (new Date(txn.completed_at) - new Date(txn.created_at) < 1000);

            entries.push({
                id: txn.transaction_id,
                activityType: `${isDirectSale === true ? 'sale' : 'pending'}`,
                details: isDirectSale
                    ? `Created completed sale #${txn.transaction_id}`
                    : `Created pending sale #${txn.transaction_id}`,
                doneAt: txn.created_at,
                doneBy: txn.created_by_user.username,
                transaction_details: txn,
            })
        }

        if (txn.completed_at) {
            const isDirectSale = txn.status === 'completed' &&
                (new Date(txn.completed_at) - new Date(txn.created_at) < 1000);

            if (!isDirectSale) {
                entries.push({
                    id: txn.transaction_id,
                    activityType: `${txn.status === 'cancelled' ? 'cancel' : 'sale'}`,
                    details: `${txn.status === 'completed' ? 'Completed' : 'Cancelled'} sale #${txn.transaction_id}`,
                    doneAt: txn.completed_at,
                    doneBy: txn.created_by_user.username,
                    transaction_details: txn,
                });
            }
        }

        if (txn.voided_at) {
            entries.push({
                id: txn.transaction_id,
                activityType: 'voided',
                details: `Voided ${txn.status === 'completed' ? 'completed' : 'pending'} sale #${txn.transaction_id}`,
                doneAt: txn.voided_at,
                doneBy: txn.created_by_user.username,
                transaction_details: txn,
                reason_for_edit: txn.reason_for_edit,
            });
        }
        return entries;
    });

    return logs.sort((a, b) => {
        const dateA = new Date(a.doneAt).getTime();
        const dateB = new Date(b.doneAt).getTime();
        if (dateB === dateA) {
            return (activityPriority[a.activityType] || 99) - (activityPriority[b.activityType] || 99);
        }
        return dateB - dateA;
    }).map((log, index) => ({ ...log, log_id: index + 1 }));
};