import styles from "./confirmation.module.css";
import { useState } from "react";

function Confirmation({ onConfirm, onClose, username}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleYes = async () => {
        setLoading(true);
        setError("");

        try {
            const success = await onConfirm();
            if (success) {
                alert(`User "${username || 'the user'}" has been removed successfully!`);
                onClose();
            }
        } catch (err) {
            setError(err.message || "Failed to remove user. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.confirmationpage}>
            <div className={styles.confirmationcontainer}>
                <h1 className={styles.confirmationtitle}>REMOVING</h1>
                {error && (
                    <p className={styles.errorText}>{error}</p>
                )}
                <p className={styles.confirmationmessage}>
                        Are you sure you want to remove this user "{username}"?
                </p>

                <p className={styles.warningText}>
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
