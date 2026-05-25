import styles from "./topproduct.module.css";
import { Navbar } from "../MainFolder/Navbar";
import { useMemo } from "react";
import { useTransactions } from "../../hooks/useTransactions.js";
import { formatToPesos } from "../../utils/utils.js";

function TopProduct() {
    // Use both hooks
    const { query: transactionsQuery } = useTransactions();
    
    // Extract loading/error states
    const transactionsLoading = transactionsQuery.isLoading;
    const transactionsError = transactionsQuery.isError;

    // Create a map of product_id to product details
    const { topProducts } = useMemo(() => {
        const rawData = transactionsQuery.data ?? [];
        // Only count completed transactions in top-products ranking
        const transactions = Array.isArray(rawData)
            ? rawData.filter(txn => txn.status === 'completed')
            : [];
        
        const productSales = {};
        
        transactions.forEach(transaction => {
            if (transaction.transaction_items && Array.isArray(transaction.transaction_items)) {
                transaction.transaction_items.forEach(item => {
                    const productId = item.product_id;
                    const productName = item.product_name || 'Product ID: ${productId}';
                    const unitPrice = item.product_unit_price || 0;
                    const quantity = item.quantity_bought;
                    
                    if (productSales[productName]) {
                        productSales[productName].quantity += quantity;
                        productSales[productName].revenue += (quantity * unitPrice);
                    } else {
                        productSales[productName] = {
                            name: productName,
                            quantity: quantity,
                            revenue: quantity * unitPrice,
                            productId: productId
                        };
                    }
                });
            }
        });
        
        // Convert to array and sort by quantity sold
        const sortedProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
        
        return { topProducts: sortedProducts };
    }, [transactionsQuery.data]);

    if (transactionsLoading) return <div className={styles.loading}>Loading top products...</div>;
    if (transactionsError) return <div className={styles.error}>Failed to load data. Please try again.</div>;

    return (
        <div className={styles.page}>
            <Navbar/>
            <div className={styles.main}>
                <h1 className={styles.topproduct}>Top 5 Best Selling Products</h1>
                <div className={styles.container}>
                    <div className={styles.listHeader}>
                        <span>#</span>
                        <span>Product Name</span>
                        <span>Quantity</span>
                        <span>Revenue</span>
                    </div>
                    <hr />
                    <div className={styles.productList}>
                        {topProducts.map((product, index) => (
                            <div key={product.productId || index} className={styles.productItem}>
                                <span className={styles.rank}>{index + 1}</span>
                                <span className={styles.productName}>{product.name}</span>
                                <span className={styles.productQuantity}>{product.quantity} units</span>
                                <span className={styles.productRevenue}>{formatToPesos(product.revenue)}</span>
                            </div>
                        ))}
                        {topProducts.length === 0 && (
                            <div className={styles.noData}>
                                <p>No sales data available yet.</p>
                                <p className={styles.notavail}>Add transactions in Sales page to see top products.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>  
    );
}

export default TopProduct;
