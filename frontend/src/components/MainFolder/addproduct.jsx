import styles from "./addproduct.module.css";
import { formatToCents, validatePriceInput } from "../../utils/utils";
import { useState } from "react";

function AddProduct({ onClose, onAdd }) {
    const [productName, setProductName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [price, setPrice] = useState("");


    const handleAdd = () => {
        if (validatePriceInput(String(price)) === false) {
            alert("Invalid price format. Please enter a valid number with up to two decimal places.");
            return;
        }

        const finalName = productName ? productName : null;
        const finalQuantity = quantity ? Number(quantity) : null;
        const finalPrice = price ? formatToCents(price) : null;

        // Call the onAdd function with the new product details
        onAdd({
            product_name: finalName,
            product_quantity: finalQuantity,
            product_unit_price: finalPrice,
            is_still_offered: true, // transfer to backend as this is a non input field
        });
    }

    return (
        <div className={styles.addpopsbg}>
            <div className={styles.addpops}>
                <h1 className={styles.producttitle}>ADDING...</h1>
                <h3>PRODUCT:</h3>
                <input type="text" placeholder="Enter Item" className={styles.input} value={productName} onChange={(e) => setProductName(e.target.value)}/>
                <h3>QUANTITY</h3>
                <input type="number" placeholder="Enter Quantity" className={styles.input} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                <h3>PRICE</h3>
                <input type="number" placeholder="Enter Price" 
                className={styles.input} value={price} onChange={(e) => setPrice(e.target.value)} />
                <button className={styles.buttonpop} onClick={handleAdd}>
                    Add
                </button>
                <button onClick={onClose} className={styles.buttonpop}>
                    Cancel
                </button>
            </div>
        </div>
       
    )
}
export default AddProduct;