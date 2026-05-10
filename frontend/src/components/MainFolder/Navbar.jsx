import styles from './Navbar.module.css';
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpg";

export const Navbar = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/auth/logout", {
        method: "DELETE",
        credentials: "include"
      });

      navigate("/login"); 
    } catch (err) {
      console.log("Logout failed", err);
      navigate("/login"); 
    }
  };

  return (
    <nav>
      <div className={styles.header}>
        <img src={logo} alt="53 One Tech" className={styles.logo} />
        <div className={styles.nav}>
      <button onClick={() => navigate("/topproduct")}>Top Product</button>
      <button onClick ={()=> navigate("/sales")}>Sales</button>
      <button onClick ={()=> navigate("/Available")}>Inventory</button> 
      <button onClick ={()=> navigate("/ActivLog")}>Activity Log</button>
      <button onClick ={()=> navigate("/Monthlyreport")}>Overall reports</button>
      </div>
       <button onClick ={handleLogout} className={styles.logoutbutton}>Logout</button>
      </div>
      <hr />
      
    </nav>
  );
};
export default Navbar;
