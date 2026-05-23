import styles from "./addproduct.module.css";
import { formatToCents, validatePriceInput } from "../../utils/utils";
import { useState } from "react";

function AddProduct({ onClose, onAdd, productsList }) {
    const [productName, setProductName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [productImage, setProductImage] = useState("");
    const [price, setPrice] = useState("");

    const handleChangeImage = (e) => {
        const file = e.target.files[0];

        if (!file) {
            alert("Please upload an image file.");
            return;
        }

        const objectUrl = URL.createObjectURL(file);

        const img = new Image();

        img.onload = () => {
            const width = img.width;
            const height = img.height;

            if (width < 300 || height < 300) {
                alert(`Image too small! Please upload an image at least 300x300. Yours is ${width}x${height}.`);
                e.target.value = "";
                setProductImage(null);
                URL.revokeObjectURL(objectUrl); 
                return;
            }

            // Example B: Reject extreme panoramas (e.g., width is more than 2x the height)
            if (width / height > 2 || height / width > 2) {
                alert("Image is too stretched! Please pick a more proportional photo.");
                e.target.value = "";
                setProductImage(null);
                URL.revokeObjectURL(objectUrl);
                return;
            }

            setProductImage(file);

            URL.revokeObjectURL(objectUrl);
        };

        img.src = objectUrl;
    };

    const handleAdd = () => {
        if (validatePriceInput(String(price)) === false) {
            alert("Invalid price format. Please enter a valid number with either zero or two decimal places.");
            return;
        }

        if (productName.length === 0) {
            alert("Product name cannot be empty.");
            return;
        }

        if (productsList.some(p => p.product_name === productName)) {
            alert(`Product ${productName} already exists in the database.`);
            return;
        }

        if (price <= 0) {
            alert("Invalid price entered. Value should be bigger than zero.");
            return;
        }

        if (quantity < 0) {
            alert("Invalid quantity entered. Value should be zero or bigger.");
            return;
        }

        if (Number.isInteger(Number(quantity)) === false) {
            alert("Invalid quantity entered. Please enter a whole number.");
            return;
        }

        const finalName = productName ? productName : null;
        const finalQuantity = quantity ? Number(quantity) : null;
        const finalPrice = price ? formatToCents(price) : null;

        const formData = new FormData();
        formData.append('product_name', finalName);
        formData.append('product_quantity', finalQuantity);
        formData.append('product_unit_price', finalPrice);

        if (productImage === "") {
            formData.append("use_default_image", "true");
        } else {
            formData.append("use_default_image", "false");
            formData.append('image', productImage);
        }

        onAdd(formData);
    }

    return (
        <div className={styles.addpopsbg}>
            <div className={styles.addpops}>
                <h1 className={styles.producttitle}>ADDING...</h1>
                <h3>PRODUCT:</h3>
                <input type="file" accept="image/*" onChange={handleChangeImage}/>
                <input type="text" placeholder="Enter Item" className={styles.input} value={productName} onChange={(e) => setProductName(e.target.value)}/>
                <h3>QUANTITY</h3>
                <input type="number" placeholder="Enter Quantity" className={styles.input} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                <h3>PRICE</h3>
                <input type="number" placeholder="Enter Price" 
                className={styles.input} value={price} onChange={(e) => setPrice(e.target.value)} 
                placeholder="Whole numbers and 2 decimal places only"/>
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