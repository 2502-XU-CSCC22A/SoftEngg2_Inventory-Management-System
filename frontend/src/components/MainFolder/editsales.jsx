import {useState} from "react";
import styles from "./editsales.module.css";
function EditSales({ onClose }) {
  const [paymentMethod, setPaymentMethod] = useState("");
  return (
   <div className={styles.editpopsbg}>
            <div className={styles.editpops}>
        <h1 className={styles.producttitle}>EDITING...</h1>
        <h3 className={styles.message}>Leave blank if no changes are needed</h3>
        <h3>PRODUCT:</h3>
        <input type="text" placeholder="Enter Item" className={styles.input} />
        <h3>DATE & TIME</h3>
        <input type="datetime-local" className={styles.input}/>
        <h3>PAYMENT METHOD:</h3>
        <select className={styles.paymentmethod} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="">Select Method</option>
            <option value="cash">Cash</option>
             <option value="gcash">Gcash</option>
            <option value="bank">Bank Transfer</option>
            <option value="cheque">Cheque</option>
           
        </select>
        {paymentMethod === "gcash" &&(
          <>
          <h3> Reference Number:</h3>
          <input type="text" placeholder="Enter Reference Number" className={styles.input} />
          </>
          )}
        <h3>REVENUE:</h3>
        <input type="number" placeholder="Enter Price" className={styles.input}/>

        <button className={styles.buttonpop}>Edit</button>
        <button onClick={onClose} className={styles.buttonpop}>Cancel</button>
        </div>
        </div>
  )
}
export default EditSales;