import { useState } from "react";
import styles from "./editsales.module.css";
import { useProducts } from "../../hooks/useProducts.js";
import { formatToPesos } from "../../utils/utils.js"

function EditSales({ onClose, transaction, onSave }) {
    const [formData, setFormData] = useState({
        payment_type: "",
        payment_refstr: "",
        transaction_items: [...transaction.transaction_items],
    });

    const [transactionItem, setTransactionItem] = useState({
        product_id: "",
        quantity_bought: "",
    })

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Fetch products for the dropdown
    const { query } = useProducts(true);
    const products = query.data?.data || [];

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleChangeItem = (e) => {
        const { name, value } = e.target;
        const correctedVal = value === "" ? "" : Number(value);
        setTransactionItem(prev => ({ ...prev, [name]: correctedVal }));
    }

    const handleAddItem = () => {
        // EXPECTED PAYLOAD: { product_id: 1, quantity_bought: 2 };
        if (formData.transaction_items.some(item => item.product_id === transactionItem.product_id)) {
            alert("This product has already been added.");
            return;
        }

        if (formData.transaction_items.some(item => !Number.isInteger(item.quantity_bought))) {
            alert("Quantity should be an integer.");
            return;
        }

        if (!transactionItem.product_id || !transactionItem.quantity_bought) {
            alert("Please select a product and enter a valid quantity before adding.");
            return;
        }

        if (transactionItem.quantity_bought <= 0) {
            alert("Quantity must be at least 1.");
            return;
        }

        const product = products.find(p => p.product_id === parseInt(transactionItem.product_id));

        if (product && transactionItem.quantity_bought > product.product_quantity) {
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

    const handleSave = async () => {
        if (!formData.payment_type) {
            setError("Please fill in all required fields.");
            return;
        }

        if (formData.payment_type === "GCash" && !formData.payment_refstr) {
            setError("Reference string is required for GCash payments.");
            return;
        }

        setLoading(true);
        try {
            const updatedData = {
                ...formData,
                transaction_id: transaction.transaction_id
            };
            
            await onSave(updatedData);
            onClose();
        } catch (err) {
            setError("Failed to update transaction. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.editpopsbg}>
            <div className={styles.editpops}>
                <div className={styles.firsthalf}>
                    <h1 className={styles.producttitle}>EDIT TRANSACTION</h1>
                    <h3 className={styles.message}>Update the transaction details below</h3>

                    {error && (
                        <div className={styles.errorMessage} style={{ color: "red", textAlign: "center", marginBottom: "10px" }}>
                            {error}
                        </div>
                    )}

                    <h3>PRODUCT:</h3>
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
                    
                    <h3>QUANTITY:</h3>
                    <input
                        type="number"
                        name="quantity_bought"
                        className={styles.input}
                        value={transactionItem.quantity_bought}
                        onChange={handleChangeItem}
                        min="1"
                    />

                    <button className={styles.buttonpop} onClick={handleAddItem}>Add product</button>
                    <h3>PAYMENT METHOD:</h3>
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
                            <h3>REFERENCE STRING:</h3>
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
                        onClick={handleSave}
                        disabled={loading || query.isLoading}
                    >
                        {loading ? "Saving..." : "Save Changes"}
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
                                    <span>
                                        {query.isLoading
                                            ? "Loading product..."
                                            : (product ? product.product_name : "Unknown Product")}
                                    </span>
                                    <span>Qty: {item.quantity_bought}</span>
                                    <button onClick={() => handleRemoveItem(item.product_id)} className={styles.removeButton}>Remove</button>
                                </div>
                            )
                        })}
                    </div>
                    <div className={styles.totalAmount}>
                        Total: {query.isLoading ? "Calculating..." : formatToPesos(formData.transaction_items.reduce((total, item) => {
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

export default EditSales;
