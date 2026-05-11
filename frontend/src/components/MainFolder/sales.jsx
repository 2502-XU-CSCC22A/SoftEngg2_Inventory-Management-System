import styles from "./sales.module.css";
import { Navbar } from "../MainFolder/Navbar";
import AddSales from "./addsales";
import EditSales from "./editsales";
import { useState } from "react";
import { useTransactions } from "../../hooks/useTransactions.js";
import { formatToPesos } from "../../utils/utils.js";
import { FiEye } from "react-icons/fi";

const MAX_VISIBLE_PRODUCTS = 2;

function TransactionDetailModal({ transaction, onClose, formatDateTime, formatToPesos }) {
    const totalRevenue = transaction.transaction_items.reduce(
        (total, item) => total + item.product_unit_price * item.quantity_bought,
        0
    );

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Transaction Details</h2>
                    <button className={styles.modalClose} onClick={onClose}>✕</button>
                </div>

                <div className={styles.modalMeta}>
                    <div className={styles.modalMetaRow}>
                        <span className={styles.modalMetaLabel}>Date & Time</span>
                        <span className={styles.modalMetaValue}>
                            {formatDateTime(transaction.created_at || transaction.datetime)}
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
                            <span className={styles.modalProductName}>
                                {item.product_name || item.product_id}
                            </span>
                            <span className={styles.modalProductQty}>{item.quantity_bought}</span>
                            <span className={styles.modalProductPrice}>
                                {formatToPesos(item.product_unit_price)}
                            </span>
                            <span className={styles.modalProductSubtotal}>
                                {formatToPesos(item.product_unit_price * item.quantity_bought)}
                            </span>
                        </div>
                    ))}
                </div>

                <div className={styles.modalFooter}>
                    <span className={styles.modalTotalLabel}>Total Revenue</span>
                    <span className={styles.modalTotalValue}>{formatToPesos(totalRevenue)}</span>
                </div>
            </div>
        </div>
    );
}

function Sales() {
    const [showaddsales, setshowaddsales] = useState(false);
    const [showeditsales, setshoweditsales] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [viewTransaction, setViewTransaction] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    const { query, updateMutation, insertMutation } = useTransactions(selectedMonth, selectedYear);
    const transactions = query.data?.data || [];

    const filteredTransactions = transactions.filter(transaction => {
        return transaction.transaction_items.some(item =>
            (item.product_name || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const formatDateTime = (datetime) => {
        if (!datetime) return "N/A";
        const date = new Date(datetime);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleAddTransaction = async (newTransaction) => {
        insertMutation.mutate(newTransaction);
    };

    const handleEditTransaction = async (updatedTransaction) => {
        updateMutation.mutate(updatedTransaction);
    };

    const openEditPopup = (transaction) => {
        setSelectedTransaction(transaction);
        setshoweditsales(true);
    };

    const isLoading = query.isLoading;
    const isError = query.isError;

    if (isLoading) return <div className={styles.loading}>Loading transactions...</div>;
    if (isError) return <div className={styles.error}>Failed to load transactions. Please try again.</div>;

    const monthNames = Array.from({ length: 12 }, (_, i) =>
        new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2026, i))
    );

    const startYear = 2026;
    const endYear = 2126;
    const futureYears = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

    return (
        <div className={styles.page}>
            <Navbar />
            <div className={styles.main}>
                <input
                    type="search"
                    placeholder="Search..."
                    className={styles.search1}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <h1 className={styles.soldtransactions}>Sold Transactions</h1>

                <div className={styles.actions}>
                    <button className={styles.add} onClick={() => setshowaddsales(true)}>ADD</button>

                    <div className={styles.filters}>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className={styles.yearDropdown}
                        >
                            {futureYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>

                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className={styles.monthDropdown}
                        >
                            {monthNames.map((name, index) => (
                                <option key={index} value={index + 1}>{name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.tableHeader}>
                    <div className={styles.headerCell}>Products</div>
                    <div className={styles.headerCell}>Date & Time</div>
                    <div className={styles.headerCell}>Payment Method</div>
                    <div className={styles.headerCell}>Revenue</div>
                    <div className={styles.headerCell}>Action</div>
                </div>
                <hr className={styles.line2} />

                <div className={styles.tableBody}>
                    {filteredTransactions.length === 0 ? (
                        <div className={styles.noData}>
                            <p>No transactions found</p>
                        </div>
                    ) : (
                        filteredTransactions.map((transaction) => {
                            const productNames = transaction.transaction_items?.map(
                                item => item.product_name || item.product_id
                            ) || [];
                            const visibleProducts = productNames.slice(0, MAX_VISIBLE_PRODUCTS);
                            const hiddenCount = productNames.length - MAX_VISIBLE_PRODUCTS;

                            return (
                                <div key={transaction.transaction_id || transaction.id} className={styles.tableRow}>
                                    <div className={styles.cell}>
                                        <span>{visibleProducts.join(', ')}</span>
                                        {hiddenCount > 0 && (
                                            <span className={styles.moreProducts}>
                                                {' '}...+{hiddenCount} more
                                            </span>
                                        )}
                                    </div>
                                    <div className={styles.cell}>
                                        {formatDateTime(transaction.created_at || transaction.datetime)}
                                    </div>
                                    <div className={styles.cell}>
                                        <span className={styles.methodBadge}>{transaction.payment_type}</span>
                                        {transaction.payment_type === "GCash" && transaction.payment_refstr && (
                                            <div className={styles.transactionIdText}>
                                                ID: {transaction.payment_refstr}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`${styles.cell} ${styles.revenueValue}`}>
                                        {(formatToPesos((transaction.transaction_items.reduce(
                                            (total, item) => total + (item.product_unit_price * item.quantity_bought), 0
                                        ))) || 0).toLocaleString()}
                                    </div>
                                    <div className={styles.cell}>
                                        <div className={styles.actionButtons}>
                                            <button className={styles.viewButton} onClick={() => setViewTransaction(transaction)} title="View details">
                                                <FiEye size={16} />
                                            </button>
                                            <button className={styles.editButton} onClick={() => openEditPopup(transaction)}>
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {showaddsales && (
                <AddSales
                    onClose={() => setshowaddsales(false)}
                    onAdd={handleAddTransaction}
                />
            )}

            {showeditsales && selectedTransaction && (
                <EditSales
                    onClose={() => {
                        setshoweditsales(false);
                        setSelectedTransaction(null);
                    }}
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
                />
            )}
        </div>
    );
}

export default Sales;