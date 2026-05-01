import styles from "./confirmation.module.css";
import { useState } from "react";

function Confirmation({ onConfirm, onClose, username, userId }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleYes = async () => {
        setLoading(true);
        setError("");
        try {
            const success = await onConfirm(userId);
            if (success) {
                alert(`User "${username || 'the user'}" has been removed successfully!`);
                onClose();
            }
        } catch (err) {
            setError(err.message || "Failed to remove user. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.confirmationpage}>
            <div className={styles.confirmationcontainer}>
                <h1 className={styles.confirmationtitle}>REMOVING</h1>
                {error && (
                    <p style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>{error}</p>
                )}
                <p className={styles.confirmationmessage}>
                    {username
                        ? `Are you sure you want to remove "${username}"?`
                        : "Are you sure you want to remove this user?"}
                </p>
                <p style={{ fontSize: "12px", color: "#999", marginTop: "-10px", marginBottom: "15px" }}>
                    This action cannot be undone.
                </p>
                <button
                    onClick={handleYes}
                    className={styles.confirmbuttons}
                    disabled={loading}
                >
                    {loading ? "Removing..." : "Yes"}
                </button>
                <button
                    onClick={onClose}
                    className={styles.confirmbuttons}
                    disabled={loading}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default Confirmation;
