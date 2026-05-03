import styles from "./addsales.module.css";
import { useState } from "react";
import { useProducts } from "../../hooks/useProducts.js";
import { formatToPesos } from "../../utils/utils.js"

function AddSales({ onClose, onAdd }) {
    const [formData, setFormData] = useState({
        payment_type: "",
        payment_refstr: "",
        transaction_items: [],
    });

    const [transactionItem, setTransactionItem] = useState({
        product_id: 1,
        quantity_bought: 1,
    })

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Fetch products for the dropdown
    const { query } = useProducts();
    const products = query.data?.data || [];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleChangeItem = (e) => {
        const { name, value } = e.target;
        setTransactionItem(prev => ({ ...prev, [name]: value }));
    }

    const handleAddItem = () => {
        // EXPECTED PAYLOAD: { product_id: 1, quantity_bought: 2 };
        console.log(transactionItem.product_id, typeof transactionItem.product_id);
        if(formData.transaction_items.some(item => item.product_id === transactionItem.product_id)) {
            alert("This product has already been added. Please edit the quantity from the added products section.");
            return;
        }

        if(!transactionItem.product_id || !transactionItem.quantity_bought) {
            alert("Please select a product and enter a valid quantity before adding.");
            return;
        }

        if(transactionItem.quantity_bought <= 0) {
            alert("Quantity must be at least 1.");
            return;
        }

        const product = products.find(p => p.product_id === parseInt(transactionItem.product_id));

        if(product && transactionItem.quantity_bought > product.product_quantity) {
            alert(`Only ${product.product_quantity} units of ${product.product_name} are available in stock.`);
            return;
        }

        setFormData(prev => ({ ...prev, transaction_items: [...prev.transaction_items, { ...transactionItem }] }));
        setTransactionItem({ product_id: "", quantity_bought: "" });
        setError("");
    }

    const handleRemoveItem = (itemId) => {
        setFormData(prev => ({ 
            ...prev, 
            transaction_items: prev.transaction_items.filter(item => item.product_id !== itemId) 
        }));
    }

    const handleSubmit = async () => {
        // Validation
        if (!formData.payment_type) {
            setError("Please fill in all required fields.");
            return;
        }

        if (formData.payment_type === "GCash" && !formData.payment_refstr) {
            setError("Reference string is required for GCash payments.");
            return;
        }

        if(formData.transaction_items.length === 0) {
            setError("Please add at least one product to the transaction.");
            return;
        }

        if(formData.transaction_items.some(item => !item.product_id || !item.quantity_bought)) {
            setError("Please ensure all added products have a valid product and quantity.");
            return;
        }

        if(formData.transaction_items.some(item => item.quantity_bought <= 0)) {
            setError("Quantity must be at least 1 for all products.");
            return;
        }

        setLoading(true);
        try {
            const transactionData = { ...formData };
            await onAdd(transactionData);
            onClose();
        } catch (err) {
            setError("Failed to add transaction. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.addpopsbg}>
            <div className={styles.addpops}>
                <div className={styles.firsthalf}>
                    <h1 className={styles.producttitle}>ADD TRANSACTION</h1>

                    {error && (
                        <div className={styles.errorMessage} style={{ color: "red", textAlign: "center", marginBottom: "10px" }}>
                            {error}
                        </div>
                    )}

                    <h3>PRODUCT:*</h3>
                    <select
                        name="product_id"
                        className={styles.input}
                        value={transactionItem.product_id}
                        onChange={handleChangeItem}
                        disabled={query.isLoading}
                    >
                        <option value="">Select Product</option>
                        {products.map((product) => (
                            <option key={product.product_id || product.id} value={product.product_id || product.id}>
                                {product.product_name} - {formatToPesos(product.product_unit_price || 0).toLocaleString()}
                            </option>
                        ))}
                    </select>
                    <h3>QUANTITY:*</h3>
                    <input
                        type="number"
                        name="quantity_bought"
                        placeholder="Enter Quantity"
                        className={styles.input}
                        value={transactionItem.quantity_bought}
                        onChange={handleChangeItem}
                        min="1"
                    />
                    <button className={styles.buttonpop} onClick={handleAddItem}>Add product</button>
                    <h3>PAYMENT METHOD:*</h3>
                    <select
                        name="payment_type"
                        className={styles.paymentmethod}
                        value={formData.payment_type}
                        onChange={handleChange}
                    >
                        <option value="">Select Method</option>
                        <option value="Cash">Cash</option>
                        <option value="GCash">GCash</option>
                    </select>

                    {formData.payment_type === "GCash" && (
                        <>
                            <h3>REFERENCE STRING:*</h3>
                            <input
                                type="text"
                                name="payment_refstr"
                                placeholder="Enter GCash Reference Number"
                                className={styles.input}
                                value={formData.payment_refstr}
                                onChange={handleChange}
                            />
                        </>
                    )}

                    <button
                        className={styles.buttonpop}
                        onClick={handleSubmit}
                        disabled={loading || query.isLoading}
                    >
                        {loading ? "Adding..." : "Add Transaction"}
                    </button>
                    <button
                        onClick={onClose}
                        className={styles.buttonpop}
                    >
                        Cancel
                    </button>
                </div>
                <div className={styles.secondhalf}>
                    <h1 className={styles.producttitle}>ADDED PRODUCTS</h1>
                    <div className={styles.summary}>
                        { formData.transaction_items.map(item => {
                            const product = products.find(p => p.product_id === parseInt(item.product_id));
                            return (
                                <div key={item.product_id} className={styles.summaryItem}>
                                    <span>{product ? product.product_name : "Unknown Product"}</span>
                                    <span>Qty: {item.quantity_bought}</span>
                                    <button onClick={() => handleRemoveItem(item.product_id)} className={styles.removeButton}>Remove</button>
                                </div>
                            )
                        })}
                    </div>
                    <div className={styles.totalAmount}>
                        Total: {formatToPesos(formData.transaction_items.reduce((total, item) => {
                            const product = products.find(p => p.product_id === parseInt(item.product_id));
                            const price = product ? product.product_unit_price : 0;
                            return total + (price * item.quantity_bought);
                        }, 0))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AddSales;
