import styles from './Navbar.module.css';
import { useNavigate } from "react-router-dom";
export const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav>
      <div className={styles.header}>
        <div className={styles.nav}>
      <button onClick={() => navigate("/topproduct")}>Top Product</button>
      <button onClick ={()=> navigate("/sales")}>Sales</button>
      <button onClick ={()=> navigate("/Available")}>Inventory</button> 
      <button onClick ={()=> navigate("/ActivLog")}>Activity Log</button>
      <button onClick ={()=> navigate("/Monthlyreport")}>Overall reports</button>
      </div>
       <button onClick ={()=> navigate("/login")} className={styles.logoutbutton}>Logout</button>
      </div>
      <hr />
      
    </nav>
  );
};
export default Navbar;