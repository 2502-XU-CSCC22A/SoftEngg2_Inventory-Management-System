import styles from "./topproduct.module.css";
import {Navbar} from "../MainFolder/Navbar";

function TopProduct() {
    return (
        <div className={styles.page}>
            <Navbar/>
            <div className={styles.main}>
            <h1 className={styles.bestsold}>Best Sold Product</h1>
             <h1 className={styles.topproduct}>Best Selling Product</h1>
             <div className={styles.container}>
            <h1 className={styles.type}>Type:</h1>
            <hr />
            </div>
           </div>
        </div>  
    )
}
export default TopProduct; 