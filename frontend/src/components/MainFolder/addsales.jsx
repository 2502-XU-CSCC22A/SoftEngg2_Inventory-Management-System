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
        product_id: "",
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
        setTransactionItem(prev => ({ ...prev, [name]: value }));
    }

    const handleAddItem = () => {
        // EXPECTED PAYLOAD: { product_id: 1, quantity_bought: 2 };
        if(formData.transaction_items.some(item => item.product_id === transactionItem.product_id)) {
            alert("This product has already been added.");
            return;
        }

        if(!transactionItem.product_id) {
            alert("Please select a product.");
            return;
        }

        setFormData(prev => ({ ...prev, transaction_items: [...prev.transaction_items, { product_id: transactionItem.product_id, quantity_bought: 1 }] }));
        setTransactionItem({ product_id: "" });
        setError("");
    }

    const handleChangeValue = (productId, value, isAbsolute = false) => {
        const item = formData.transaction_items.find(i => i.product_id === productId);
        const product = products.find(p => p.product_id === parseInt(productId));

        let newQty;

        if (isAbsolute) {
            if (value === "") {
                newQty = "";
            } else {
                newQty = parseInt(value);
                if (isNaN(newQty)) newQty = 1;
            }
        } else {
            const currentQty = item.quantity_bought === "" ? 0 : parseInt(item.quantity_bought);
            newQty = currentQty + value;
        }

        if (newQty !== "") {
            if (newQty < 1) newQty = 1; // Prevent 0 or negatives

            if (newQty > product.product_quantity) {
                // Firing this outside of setFormData prevents the Strict Mode double-alert!
                alert(`Stock limit reached. Only ${product.product_quantity} available.`);
                newQty = product.product_quantity; // Cap it at max stock
            }
        }

        setFormData(prev => ({
            ...prev,
            transaction_items: prev.transaction_items.map(item =>
                item.product_id === productId ? { ...item, quantity_bought: newQty } : item
            )
        }));
    }

    const handleOffFocus = (productId) => {
        // input goes to 1 after left empty on off-focus
        setFormData(prev => ({
            ...prev,
            transaction_items: prev.transaction_items.map(item =>
                (item.product_id === productId && item.quantity_bought === "")
                    ? { ...item, quantity_bought: 1 } // Default back to 1 if left empty
                    : item
            )
        }));
    }

    const handleRemoveItem = (itemId) => {
        setFormData(prev => ({ 
            ...prev, 
            transaction_items: prev.transaction_items.filter(item => item.product_id !== itemId) 
        }));
    }

    // Enhancement: accept explicit status for pending/completed creation.
    // Defaults to 'completed' to preserve the existing direct-sale flow.
    const handleSubmit = async (status = 'completed') => {
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
            const transactionData = { ...formData, status };
            await onAdd(transactionData);
            onClose();
        } catch {
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
                    <h3>PRODUCT:</h3>
                    <select
                        name="product_id"
                        className={styles.input}
                        value={transactionItem.product_id}
                        onChange={handleChangeItem}
                        disabled={query.isLoading}
                    >
                        <option value="">Select Product</option>
                        {products.map((product) => (product.product_quantity > 0 &&
                            <option key={product.product_id || product.id} value={product.product_id || product.id}>
                                {product.product_name} - {formatToPesos(product.product_unit_price || 0).toLocaleString()}
                            </option>
                        ))}
                    </select>
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
                    <h3>REFERENCE STRING:</h3>
                    <input
                        type="text"
                        name="payment_refstr"
                        placeholder="Enter GCash Reference Number"
                        className={styles.input}
                        value={formData.payment_refstr}
                        onChange={handleChange}
                        disabled={formData.payment_type !== "GCash"}
                    />
                    {/* Enhancement: two submit buttons — Complete Sale (default) and Save as Pending */}
                    <button
                        className={styles.buttonpop}
                        onClick={() => handleSubmit('completed')}
                        disabled={loading || query.isLoading}
                    >
                        {loading ? "Processing..." : "Complete Sale"}
                    </button>
                    <button
                        className={styles.buttonpop}
                        onClick={() => handleSubmit('pending')}
                        disabled={loading || query.isLoading}
                        style={{ opacity: 0.85 }}
                    >
                        {loading ? "Processing..." : "Save as Pending"}
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
                                    <span className={styles['product-name']}>{product ? product.product_name : "Unknown Product"}</span>

                                    <div className={styles['qty-stepper']}>
                                        <button type="button" className={styles['stepper-down']} onClick={() => handleChangeValue(item.product_id, -1)} onBlur={() => handleOffFocus(item.product_id)}>-</button>
                                        <input type="number" value={item.quantity_bought} onChange={(e) => handleChangeValue(item.product_id, e.target.value, true)}/>
                                        <button type="button" className={styles['stepper-up']} onClick={() => handleChangeValue(item.product_id, 1)} onBlur={() => handleOffFocus(item.product_id)}>+</button>
                                    </div>

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
