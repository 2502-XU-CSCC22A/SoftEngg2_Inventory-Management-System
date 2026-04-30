import styles from "./topproduct.module.css";
import { Navbar } from "../MainFolder/Navbar";
import { useState, useEffect } from "react";
import { useTransactions } from "../../hooks/useTransactions.js";

function TopProduct() {
    const [topProducts, setTopProducts] = useState([]);
    const [bestProduct, setBestProduct] = useState(null);
    
    // Use the React Query hook to fetch transactions
    const { data: transactionsData, isLoading, isError } = useTransactions();
    
    const transactions = transactionsData?.data || transactionsData || [];

    useEffect(() => {
        if (transactions.length > 0) {
            calculateTopProducts();
        }
    }, [transactions]);

    const calculateTopProducts = () => {
        // Calculate total quantity sold per product from transaction_items
        const productSales = {};
        
        transactions.forEach(transaction => {
            if (transaction.transaction_items && Array.isArray(transaction.transaction_items)) {
                transaction.transaction_items.forEach(item => {
                    const productName = item.product_name || `Product ID: ${item.product_id}`;
                    if (productSales[productName]) {
                        productSales[productName].quantity += item.quantity_bought;
                        productSales[productName].revenue += (item.quantity_bought * (item.unit_price || 0));
                    } else {
                        productSales[productName] = {
                            quantity: item.quantity_bought,
                            revenue: item.quantity_bought * (item.unit_price || 0)
                        };
                    }
                });
            }
        });
        
        // Convert to array and sort by quantity sold
        const sortedProducts = Object.entries(productSales)
            .map(([name, data]) => ({
                name,
                quantity: data.quantity,
                revenue: data.revenue
            }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
        
        setTopProducts(sortedProducts);
        
        if (sortedProducts.length > 0) {
            setBestProduct(sortedProducts[0]);
        } else {
            setBestProduct(null);
        }
    };

    if (isLoading) return <div className={styles.loading}>Loading top products...</div>;
    if (isError) return <div className={styles.error}>Failed to load data. Please try again.</div>;

    return (
        <div className={styles.page}>
            <Navbar/>
            <div className={styles.main}>
                <div className={styles.bestsold}>
                    {bestProduct ? (
                        <div className={styles.bestProductContent}>
                            <span className={styles.bestProductName}>{bestProduct.name}</span>
                            <span className={styles.bestProductSold}>Best Sold Product</span>
                        </div>
                    ) : (
                        <span>No sales data available</span>
                    )}
                </div>
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
                            <div key={index} className={styles.productItem}>
                                <span className={styles.rank}>{index + 1}</span>
                                <span className={styles.productName}>{product.name}</span>
                                <span className={styles.productQuantity}>{product.quantity} units</span>
                                <span className={styles.productRevenue}>₱{product.revenue.toLocaleString()}</span>
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
