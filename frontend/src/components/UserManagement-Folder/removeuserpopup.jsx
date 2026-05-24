import styles from "./removeuserpopup.module.css";
import Confirmation from "./confirmation.jsx"; 
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../api/api.js";

function RemoveUserPopup({ onClose, onUserRemoved, users }) {
    const navigate = useNavigate();
    const [selectedUsername, setSelectedUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const handleRemoveClick = () => {
        if (!selectedUsername) {
            setError("Please select a user to remove.");
            return;
        }
        const userToRemove = users.find(user => user.username === selectedUsername);
        setSelectedUser(userToRemove);
        setShowConfirmation(true);
    };

    const handleConfirmRemove = async () => {
        const userID = selectedUser?.user_id;
        setLoading(true);
        setError("");

        try {
            const response = await api.delete(`/users/${userID}`);
            if (response.status === 200) {
                if (onUserRemoved) {
                await onUserRemoved( selectedUsername);
            }
            if (response.data.isSelfDelete) {
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
                return true;
            }
        } catch (err) {
            setError(err.response?.data?.error || "Failed to remove user. Please try again.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const handleCloseConfirmation = () => {
        setShowConfirmation(false);
        setSelectedUser(null);
    };

    return (
        <>
        <div className={styles.popup}>
            <div className={styles.removepopup}>
                <h1 className={styles.removeusertitle}>Remove User</h1>
               
                {error && (
                    <div className={styles.errorMessage}>
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
                        <option key={user.user_id} value={user.username}>
                            {user.username} ({user.is_admin ? "admin" : "user"})
                        </option>
                    ))}
                </select>
               
                <p style={{ fontSize: "12px", color: "#999", marginTop: "10px", marginBottom: "15px" }}>
                    This action cannot be undone.
                </p>
               
                <button
                    onClick={handleRemoveClick}
                    className={styles.buttonpop}
                    disabled={loading}
                >
                    Remove User
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
        {showConfirmation && (selectedUser) && (
            <Confirmation
                onConfirm={handleConfirmRemove}
                onClose={handleCloseConfirmation}
                username={selectedUser.username}
             />
            )}
        </>
    );
}

export default RemoveUserPopup;
