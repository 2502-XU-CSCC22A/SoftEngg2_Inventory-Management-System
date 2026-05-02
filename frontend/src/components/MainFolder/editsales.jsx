import { useState, useEffect } from "react";
import styles from "./editsales.module.css";
import { useProducts } from "../../hooks/useProducts.js";

function EditSales({ onClose, transaction, onSave }) {
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

    useEffect(() => {
        if (transaction) {
            // Extract product_id from transaction_items
            const productId = transaction.transaction_items?.[0]?.product_id || "";
            const quantity = transaction.transaction_items?.[0]?.quantity_bought || 1;
            
            setFormData({
                product_id: productId,
                quantity_bought: quantity,
                payment_type: transaction.payment_type || "",
                payment_refstr: transaction.payment_refstr || ""
            });
        }
    }, [transaction]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSave = async () => {
        if (!formData.product_id || !formData.payment_type || !formData.quantity_bought) {
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
                payment_type: formData.payment_type,
                payment_refstr: formData.payment_refstr || null,
                transaction_items: [{
                    product_id: parseInt(formData.product_id),
                    quantity_bought: parseInt(formData.quantity_bought)
                }],
                transaction_id: transaction.transaction_id || transaction.id
            };
            
            const success = await onSave(updatedData);
            if (success) {
                alert("Transaction updated successfully!");
                onClose();
            } else {
                setError("Failed to update transaction. Please try again.");
            }
        } catch (err) {
            setError("Failed to update transaction. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.editpopsbg}>
            <div className={styles.editpops}>
                <h1 className={styles.producttitle}>EDIT TRANSACTION</h1>
                <h3 className={styles.message}>Update the transaction details below</h3>
                
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
                    onClick={handleSave}
                    disabled={loading || productsLoading}
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
        </div>
    );
}

export default EditSales;
