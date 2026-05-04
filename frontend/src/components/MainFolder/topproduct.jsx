import styles from "./topproduct.module.css";
import { Navbar } from "../MainFolder/Navbar";
import { useMemo } from "react";
import { useTransactions } from "../../hooks/useTransactions.js";
import { useProducts } from "../../hooks/useProducts.js";
import { formatToPesos } from "../../utils/utils.js";

function TopProduct() {
    // Use both hooks
    const { query: transactionsQuery } = useTransactions();
    const { query: productsQuery } = useProducts();
    
    // Extract loading/error states
    const transactionsLoading = transactionsQuery.isLoading;
    const transactionsError = transactionsQuery.isError;
    const productsLoading = productsQuery.isLoading;
    const productsError = productsQuery.isError;

    // Create a map of product_id to product details
    const { topProducts } = useMemo(() => {
        const transactions = transactionsQuery.data || [];
        
        const productSales = {};
        
        transactions.forEach(transaction => {
            if (transaction.transaction_items && Array.isArray(transaction.transaction_items)) {
                transaction.transaction_items.forEach(item => {
                    const productId = item.product_id;
                    const productName = item.product_name || 'Product ID: ${productId}';
                    const unitPrice = item.product_unit_price || 0;
                    
                    if (productSales[productName]) {
                        productSales[productName].quantity += item.quantity_bought;
                        productSales[productName].revenue += (item.quantity_bought * unitPrice);
                    } else {
                        productSales[productName] = {
                            name: productName,
                            quantity: item.quantity_bought,
                            revenue: item.quantity_bought * unitPrice,
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

    if (transactionsLoading || productsLoading) return <div className={styles.loading}>Loading top products...</div>;
    if (transactionsError || productsError) return <div className={styles.error}>Failed to load data. Please try again.</div>;

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
                                <p style={{ fontSize: "12px", marginTop: "10px" }}>Add transactions in Sales page to see top products.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>  
    );
}

export default TopProduct;
