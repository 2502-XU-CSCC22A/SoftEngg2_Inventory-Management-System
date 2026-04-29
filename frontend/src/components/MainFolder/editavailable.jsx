import { useState } from "react";
import styles from "./editavailable.module.css";

function EditAvailable({ product, onClose, onSave }) {
  const [quantity, setQuantity] = useState(product?.quantity ?? "");
  const [price, setPrice] = useState(product?.price ? product.price.replace(/[^\d]/g, "") : "");

  const handleSave = () => {
    const updatedQuantity = quantity === "" ? product.product_quantity : Number(quantity);
    const sanitizedPrice = price === "" ? product.product_unit_price : Number(price);

    onSave({
      product_quantity: updatedQuantity,
      product_unit_price: sanitizedPrice,
    });
  };

  return (
    <div className={styles.editpopsbg}>
      <div className={styles.editpops}>
        <h1 className={styles.producttitle}>EDITING...</h1>
        <h3 className={styles.message}>Leave blank if no changes are needed</h3>
        <h3>PRODUCT:</h3>
        <input type="text" value={product.name} className={styles.input} disabled />
        <h3>QUANTITY</h3>
        <input type="number" placeholder="Enter Quantity" className={styles.input} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <h3>PRICE</h3>
        <input type="number" placeholder="Enter Price" className={styles.input} value={price} onChange={(e) => setPrice(e.target.value)}/>

        <button className={styles.buttonpop} onClick={handleSave}>Save</button>
        <button onClick={onClose} className={styles.buttonpop}>Cancel</button>
      </div>
    </div>
  );
}

export default EditAvailable;