import styles from "./removeuserpopup.module.css";
import Confirmation from "./confirmation";
import { useState } from "react";
import axios from "axios";

function RemoveUserPopup({ onClose }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [username, setUsername] = useState("");
    const [userId, setUserId] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://localhost:3000"; 
    
    const handleArchive = async () => {
        setLoading(true);

        try {
            console.log("Sending DELETE request to:", `${API_BASE_URL}/users/${userId}`);
            const response = await axios.delete(`${API_BASE_URL}/users/${userId}`);
            console.log("Success:", response.data);
            onClose();
            return true;
        } catch (err) {
            console.error("Full error:", err); 
            if (err.response) {
                setError(`Server error: ${err.response.status}`);
            } else if (err.request) {
                setError("Cannot connect to backend. Make sure Docker is running.");
            } else {
                setError(err.message || "Request failed");
            }
            return false;
        } finally {
            setLoading(false);
        }
    }

    const handleConfirmClick = () => {
        setError("");
        
        if (!username && !userId) {
            setError("Please enter username and user ID.");
            return;
        }
        
        if (!userId) {
            setError("Please enter user ID.");
            return;
        }
        if (!username) {
            setError("Please enter username.");
            return;
        }
        setShowConfirm(true);
        
    }

    return (
        <div className={styles.popup}>
            <div className={styles.removepopup}>
                <h1 className={styles.removeusertitle}>Remove User</h1>
                <h3>Username:</h3>
                <input 
                    type="text" 
                    placeholder="Enter Username" 
                    className={styles.textdesign}
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                />
                <h3>ID:</h3>
                <input 
                    type="text" 
                    placeholder="Enter User ID" 
                    className={styles.textdesign}
                    value={userId} 
                    onChange={(e) => setUserId(e.target.value)}
                />
                
                {error && (
                    <div style={{
                        color: "red", 
                        margin: "10px 0", 
                        padding: "10px", 
                        backgroundColor: "#ffebee", 
                        border: "1px solid red", 
                        borderRadius: "5px",
                        textAlign: "center"
                    }}>
                        {error}
                    </div>
                )}
                
                <button 
                    onClick={handleConfirmClick} 
                    className={styles.buttonpop}
                >
                    Confirm
                </button>
                <br />
                <button onClick={onClose} className={styles.buttonpop}>Cancel</button>
            </div>
            {showConfirm && (
                <Confirmation 
                    onConfirm={handleArchive} 
                    onClose={() => setShowConfirm(false)} 
                />
            )}
        </div>
    );
}

export default RemoveUserPopup;