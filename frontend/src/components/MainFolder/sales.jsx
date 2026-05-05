import styles from "./sales.module.css";
import { Navbar } from "../MainFolder/Navbar";
import AddSales from "./addsales";
import EditSales from "./editsales";
import { useState } from "react";
import { useTransactions } from "../../hooks/useTransactions.js";
import { formatToPesos } from "../../utils/utils.js";

function Sales() {
    const [showaddsales, setshowaddsales] = useState(false);
    const [showeditsales, setshoweditsales] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    // Use the React Query hook to fetch transactions
    const { query, updateMutation, insertMutation } = useTransactions(selectedMonth, selectedYear);
    
    // Extract transactions array from the response
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

    const isLoading = query.isLoading 
    const isError = query.isError 

    if (isLoading) return <div className={styles.loading}>Loading transactions...</div>;
    if (isError) return <div className={styles.error}>Failed to load transactions. Please try again.</div>;


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
        <div>
            <Navbar/>
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
                    filteredTransactions.map((transaction) => (
                        <div key={transaction.transaction_id || transaction.id} className={styles.tableRow}>
                            <div className={styles.cell}>
                                {transaction.transaction_items?.map(item => item.product_name || item.product_id).join(', ') || transaction.product}
                            </div>
                            <div className={styles.cell}>{formatDateTime(transaction.transaction_timestamp || transaction.datetime)}</div>
                            <div className={styles.cell}>
                                <span className={styles.methodBadge}>{transaction.payment_type}</span>
                                {transaction.payment_type === "GCash" && transaction.payment_refstr && (
                                    <div className={styles.transactionIdText}>
                                        ID: {transaction.payment_refstr}
                                    </div>
                                )}
                            </div>
                            <div className={`${styles.cell} ${styles.revenueValue}`}>
                                {(formatToPesos((transaction.transaction_items.reduce((total, item) => total + (item.product_unit_price * item.quantity_bought), 0))) || 0).toLocaleString()}
                            </div>
                            <div className={styles.cell}>
                                <button
                                    className={styles.editButton}
                                    onClick={() => openEditPopup(transaction)}
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
         
            {showaddsales && <AddSales
                onClose={() => setshowaddsales(false)}
                onAdd={handleAddTransaction}
            />}
           
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
        </div>  
    );
}

export default Sales;
