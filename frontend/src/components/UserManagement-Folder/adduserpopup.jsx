import styles from "./adduserpopup.module.css";
import { useState } from "react";
import api from "../../api/api.js";

function AddUserPopup({ onClose, onUserAdded, existingUsers = [] }) {
    const [formData, setFormData] = useState({
        username: "",
        role: "user",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.username.trim() || !formData.password) {
            setError("Please fill in all required fields.");
            return;
        }
       
        if (formData.username.length < 3) {
            setError("Username must be at least 3 characters.");
            return;
        }
       
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
       
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
       
        // Check if username already exists
        const userExists = existingUsers.some(
            user => (user.username || user.user_name || "").toLowerCase() === formData.username.toLowerCase()
        );
       
        if (userExists) {
            setError("Username already exists. Please choose another.");
            return;
        }

        setLoading(true);
       
        try {
            const userData = {
                username: formData.username,
                role: formData.role,
                password: formData.password,
                confirmPassword: formData.confirmPassword
            };
            
            const response = await api.post('/users', userData);
            
            if (response.status === 201) {
                alert(`User ${formData.username} has been added successfully!`);
                if (onUserAdded){
                    await onUserAdded(/*response.data*/);
                }
            }
            onClose();
            
        } catch (err) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Failed to add user."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.popup}>
            <div className={styles.addpopup}>
                <h1 className={styles.addusertitle}>Add User</h1>
               
                {error && (
                    <div className={styles.errorMessage} style={{ color: "red", textAlign: "center", marginBottom: "10px", fontSize: "13px" }}>
                        {error}
                    </div>
                )}
               
                <h3>Username:</h3>
                <input
                    type="text"
                    name="username"
                    placeholder="Enter Username"
                    className={styles.textdesign}
                    value={formData.username}
                    onChange={handleChange}
                />
               
                <h3>Role:</h3>
                <select
                    name="role"
                    className={styles.textdesign}
                    value={formData.role}
                    onChange={handleChange}
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
               
                <h3>Password:</h3>
                <input
                    type="password"
                    name="password"
                    placeholder="Enter Password (min. 6 characters)"
                    className={styles.textdesign}
                    value={formData.password}
                    onChange={handleChange}
                />
               
                <h3>Confirm Password:</h3>
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className={styles.textdesign}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                />
               
                <button
                    onClick={handleSubmit}
                    className={styles.buttonpop}
                    disabled={loading}
                >
                    {loading ? "Adding..." : "Add User"}
                </button>
                <br />
                <button onClick={onClose} className={styles.buttonpop}>
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default AddUserPopup;
