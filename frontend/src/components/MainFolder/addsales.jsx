import styles from "./addsales.module.css";
import { useState, useEffect } from "react";
import { useProducts } from "../../hooks/useProducts.js";

function AddSales({ onClose, onAdd }) {
    const [formData, setFormData] = useState({
        product_id: "",
        quantity_bought: 1,
        payment_type: "",
        payment_refstr: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Fetch products for the dropdown
    const { data: productsData, isLoading: productsLoading } = useProducts();
    const products = productsData?.data || productsData || [];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.product_id || !formData.payment_type || !formData.quantity_bought) {
            setError("Please fill in all required fields.");
            return;
        }

        if (formData.quantity_bought <= 0) {
            setError("Quantity must be greater than 0.");
            return;
        }

        if (formData.payment_type === "GCash" && !formData.payment_refstr) {
            setError("Reference string is required for GCash payments.");
            return;
        }

        setLoading(true);
        try {
            const transactionData = {
                payment_type: formData.payment_type,
                payment_refstr: formData.payment_refstr || null,
                transaction_items: [{
                    product_id: parseInt(formData.product_id),
                    quantity_bought: parseInt(formData.quantity_bought)
                }]
            };
            
            const success = await onAdd(transactionData);
            if (success) {
                alert("Transaction added successfully!");
                onClose();
            } else {
                setError("Failed to add transaction. Please try again.");
            }
        } catch (err) {
            setError("Failed to add transaction. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.addpopsbg}>
            <div className={styles.addpops}>
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
                    value={formData.product_id}
                    onChange={handleChange}
                    disabled={productsLoading}
                >
                    <option value="">Select Product</option>
                    {products.map((product) => (
                        <option key={product.product_id || product.id} value={product.product_id || product.id}>
                            {product.product_name} - ₱{(product.product_unit_price || 0).toLocaleString()}
                        </option>
                    ))}
                </select>
               
                <h3>QUANTITY:*</h3>
                <input
                    type="number"
                    name="quantity_bought"
                    placeholder="Enter Quantity"
                    className={styles.input}
                    value={formData.quantity_bought}
                    onChange={handleChange}
                    min="1"
                />
               
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
                    disabled={loading || productsLoading}
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
        </div>
    );
}

export default AddSales;
