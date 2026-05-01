import styles from "./adduserpopup.module.css";
function AddUserPopup({ onClose }) {
    return (
        <div className={styles.popup}>
            <div className={styles.addpopup}>
                <h1 className={styles.addusertitle}>Add User</h1>
                <h3>Username:</h3>
                <input type="text" placeholder="Enter Username" className={styles.textdesign}/>
                <h3>ID:</h3>
                <input type="text" placeholder="Enter User ID" className={styles.textdesign}/>
                <h3>Role:</h3>
                <input type="text" placeholder="Enter Role" className={styles.textdesign}/>
                <h3>Password:</h3>
                <input type="password" placeholder="Enter Password" className={styles.textdesign}/>
                <h3>Confirm Password:</h3>
                <input type="password" placeholder="Confirm Password" className={styles.textdesign}/>
                <button onClick={onClose} className={styles.buttonpop}>Done</button>
                <br />
                <button onClick={onClose}className={styles.buttonpop}>Cancel</button> {/*will be back */}
            </div>
      </div>
    );
}
export default AddUserPopup;