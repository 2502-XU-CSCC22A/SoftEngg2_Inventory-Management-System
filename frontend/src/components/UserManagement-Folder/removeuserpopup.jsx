import styles from "./removeuserpopup.module.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../api/api.js";

function RemoveUserPopup({ onClose, onUserRemoved, users }) {
    const navigate = useNavigate();
    const [selectedUsername, setSelectedUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRemove = async () => {
        if (!selectedUsername) {
            setError("Please select a user to remove.");
            return;
        }

        setLoading(true);
        setError("");
        
        try {
            const userToRemove = users.find(u => (u.username || u.user_name) === selectedUsername);
            const userId = userToRemove?.id || userToRemove?.user_id;
            
            const response = await api.delete(`/users/${userId}`);
            
            if (response.status === 200) {
                alert(`User "${selectedUsername}" has been removed successfully!`);
                if (onUserRemoved) {
                    await onUserRemoved(selectedUsername);
                }
                if(response.data.isSelfDelete){ //if user deletes themself, they get logged out
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
                }
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.error || "Failed to remove user. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.popup}>
            <div className={styles.removepopup}>
                <h1 className={styles.removeusertitle}>Remove User</h1>
               
                {error && (
                    <div className={styles.errorMessage} style={{ color: "red", textAlign: "center", marginBottom: "10px", fontSize: "13px" }}>
                        {error}
                    </div>
                )}
               
                <h3>Select User:</h3>
                <select
                    className={styles.textdesign}
                    value={selectedUsername}
                    onChange={(e) => setSelectedUsername(e.target.value)}
                >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                        <option key={user.id || user.user_id} value={user.username || user.user_name}>
                            {user.username || user.user_name} ({user.is_admin ? "admin" : "user"})
                        </option>
                    ))}
                </select>
               
                <p style={{ fontSize: "12px", color: "#999", marginTop: "10px", marginBottom: "15px" }}>
                    This action cannot be undone.
                </p>
               
                <button
                    onClick={handleRemove}
                    className={styles.buttonpop}
                    disabled={loading}
                >
                    {loading ? "Removing..." : "Remove User"}
                </button>
                <button
                    onClick={onClose}
                    className={styles.buttonpop}
                    disabled={loading}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default RemoveUserPopup;
