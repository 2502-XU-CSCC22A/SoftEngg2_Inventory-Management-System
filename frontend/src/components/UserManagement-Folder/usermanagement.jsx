import styles from "./usermanagement.module.css";
import AddUserPopup from "./adduserpopup";
import RemoveUserPopup from "./removeuserpopup";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUsers } from "../../hooks/useUsers.js";

function UserManagement() {
    const [showAdd, setShowAdd] = useState(false);
    const [showRemove, setShowRemove] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    // Use the React Query hook to fetch users
    const { data: usersData, isLoading, isError, refetch } = useUsers();
    
    // Extract users array from the response (assuming API returns { data: [...] } or just array)
    const users = usersData?.data || usersData || [];

    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDateTime = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleUserAdded = async (newUser) => {
        await refetch(); // Refresh the user list
    };

    const handleUserRemoved = async () => {
        await refetch(); // Refresh the user list
    };

    if (isLoading) return <div className={styles.loading}>Loading users...</div>;
    if (isError) return <div className={styles.error}>Failed to load users. Please try again.</div>;

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.usermantitle1}>User Management</h1>
                <button className={styles.backbutton} onClick={() => navigate("/welcomeadmin")}>Back</button>
            </div>
            <hr className={styles.line1} />
            <button className={styles.adduserbutton} onClick={() => setShowAdd(true)}>Add User</button>
            <button className={styles.removeuserbutton} onClick={() => setShowRemove(true)}>Remove User</button>
            <h1 className={styles.recent}>Most Recent</h1>
            <input
                type="search"
                placeholder="Search..."
                className={styles.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
           
            {/* Table Header */}
            <div className={styles.tableHeader}>
                <div className={styles.headerCell}>Users</div>
                <div className={styles.headerCell}>Role</div>
                <div className={styles.headerCell}>Created On</div>
            </div>
            <hr className={styles.line2} />
           
            {/* Table Body - User List */}
            <div className={styles.tableBody}>
                {filteredUsers.length === 0 ? (
                    <div className={styles.emptyRow}>
                        <p>No users found</p>
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user.id || user.user_id} className={styles.tableRow}>
                            <div className={styles.cell}>{user.username || user.user_name}</div>
                            <div className={styles.cell}>
                                <span className={user.role === "admin" ? styles.adminBadge : styles.userBadge}>
                                    {user.role || "user"}
                                </span>
                            </div>
                            <div className={styles.cell}>{formatDateTime(user.createdAt || user.created_at)}</div>
                        </div>
                    ))
                )}
            </div>

            {showAdd && <AddUserPopup
                onClose={() => setShowAdd(false)}
                onUserAdded={handleUserAdded}
                existingUsers={users}
            />}
            {showRemove && <RemoveUserPopup
                onClose={() => setShowRemove(false)}
                onUserRemoved={handleUserRemoved}
                users={users}
            />}
        </div>
    );
}

export default UserManagement;
