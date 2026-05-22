import styles from "./edituserpopup.module.css";
import { useState } from "react";
import api from "../../api/api.js";

function EditUserPopup({ user, onClose, onUserUpdated }) {
    const [username, setUsername] = useState(user.username);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(user.is_admin);

    const handleSubmit = async () => {
        setError("");

        // Validation
        if (!username.trim()) {
            setError("Username cannot be empty.");
            return;
        }
        
        if (username.length < 3) {
            setError("Username must be at least 3 characters.");
            return;
        }
        
        if (password && password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        
        setLoading(true);

        try {
            const updateData = {
                username: username.trim(),
                 is_admin: isAdmin,
                ...(password && { password: password })
            };
            
            const response = await api.put(`/users/${user.user_id}`, updateData);
            
            if (response.status === 200) {
                alert(`User ${username} has been updated successfully!`);
                if (onUserUpdated) {
                    await onUserUpdated();
                }
                onClose();
            }
        } catch (err) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Failed to update user."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.popup}>
            <div className={styles.editpopup}>
                <h1 className={styles.editusertitle}>Edit User</h1>
                
                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}
               
                <h3>Role:</h3>
                 <div className={styles.roleSelection}>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            value = "user"
                            checked={!isAdmin}
                            onChange={() => setIsAdmin(false)}
                        />
                        User
                    </label>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            value = "admin"
                            checked={isAdmin}
                            onChange={() => setIsAdmin(true)}
                        />
                        Admin
                    </label>
                </div>
                
                <h3>Username:</h3>
                <input
                    type="text"
                    placeholder="Enter Username"
                    className={styles.textdesign}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                
                <h3>New Password (optional):</h3>
                <input
                    type="password"
                    placeholder="Enter new password (min. 6 characters)"
                    className={styles.textdesign}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                
                <h3>Confirm New Password:</h3>
                <input
                    type="password"
                    placeholder="Confirm new password"
                    className={styles.textdesign}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={!password}
                />
                
                <button
                    onClick={handleSubmit}
                    className={styles.buttonpop}
                    disabled={loading}
                >
                    {loading ? "Updating..." : "Update User"}
                </button>
                <br />
                <button onClick={onClose} className={styles.buttonpop}>
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default EditUserPopup;
