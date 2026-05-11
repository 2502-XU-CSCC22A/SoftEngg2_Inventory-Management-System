import styles from "./welcomeadmin.module.css";
import { useNavigate } from "react-router-dom";
function Welcomeadmin() {
    const navigate = useNavigate();
  return (
    <div className={styles.welcomeadminpage}>
      <button onClick={() => navigate("/usermanagement")}className={styles.usermanagement}>User Management</button>
      <h1 className={styles.welcome}>Welcome</h1>
      <div className={styles.buttonGroup}>
        <button onClick={() => navigate("/topproduct")}className={styles.startbutton}>Start</button>
      </div>

    </div>
  );
}

export default Welcomeadmin;