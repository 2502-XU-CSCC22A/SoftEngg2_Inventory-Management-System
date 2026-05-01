import styles from "./addsales.module.css";

function AddSales({ onClose }) {
    return (
        <div className={styles.addpopsbg}>
            <div className={styles.addpops}>
        <h1 className={styles.producttitle}>ADDING...</h1>
        <h3>PRODUCT:</h3>
        <input type="text" placeholder="Enter Item" className={styles.input} />
        <h3>DATE & TIME</h3>
        <input type="datetime-local" className={styles.input}/>
        <h3>PAYMENT METHOD:</h3>
        <select className={styles.paymentmethod}>
            <option value="">Select Method</option>
            <option value="cash">Cash</option>
             <option value="gcash">Gcash</option>
            <option value="credit">Credit Card</option>
            <option value="debit">Debit Card</option>
            <option value="cheque">Cheque</option>
        </select>
        
        <h3>REVENUE:</h3>
        <input type="number" placeholder="Enter Price" className={styles.input}/>

        <button className={styles.buttonpop}>Add</button>
        <button onClick={onClose} className={styles.buttonpop}>Cancel</button>
        </div>
        </div>
       
    )
}
export default AddSales;