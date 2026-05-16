import styles from "./sales.module.css";
import { Navbar } from "../MainFolder/Navbar";
import AddSales from "./addsales";
import EditSales from "./editsales";
import { useState } from "react";
import { useTransactions } from "../../hooks/useTransactions.js";
import { formatToPesos } from "../../utils/utils.js";
import { FiEye, FiCheck, FiX, FiEdit2 } from "react-icons/fi";
import { MdPendingActions } from "react-icons/md";
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock } from "react-icons/hi";

const MAX_VISIBLE_PRODUCTS = 2;

// ── StatusBadge: premium pill with icon + label ──────────────────────────────
function StatusBadge({ status }) {
    const config = {
        pending: {
            cls: styles.statusPending,
            icon: <HiOutlineClock size={12} />,
            label: 'Pending',
        },
        completed: {
            cls: styles.statusCompleted,
            icon: <HiOutlineCheckCircle size={12} />,
            label: 'Completed',
        },
        cancelled: {
            cls: styles.statusCancelled,
            icon: <HiOutlineXCircle size={12} />,
            label: 'Cancelled',
        },
    };
    const { cls, icon, label } = config[status] || config.completed;
    return (
        <span className={`${styles.statusBadge} ${cls}`}>
            {icon}
            {label}
        </span>
    );
}

// ── ConfirmModal: polished confirmation dialog ───────────────────────────────
function ConfirmModal({ type, title, message, note, confirmLabel, onConfirm, onClose }) {
    const isCancel = type === 'cancel';
    return (
        <div className={styles.confirmModalOverlay} onClick={onClose}>
            <div className={styles.confirmModalCard} onClick={(e) => e.stopPropagation()}>
                {/* Icon header */}
                <div className={`${styles.confirmIconWrap} ${isCancel ? styles.confirmIconCancel : styles.confirmIconComplete}`}>
                    {isCancel
                        ? <HiOutlineXCircle size={32} />
                        : <HiOutlineCheckCircle size={32} />
                    }
                </div>
                <h3 className={styles.confirmModalTitle}>{title}</h3>
                <p className={styles.confirmModalBody}>{message}</p>
                {note && <p className={styles.confirmModalNote}>{note}</p>}
                <div className={styles.confirmModalActions}>
                    <button className={styles.confirmGoBack} onClick={onClose}>Go Back</button>
                    <button
                        className={isCancel ? styles.cancelButton : styles.completeButton}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── TransactionDetailModal: enhanced with status header strip ────────────────
function TransactionDetailModal({ transaction, onClose, formatDateTime, formatToPesos, onMarkComplete, onCancelOrder }) {
    const totalRevenue = transaction.transaction_items.reduce(
        (total, item) => total + item.product_unit_price * item.quantity_bought,
        0
    );
    const txnStatus = transaction.status || 'completed';
    const createdAt = transaction.created_at || transaction.datetime;
    const completedAt = transaction.completed_at || (txnStatus === 'completed' ? createdAt : null);

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>

                {/* Status strip at the very top */}
                <div className={`${styles.modalStatusStrip} ${styles[`strip_${txnStatus}`]}`}>
                    <StatusBadge status={txnStatus} />
                    {txnStatus === 'pending' && <span className={styles.modalStripHint}>Awaiting finalization</span>}
                    {txnStatus === 'completed' && <span className={styles.modalStripHint}>Finalized · Counted in revenue</span>}
                    {txnStatus === 'cancelled' && <span className={styles.modalStripHint}>Cancelled · Excluded from revenue</span>}
                </div>

                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Transaction Details</h2>
                    <button className={styles.modalClose} onClick={onClose}>✕</button>
                </div>

                <div className={styles.modalMeta}>
                    <div className={styles.modalMetaRow}>
                        <span className={styles.modalMetaLabel}>Created At</span>
                        <span className={styles.modalMetaValue}>
                            {formatDateTime(createdAt)}
                        </span>
                    </div>
                    <div className={styles.modalMetaRow}>
                        <span className={styles.modalMetaLabel}>Completed At</span>
                        <span className={styles.modalMetaValue}>
                            {completedAt ? formatDateTime(completedAt) : '—'}
                        </span>
                    </div>
                    <div className={styles.modalMetaRow}>
                        <span className={styles.modalMetaLabel}>Payment</span>
                        <span className={styles.modalMetaValue}>
                            <span className={styles.methodBadge}>{transaction.payment_type}</span>
                            {transaction.payment_type === "GCash" && transaction.payment_refstr && (
                                <span className={styles.transactionIdText}>
                                    &nbsp;ID: {transaction.payment_refstr}
                                </span>
                            )}
                        </span>
                    </div>
                </div>

                <div className={styles.modalProductsHeader}>
                    <span>Product</span>
                    <span>Qty</span>
                    <span>Unit Price</span>
                    <span>Subtotal</span>
                </div>
                <div className={styles.modalProductsList}>
                    {transaction.transaction_items.map((item, index) => (
                        <div key={index} className={styles.modalProductRow}>
                            <span className={styles.modalProductName}>{item.product_name || item.product_id}</span>
                            <span className={styles.modalProductQty}>{item.quantity_bought}</span>
                            <span className={styles.modalProductPrice}>{formatToPesos(item.product_unit_price)}</span>
                            <span className={styles.modalProductSubtotal}>{formatToPesos(item.product_unit_price * item.quantity_bought)}</span>
                        </div>
                    ))}
                </div>

                <div className={styles.modalFooter}>
                    <span className={styles.modalTotalLabel}>Total Revenue</span>
                    <span className={styles.modalTotalValue}>{formatToPesos(totalRevenue)}</span>
                </div>

                {/* Pending quick-actions */}
                {txnStatus === 'pending' && (
                    <div className={styles.modalActionRow}>
                        <button
                            className={styles.modalCompleteBtn}
                            onClick={() => { onMarkComplete(transaction); onClose(); }}
                        >
                            <FiCheck size={15} /> Mark as Completed
                        </button>
                        <button
                            className={styles.modalCancelBtn}
                            onClick={() => { onCancelOrder(transaction); onClose(); }}
                        >
                            <FiX size={15} /> Cancel Order
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Sales Page ───────────────────────────────────────────────────────────────
function Sales() {
    const [showaddsales, setshowaddsales] = useState(false);
    const [showeditsales, setshoweditsales] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [viewTransaction, setViewTransaction] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [statusFilter, setStatusFilter] = useState('all');
    const [completeTarget, setCompleteTarget] = useState(null);
    const [cancelTarget, setCancelTarget] = useState(null);

    const statusParam = statusFilter === 'all' ? null : statusFilter;
    const { query, updateMutation, insertMutation, updateStatusMutation } = useTransactions(
        selectedMonth, selectedYear, statusParam
    );
    const transactions = query.data?.data || [];

    const filteredTransactions = transactions.filter(transaction =>
        transaction.transaction_items.some(item =>
            (item.product_name || "").toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const formatDateTime = (datetime) => {
        if (!datetime) return "N/A";
        const date = new Date(datetime);
        return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const handleAddTransaction = (newTransaction) => insertMutation.mutate(newTransaction);
    const handleEditTransaction = (updatedTransaction) => updateMutation.mutate(updatedTransaction);
    const openEditPopup = (transaction) => { setSelectedTransaction(transaction); setshoweditsales(true); };

    const handleConfirmComplete = () => {
        if (!completeTarget) return;
        updateStatusMutation.mutate({ transaction_id: completeTarget.transaction_id || completeTarget.id, status: 'completed' });
        setCompleteTarget(null);
    };

    const handleConfirmCancel = () => {
        if (!cancelTarget) return;
        updateStatusMutation.mutate({ transaction_id: cancelTarget.transaction_id || cancelTarget.id, status: 'cancelled' });
        setCancelTarget(null);
    };

    const isLoading = query.isLoading;
    const isError = query.isError;

    if (isLoading) return <div className={styles.loading}>Loading transactions...</div>;
    if (isError) return <div className={styles.error}>Failed to load transactions. Please try again.</div>;

    const monthNames = Array.from({ length: 12 }, (_, i) =>
        new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2026, i))
    );
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: (currentYear + 5) - 2020 + 1 }, (_, i) => 2020 + i).reverse();

    const statusFilterConfig = [
        { value: 'all', label: '📋 All Statuses' },
        { value: 'pending', label: '🕐 Pending' },
        { value: 'completed', label: '✅ Completed' },
        { value: 'cancelled', label: '✕ Cancelled' },
    ];

    return (
        <div className={styles.page}>
            <Navbar />
            <div className={styles.main}>

                {/* ── Header bar ── */}
                <div className={styles.topBar}>
                    <input
                        type="search"
                        placeholder="🔍  Search by product..."
                        className={styles.search1}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <h1 className={styles.pageTitle}>Sales Transactions</h1>

                {/* ── Status pill tabs ── */}
                <div className={styles.statusTabs}>
                    {statusFilterConfig.map(({ value, label }) => (
                        <button
                            key={value}
                            className={`${styles.statusTab} ${statusFilter === value ? styles[`statusTabActive_${value}`] : ''}`}
                            onClick={() => setStatusFilter(value)}
                        >
                            {label}
                            {statusFilter === value && <span className={styles.statusTabIndicator} />}
                        </button>
                    ))}
                </div>

                {/* ── Actions row ── */}
                <div className={styles.actions}>
                    <button className={styles.add} onClick={() => setshowaddsales(true)}>
                        + New Transaction
                    </button>
                    <div className={styles.filters}>
                        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className={styles.yearDropdown}>
                            {years.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                        <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className={styles.monthDropdown}>
                            {monthNames.map((name, index) => <option key={index} value={index + 1}>{name}</option>)}
                        </select>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className={styles.tableHeader}>
                    <div className={styles.headerCell}>Products</div>
                    <div className={styles.headerCell}>Date &amp; Time</div>
                    <div className={styles.headerCell}>Payment</div>
                    <div className={styles.headerCell}>Revenue</div>
                    <div className={styles.headerCell}>Status</div>
                    <div className={styles.headerCell}>Actions</div>
                </div>
                <hr className={styles.line2} />

                <div className={styles.tableBody}>
                    {filteredTransactions.length === 0 ? (
                        <div className={styles.noData}>
                            <div className={styles.noDataIcon}>
                                {statusFilter === 'pending' && <MdPendingActions size={48} />}
                                {statusFilter === 'completed' && <HiOutlineCheckCircle size={48} />}
                                {statusFilter === 'cancelled' && <HiOutlineXCircle size={48} />}
                                {statusFilter === 'all' && <FiEye size={48} />}
                            </div>
                            <p className={styles.noDataTitle}>
                                {statusFilter === 'all' ? 'No transactions found' : `No ${statusFilter} transactions`}
                            </p>
                            <p className={styles.noDataSub}>
                                {statusFilter === 'all' ? 'Try a different month or year.' : `There are no ${statusFilter} transactions for this period.`}
                            </p>
                        </div>
                    ) : (
                        filteredTransactions.map((transaction) => {
                            const productNames = transaction.transaction_items?.map(item => item.product_name || item.product_id) || [];
                            const visibleProducts = productNames.slice(0, MAX_VISIBLE_PRODUCTS);
                            const hiddenCount = productNames.length - MAX_VISIBLE_PRODUCTS;
                            const txnStatus = transaction.status || 'completed';
                            const isCancelled = txnStatus === 'cancelled';
                            const isPending = txnStatus === 'pending';

                            return (
                                <div key={transaction.transaction_id || transaction.id} className={`${styles.tableRow} ${isCancelled ? styles.tableRowCancelled : ''}`}>
                                    <div className={styles.cell}>
                                        <span>{visibleProducts.join(', ')}</span>
                                        {hiddenCount > 0 && <span className={styles.moreProducts}> +{hiddenCount} more</span>}
                                    </div>
                                    <div className={styles.cell}>
                                        {formatDateTime(transaction.created_at || transaction.datetime)}
                                    </div>
                                    <div className={styles.cell}>
                                        <span className={styles.methodBadge}>{transaction.payment_type}</span>
                                        {transaction.payment_type === "GCash" && transaction.payment_refstr && (
                                            <div className={styles.transactionIdText}>ID: {transaction.payment_refstr}</div>
                                        )}
                                    </div>
                                    <div className={`${styles.cell} ${styles.revenueValue} ${isCancelled ? styles.revenueStrike : ''}`}>
                                        {formatToPesos(transaction.transaction_items.reduce((t, item) => t + item.product_unit_price * item.quantity_bought, 0))}
                                    </div>
                                    <div className={styles.cell}>
                                        <StatusBadge status={txnStatus} />
                                    </div>
                                    <div className={styles.cell}>
                                        <div className={styles.actionButtons}>
                                            {/* View button — always shown */}
                                            <button className={styles.viewButton} onClick={() => setViewTransaction(transaction)} title="View details">
                                                <FiEye size={15} />
                                            </button>

                                            {/* Pending actions */}
                                            {isPending && (
                                                <>
                                                    <button className={styles.completeButton} onClick={() => setCompleteTarget(transaction)} title="Mark as Completed">
                                                        <FiCheck size={14} /> Complete
                                                    </button>
                                                    <button className={styles.cancelButton} onClick={() => setCancelTarget(transaction)} title="Cancel Order">
                                                        <FiX size={14} />
                                                    </button>
                                                </>
                                            )}

                                            {/* Completed: Edit */}
                                            {!isPending && !isCancelled && (
                                                <button className={styles.editButton} onClick={() => openEditPopup(transaction)} title="Edit transaction">
                                                    <FiEdit2 size={13} /> Edit
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Modals */}
            {showaddsales && <AddSales onClose={() => setshowaddsales(false)} onAdd={handleAddTransaction} />}
            {showeditsales && selectedTransaction && (
                <EditSales
                    onClose={() => { setshoweditsales(false); setSelectedTransaction(null); }}
                    transaction={selectedTransaction}
                    onSave={handleEditTransaction}
                />
            )}
            {viewTransaction && (
                <TransactionDetailModal
                    transaction={viewTransaction}
                    onClose={() => setViewTransaction(null)}
                    formatDateTime={formatDateTime}
                    formatToPesos={formatToPesos}
                    onMarkComplete={(txn) => setCompleteTarget(txn)}
                    onCancelOrder={(txn) => setCancelTarget(txn)}
                />
            )}

            {completeTarget && (
                <ConfirmModal
                    type="complete"
                    title="Mark as Completed?"
                    message="This will finalize the transaction and include it in sales reports and revenue analytics."
                    note="This action cannot be undone in the current version."
                    confirmLabel="✅ Mark as Completed"
                    onConfirm={handleConfirmComplete}
                    onClose={() => setCompleteTarget(null)}
                />
            )}
            {cancelTarget && (
                <ConfirmModal
                    type="cancel"
                    title="Cancel this Transaction?"
                    message="The reserved inventory will be restored and this transaction will be marked as cancelled."
                    note="This cannot be undone. The record will remain visible for audit purposes."
                    confirmLabel="Cancel Order"
                    onConfirm={handleConfirmCancel}
                    onClose={() => setCancelTarget(null)}
                />
            )}
        </div>
    );
}

export default Sales;
