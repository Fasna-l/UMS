
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import "../css/AdminUsers.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [search, setSearch] = useState("");

  // Password visibility
  const [showAddPassword, setShowAddPassword] = useState(false);

  // Edit user
  const [editUser, setEditUser] = useState(null);

  // Delete confirmation
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // React Hook Form - Add User
  const {
    register: registerAdd,
    handleSubmit: handleAddSubmit,
    reset: resetAdd,
    formState: {
      errors: addErrors,
      isSubmitting: isAdding,
    },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  // React Hook Form - Edit User
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: {
      errors: editErrors,
      isSubmitting: isUpdating,
    },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      role: "user",
    },
  });

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

  // Add new user
  const handleAddUser = async (data) => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/users",
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            ...data,
            name: data.name.trim(),
            email: data.email.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add user");
      }

      toast.success("User added successfully!");

      // Reset Add User form
      resetAdd({
        name: "",
        email: "",
        password: "",
        role: "user",
      });

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
    });

    // Populate Edit User form
    resetEdit({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
    });
  };

  // Update user
  const handleUpdateUser = async (data) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${editUser._id}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({
            name: data.name.trim(),
            email: data.email.trim(),
            role: data.role,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update user");
      }

      toast.success("User updated successfully!");

      setEditUser(null);
      resetEdit();
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
          onSubmit={handleAddSubmit(handleAddUser)}
          className="add-user-form"
          noValidate
        >

          <div className="form-field">
            <input
              type="text"
              placeholder="Enter name"
              {...registerAdd("name", {
                required: "Name is required",
                validate: {
                  notEmpty: (value) =>
                    value.trim().length > 0 ||
                    "Name cannot be empty",

                  minLength: (value) =>
                    value.trim().length >= 2 ||
                    "Name must contain at least 2 characters",
                },
              })}
            />

            {addErrors.name && (
              <p className="validation-error">
                {addErrors.name.message}
              </p>
            )}
          </div>

          <div className="form-field">
            <input
              type="email"
              placeholder="Enter email"
              {...registerAdd("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address",
                },
                validate: (value) =>
                  value.trim().length > 0 ||
                  "Email is required",
              })}
            />

            {addErrors.email && (
              <p className="validation-error">
                {addErrors.email.message}
              </p>
            )}
          </div>

          {/* Password with eye icon */}
          <div className="form-field">
            <div className="admin-password-wrapper">

              <input
                type={showAddPassword ? "text" : "password"}
                placeholder="Enter password"
                {...registerAdd("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must contain at least 6 characters",
                  },
                })}
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
                {addErrors.password.message}
              </p>
            )}
          </div>

          <div className="form-field">
            <select
              {...registerAdd("role", {
                required: "Please select a role",
              })}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            {addErrors.role && (
              <p className="validation-error">
                {addErrors.role.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="add-user-btn"
            disabled={isAdding}
          >
            {isAdding ? "Adding..." : "Add User"}
          </button>

        </form>
      </div>

      {/* Edit User Form */}
      {editUser && (
        <div className="admin-form-card edit-user-card">

          <h2>Edit User</h2>

          <form
            onSubmit={handleEditSubmit(handleUpdateUser)}
            className="edit-user-form"
            noValidate
          >

            <div className="form-field">
              <input
                type="text"
                placeholder="Enter name"
                {...registerEdit("name", {
                  required: "Name is required",
                  validate: {
                    notEmpty: (value) =>
                      value.trim().length > 0 ||
                      "Name cannot be empty",

                    minLength: (value) =>
                      value.trim().length >= 2 ||
                      "Name must contain at least 2 characters",
                  },
                })}
              />

              {editErrors.name && (
                <p className="validation-error">
                  {editErrors.name.message}
                </p>
              )}
            </div>

            <div className="form-field">
              <input
                type="email"
                placeholder="Enter email"
                {...registerEdit("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  },
                  validate: (value) =>
                    value.trim().length > 0 ||
                    "Email is required",
                })}
              />

              {editErrors.email && (
                <p className="validation-error">
                  {editErrors.email.message}
                </p>
              )}
            </div>

            <div className="form-field">
              <select
                {...registerEdit("role", {
                  required: "Please select a role",
                })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              {editErrors.role && (
                <p className="validation-error">
                  {editErrors.role.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="add-user-btn"
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update User"}
            </button>

            <button
              type="button"
              className="cancel-edit-btn"
              onClick={() => {
                setEditUser(null);
                resetEdit();
              }}
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
