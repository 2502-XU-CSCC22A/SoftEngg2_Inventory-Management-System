import styles from './Navbar.module.css';
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpg";
import api from "../../api/api.js";

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
    
    const usermanagementlocation = async () => {
        try {
        const response = await api.get("auth/me");
        const user = response.data.user;

    if (user.is_admin){
        navigate("/usermanagement");
    }
    else{
        alert("You do not have permission to access the User Management page.");
    }
  } catch {
    alert("Failed to verify user permissions. Please try again.");
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
      <button onClick = {usermanagementlocation} className={styles.user}>Usermanagement</button>
       <button onClick ={handleLogout} className={styles.logoutbutton}>Logout</button>
      </div>
      <hr />
      
    </nav>
  );
};
export default Navbar;
