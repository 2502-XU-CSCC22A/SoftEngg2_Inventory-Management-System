import styles from "./usermanagement.module.css";
import AddUserPopup from "./adduserpopup";
import RemoveUserPopup from "./removeuserpopup";
import EditUserPopup from "./edituserpopup";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useUsers } from "../../hooks/useUsers.js";
import logo from "../../assets/logo.jpg";


function UserManagement() {
    const [showAdd, setShowAdd] = useState(false);
    const [showRemove, setShowRemove] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const [showEdit, setShowEdit] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Use the React Query hook to fetch users
    const { data: usersData, isLoading, isError, refetch } = useUsers();
    
    // Extract users array from the response
    const users = usersData?.data || usersData || [];

    const filteredUsers = users.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const handlEditClick = (user) => {
        setSelectedUser(user);
        setShowEdit(true);
    }
    const handleUserAdded = async () => {
        await refetch(); // Refresh the user list
    };

    const handleUserRemoved = async () => {
        await refetch(); // Refresh the user list
    };
    const handleUserUpdated = async () => {
    await refetch(); // Refresh the user list
    };

    if (isLoading) return <div className={styles.loading}>Loading users...</div>;
    if (isError) return <div className={styles.error}>Failed to load users. Please try again.</div>;

    return (
          <div className={styles.usermanagementPage}>
            <div className={styles.header}>
                 <img src={logo} alt="Logo" className={styles.logo} />
                <h1 className={styles.usermantitle1}>User Management</h1>
                <button className={styles.backbutton} onClick={() => navigate("/welcomeadmin")}>Back</button>
            </div>
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
            <div className={styles.tableHeader}>
                <div className={styles.headerCell}>Users</div>
                <div className={styles.headerCell}>Role</div>
                 <div className={styles.headerCell}>Actions</div> 
            </div>
            <hr className={styles.line2} />
           
            <div className={styles.tableBody}>
                {filteredUsers.length === 0 ? (
                    <div className={styles.emptyRow}>
                        <p>No users found</p>
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user.user_id} className={styles.tableRow}>
                            <div className={styles.cell}>{user.username}</div>
                            <div className={styles.cell}>
                                <span className={user.is_admin ? styles.adminBadge : styles.userBadge}>
                                    {user.is_admin ? "admin" : "user"}
                                </span>
                            </div>
                            <div className={styles.cell}>
                                <button className={styles.editButton} onClick={() => handlEditClick(user)}>Edit</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showAdd && <AddUserPopup 
            onClose={() => setShowAdd(false)}
                onUserAdded={handleUserAdded} //refresh
                existingUsers={users}
            />}
            {showRemove && 
            <RemoveUserPopup onClose={() => setShowRemove(false)}
                onUserRemoved={handleUserRemoved} //refresh
                users={users}
            />}
            {showEdit && selectedUser && (
                <EditUserPopup
                user={selectedUser}
                onClose={() => setShowEdit(false)}
                onUserUpdated={handleUserUpdated} //refresh
                />
            )}
        </div>
    );
}

export default UserManagement;
