
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import "../css/AdminUsers.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [search, setSearch] = useState("");

  // Add user
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  // Add user validation errors
  const [addErrors, setAddErrors] = useState({});

  // Show or hide add-user password
  const [showAddPassword, setShowAddPassword] = useState(false);

  // Edit user
  const [editUser, setEditUser] = useState(null);

  // Delete confirmation
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Get token from localStorage
  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:3000/api/users",
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch users");
      }

      setUsers(result.users || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search users
  const handleSearch = async (value) => {
    setSearch(value);
    setCurrentPage(1);

    if (!value.trim()) {
      fetchUsers();
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/users/search?q=${encodeURIComponent(value)}`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Search failed");
      }

      setUsers(result.users || []);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle add user input
  const handleNewUserChange = (event) => {
    const { name, value } = event.target;

    setNewUser((previousUser) => ({
      ...previousUser,
      [name]: value,
    }));

    // Clear the error when the user corrects the field
    setAddErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));
  };

  // Validate add user form
  const validateAddUser = () => {
    const errors = {};

    const trimmedName = newUser.name.trim();
    const trimmedEmail = newUser.email.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName) {
      errors.name = "Name is required";
    } else if (trimmedName.length < 2) {
      errors.name = "Name must contain at least 2 characters";
    }

    if (!trimmedEmail) {
      errors.email = "Email is required";
    } else if (!emailPattern.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    }

    if (!newUser.password) {
      errors.password = "Password is required";
    } else if (newUser.password.length < 6) {
      errors.password = "Password must contain at least 6 characters";
    }

    if (!newUser.role) {
      errors.role = "Please select a role";
    }

    setAddErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // Add new user
  const handleAddUser = async (event) => {
    event.preventDefault();

    if (!validateAddUser()) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/api/users",
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            ...newUser,
            name: newUser.name.trim(),
            email: newUser.email.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add user");
      }

      toast.success("User added successfully!");

      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "user",
      });

      setAddErrors({});
      setShowAddPassword(false);
      setSearch("");
      setCurrentPage(1);

      await fetchUsers();

    } catch (error) {
      toast.error(error.message);
    }
  };

  // Start editing a user
  const handleEditClick = (user) => {
    setEditUser({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  };

  // Handle edit input
  const handleEditChange = (event) => {
    setEditUser((previousUser) => ({
      ...previousUser,
      [event.target.name]: event.target.value,
    }));
  };

  // Update user
  const handleUpdateUser = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${editUser._id}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({
            name: editUser.name.trim(),
            email: editUser.email.trim(),
            role: editUser.role,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update user");
      }

      toast.success("User updated successfully!");

      setEditUser(null);
      setSearch("");
      setCurrentPage(1);

      await fetchUsers();

    } catch (error) {
      toast.error(error.message);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    try {
      setDeleting(true);

      const response = await fetch(
        `http://localhost:3000/api/users/${userId}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete user");
      }

      // Remove deleted user from the list
      setUsers((previousUsers) =>
        previousUsers.filter((user) => user._id !== userId)
      );

      setDeleteUserId(null);

      toast.success("User deleted successfully!");

    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(users.length / usersPerPage);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  const currentUsers = users.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

  // Correct page after deleting a user
  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    } else if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [users.length, currentPage, totalPages]);

  return (
    <div className="admin-users-page">

      <h1 className="admin-users-title">User Management</h1>

      {/* Search */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(event) => handleSearch(event.target.value)}
        />
      </div>

      {/* Add User Form */}
      <div className="admin-form-card">

        <h2>Add New User</h2>

        <form
          onSubmit={handleAddUser}
          className="add-user-form"
          noValidate
        >

          <div className="form-field">
            <input
              type="text"
              name="name"
              placeholder="Enter name"
              value={newUser.name}
              onChange={handleNewUserChange}
            />

            {addErrors.name && (
              <p className="validation-error">
                {addErrors.name}
              </p>
            )}
          </div>

          <div className="form-field">
            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={newUser.email}
              onChange={handleNewUserChange}
            />

            {addErrors.email && (
              <p className="validation-error">
                {addErrors.email}
              </p>
            )}
          </div>

          {/* Password with eye icon */}
          <div className="form-field">
            <div className="admin-password-wrapper">
              <input
                type={showAddPassword ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                value={newUser.password}
                onChange={handleNewUserChange}
              />

              <button
                type="button"
                className="admin-password-toggle"
                onClick={() =>
                  setShowAddPassword((previous) => !previous)
                }
                aria-label={
                  showAddPassword ? "Hide password" : "Show password"
                }
              >
                {showAddPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {addErrors.password && (
              <p className="validation-error">
                {addErrors.password}
              </p>
            )}
          </div>

          <div className="form-field">
            <select
              name="role"
              value={newUser.role}
              onChange={handleNewUserChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            {addErrors.role && (
              <p className="validation-error">
                {addErrors.role}
              </p>
            )}
          </div>

          <button type="submit" className="add-user-btn">
            Add User
          </button>

        </form>
      </div>

      {/* Edit User Form */}
      {editUser && (
        <div className="admin-form-card edit-user-card">

          <h2>Edit User</h2>

          <form
            onSubmit={handleUpdateUser}
            className="edit-user-form"
          >

            <input
              type="text"
              name="name"
              placeholder="Enter name"
              value={editUser.name}
              onChange={handleEditChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={editUser.email}
              onChange={handleEditChange}
              required
            />

            <select
              name="role"
              value={editUser.role}
              onChange={handleEditChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <button type="submit" className="add-user-btn">
              Update User
            </button>

            <button
              type="button"
              className="cancel-edit-btn"
              onClick={() => setEditUser(null)}
            >
              Cancel
            </button>

          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="users-table-card">

        <h2>All Users</h2>

        {loading ? (
          <p className="loading-message">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="no-users-message">No users found.</p>
        ) : (
          <div className="table-responsive">

            <table className="users-table">

              <thead>
                <tr>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user._id}>

                    <td>
                      <img
                        src={
                          user.profileImage ||
                          "/default-avatar.png"
                        }
                        alt={`${user.name}'s profile`}
                        className="user-profile-image"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = "/default-avatar.png";
                        }}
                      />
                    </td>

                    <td>{user.name}</td>

                    <td>{user.email}</td>

                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="user-actions">

                      <button
                        type="button"
                        className="edit-btn"
                        onClick={() => handleEditClick(user)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => setDeleteUserId(user._id)}
                      >
                        Delete
                      </button>

                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="pagination">

          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((page) => (
            <button
              type="button"
              key={page}
              className={currentPage === page ? "active-page" : ""}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>

        </div>
      )}

      {/* Delete Confirmation Popup */}
      {deleteUserId && (
        <div className="delete-modal-overlay">

          <div className="delete-modal">

            <h2>Confirm Deletion</h2>

            <p>
              Are you sure you want to delete this user?
              This action cannot be undone.
            </p>

            <div className="delete-modal-actions">

              <button
                type="button"
                className="confirm-delete-btn"
                disabled={deleting}
                onClick={() => handleDeleteUser(deleteUserId)}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>

              <button
                type="button"
                className="cancel-delete-btn"
                disabled={deleting}
                onClick={() => setDeleteUserId(null)}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminUsers;
