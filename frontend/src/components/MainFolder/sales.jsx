import styles from "./sales.module.css";
import {Navbar} from "../MainFolder/Navbar";
import AddSales from "./addsales";
import EditSales from "./editsales";
import { useState } from "react";

function Sales() {
    const [showaddsales, setshowaddsales] = useState(false);
    const [showeditsales, setshoweditsales] = useState(false);
   
     return (
        <div>
            <Navbar/>
            <input type="search" placeholder="Search..." className={styles.search1}/>
            <button className={styles.add} onClick={()=> setshowaddsales(true)}>ADD</button>
            <button className={styles.edit} onClick={() => setshoweditsales(true)}>EDIT</button>

            <h1 className={styles.soldtransactions}>Sold Transactions</h1>
             
            <div className={styles.container1}>
            <h1 className={styles.products}>Products</h1>
             <h1 className={styles.datentime}>Date & Time</h1>
             <h1 className={styles.method}>Payment Method</h1>
             <h1 className={styles.revenue}>Revenue</h1>
             <h1 className={styles.action}>Action</h1>
             <hr className={styles.line}/>
            </div>
          
           {showaddsales && <AddSales onClose={()=> setshowaddsales(false)} />}
            {showeditsales && <EditSales onClose={() => setshoweditsales(false)} />}
        </div>
          
    )
}
export default Sales;