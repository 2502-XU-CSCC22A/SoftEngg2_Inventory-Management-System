import styles from "./addsales.module.css";
import { useState } from "react";
import { useProducts } from "../../hooks/useProducts.js";

function AddSales({ onClose, onAdd }) {
    const [formData, setFormData] = useState({
        product_id: "",
        quantity_bought: 1,
        payment_type: "",
        payment_refstr: ""
    });
    const [cartItems, setCartItems] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    const { query: productsQuery } = useProducts();
    const products = productsQuery.data || [];
    const productsLoading = productsQuery.isLoading;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError("");
    };

    const addToCart = () => {
        if (!formData.product_id) {
            setError("Please select a product.");
            return;
        }
        if (!formData.quantity_bought || formData.quantity_bought <= 0) {
            setError("Quantity must be greater than 0.");
            return;
        }

        const selectedProduct = products.find(p => 
            Number(p.product_id || p.id) === Number(formData.product_id)
        );

        if (!selectedProduct) {
            setError("Product not found.");
            return;
        }

        if (cartItems.some(item => item.product_id === selectedProduct.product_id)) {
            setError("Product already added.");
            return;
        }

        if (selectedProduct.product_quantity < formData.quantity_bought) {
            setError(`Only ${selectedProduct.product_quantity} left in stock.`);
            return;
        }

        const newItem = {
            product_id: Number(selectedProduct.product_id),
            product_name: selectedProduct.product_name,
            quantity_bought: Number(formData.quantity_bought),
            unit_price: Number(selectedProduct.product_unit_price),
            total: Number(formData.quantity_bought) * Number(selectedProduct.product_unit_price)
        };

        setCartItems([...cartItems, newItem]);
        setFormData(prev => ({ ...prev, product_id: "", quantity_bought: 1 }));
        setError("");
    };

    const removeFromCart = (productId) => {
        setCartItems(cartItems.filter(item => item.product_id !== productId));
    };

    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => sum + item.total, 0);
    };

    const handleSubmit = async () => {
        if (cartItems.length === 0) {
            setError("Please add at least one product.");
            return;
        }
        if (!formData.payment_type) {
            setError("Please select a payment method.");
            return;
        }
        if (formData.payment_type === "GCash" && !formData.payment_refstr) {
            setError("Reference is required for GCash payments.");
            return;
        }

        setLoading(true);
        try {
            const transactionData = {
                payment_type: formData.payment_type,
                payment_refstr: formData.payment_type === "Cash" ? "" : (formData.payment_refstr || ""),
                created_by: 1,
                transaction_items: cartItems.map(item => ({
                    product_id: Number(item.product_id),
                    quantity_bought: Number(item.quantity_bought)
                }))
            };
            
            console.log('Submitting transaction:', JSON.stringify(transactionData, null, 2));
            
            const success = await onAdd(transactionData);
            if (success) {
                alert(`Transaction added Successfully!`);
                onClose();
            } else {
                setError("Failed to add transaction. Please Try again!");
            }
        } catch (err) {
            console.error("Error in handleSubmit:", err);
            if (err.response?.data?.errors) {
                const errorMsg = err.response.data.errors.map(e => `${e.field}: ${e.message}`).join(', ');
                setError(errorMsg);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Failed to add transaction.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.addpopsbg}>
            <div className={styles.addpops}>
                <div className={styles.header}>
                    <h1 className={styles.producttitle}>TRANSACTION</h1>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>
               
                {error && <div className={styles.errorMessage}>{error}</div>}
                {productsLoading && <div className={styles.loading}>Loading products...</div>}
                
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>ADD PRODUCTS</h3>
                    <div className={styles.formRow}>
                        <div className={styles.formField}>
                            <label>PRODUCT:</label>
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
                                        (Stock: {product.product_quantity})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className={styles.formField}>
                            <label>QUANTITY:</label>
                            <input
                                type="number"
                                name="quantity_bought"
                                placeholder="1"
                                className={styles.input}
                                value={formData.quantity_bought}
                                onChange={handleChange}
                                min="1"
                            />
                        </div>
                        
                        <div className={styles.formField}>
                            <label>&nbsp;</label>
                            <button className={styles.addToCartBtn} onClick={addToCart}>
                                ADD TO CART
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>ADDED PRODUCTS</h3>
                    {cartItems.length === 0 ? (
                        <div className={styles.emptyCart}>No products added yet</div>
                    ) : (
                        <>
                            <div className={styles.cartList}>
                                {cartItems.map((item) => (
                                    <div key={item.product_id} className={styles.cartItem}>
                                        <div className={styles.itemInfo}>
                                            <div className={styles.itemName}>{item.product_name}</div>
                                            <div className={styles.itemDetails}>
                                                {item.quantity_bought} x ₱{item.unit_price.toLocaleString()} = 
                                                ₱{item.total.toLocaleString()}
                                            </div>
                                        </div>
                                        <button className={styles.deleteBtn} onClick={() => removeFromCart(item.product_id)}>
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.cartTotal}>
                                <span>Total:</span>
                                <span className={styles.totalAmount}>₱{calculateTotal().toLocaleString()}</span>
                            </div>
                        </>
                    )}
                </div>
                
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>PAYMENT DETAILS</h3>
                    <div className={styles.formGroup}>
                        <label>PAYMENT METHOD:</label>
                        <select
                            name="payment_type"
                            className={styles.input}
                            value={formData.payment_type}
                            onChange={handleChange}
                        >
                            <option value="">Select Method</option>
                            <option value="Cash">Cash</option>
                            <option value="GCash">GCash</option>
                        </select>
                    </div>
                    
                    {formData.payment_type === "GCash" && (
                        <div className={styles.formGroup}>
                            <label>REFERENCE:</label>
                            <input
                                type="text"
                                name="payment_refstr"
                                placeholder="Enter GCash Reference Number"
                                className={styles.input}
                                value={formData.payment_refstr}
                                onChange={handleChange}
                            />
                        </div>
                    )}
                </div>
                
                <div className={styles.buttonGroup}>
                    <button className={`${styles.buttonpop} ${styles.submitBtn}`} onClick={handleSubmit} disabled={loading}>
                        {loading ? "PROCESSING..." : "COMPLETE TRANSACTION"}
                    </button>
                    <button onClick={onClose} className={`${styles.buttonpop} ${styles.cancelBtn}`}>
                        CANCEL
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddSales;
