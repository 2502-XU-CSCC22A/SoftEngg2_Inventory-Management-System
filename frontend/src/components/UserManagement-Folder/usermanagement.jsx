import styles from"./usermanagement.module.css";
import AddUserPopup from "./adduserpopup";

import RemoveUserPopup from "./removeuserpopup";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
function UserManagement() {
    const [showAdd, setShowAdd] = useState(false);
    const [showRemove, setShowRemove] = useState(false);
    const navigate = useNavigate();
    return (
        <div>
            <div className={styles.header}>
            <h1 className={styles.usermantitle1}>User Management</h1>
            <button className={styles.backbutton} onClick = {() => navigate("/welcomeadmin")}>Back</button>
            </div>
              <hr className={styles.line1}/>
            <button className={styles.adduserbutton} onClick ={() => setShowAdd(true)}>Add User</button>
            <button className={styles.removeuserbutton} onClick={() => setShowRemove(true)}>Remove User</button>
             <h1 className={styles.recent}>Most Recent</h1>
             <input type="search" placeholder="Search..." className={styles.search}/>
             <div className={styles.table}>
             <h1> Users </h1>
             <h1> ID </h1>
             <h1> Role </h1>
             <hr className={styles.line2} />
             </div>
             {showAdd && <AddUserPopup onClose={() => setShowAdd(false)} />}
             {showRemove && <RemoveUserPopup onClose={() => setShowRemove(false)} />}
             
             
        </div>
    );
}
export default UserManagement;