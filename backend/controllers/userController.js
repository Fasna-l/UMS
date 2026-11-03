import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

//Get all users
const getAllUsers = async(req,res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message:"Users fetched successfully",
            users,
        });
    } catch (error) {
        console.error("Get users error:",error);
        return res.status(500).json({
            message:"Server error while fetching users",
        });
    }
};

//search users by name and email
const searchUsers = async (req, res) => {
    try {
        const search = req.query.q?.trim();

        if (!search) {
            return res.status(400).json({
                message: "Please provide a search term.",
            });
        }

        // Escape special regex characters in the search term.
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const users = await User.find({
            $or: [
                { name: { $regex: escapedSearch, $options: "i" } },
                { email: { $regex: escapedSearch, $options: "i" } },
            ],
        }).select("-password") .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Search completed successfully",
            users,
        });

    } catch (error) {
        console.error("Search users error:", error);

        return res.status(500).json({
            message: "Server error while searching users",
        });
    }
};

//add a new user (Admin only)
// Add a new user (Admin only)
const addUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required.",
            });
        }

        // Validate name
        if (name.trim().length < 2) {
            return res.status(400).json({
                message: "Name must contain at least 3 characters.",
            });
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({
                message: "Please provide a valid email address.",
            });
        }

        // Validate password
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters.",
            });
        }

        // Check whether email already exists
        const existingUser = await User.findOne({
            email: email.trim().toLowerCase(),
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists.",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await User.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role: role === "admin" ? "admin" : "user",
        });

        return res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });

    } catch (error) {
        console.error("Add user error:", error);

        return res.status(500).json({
            message: "Server error while adding user.",
        });
    }
};

// Update an existing user (Admin only)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;

        // Validate user ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid user ID.",
            });
        }

        // Check whether the user exists
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        // Validate name
        if (name !== undefined && name.trim().length < 2) {
            return res.status(400).json({
                message: "Name must contain at least 2 characters.",
            });
        }

        // Validate email
        if (email !== undefined) {
            const normalizedEmail = email.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(normalizedEmail)) {
                return res.status(400).json({
                    message: "Please provide a valid email address.",
                });
            }

            // Check whether another user already uses this email
            const existingUser = await User.findOne({
                email: normalizedEmail,
                _id: { $ne: id },
            });

            if (existingUser) {
                return res.status(409).json({
                    message: "Email already exists.",
                });
            }

            user.email = normalizedEmail;
        }

        // Validate role
        if (role !== undefined) {
            if (!["user", "admin"].includes(role)) {
                return res.status(400).json({
                    message: "Invalid role.",
                });
            }

            user.role = role;
        }

        // Update name
        if (name !== undefined) {
            user.name = name.trim();
        }

        // Save updated user
        await user.save();

        return res.status(200).json({
            message: "User updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });

    } catch (error) {
        console.error("Update user error:", error);

        return res.status(500).json({
            message: "Server error while updating user.",
        });
    }
};

// Delete an existing user (Admin only)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate user ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid user ID.",
            });
        }

        // Prevent admin from deleting their own account
        if (req.user._id.toString() === id) {
            return res.status(400).json({
                message: "You cannot delete your own admin account.",
            });
        }

        // Find and delete the user
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        return res.status(200).json({
            message: "User deleted successfully.",
        });

    } catch (error) {
        console.error("Delete user error:", error);

        return res.status(500).json({
            message: "Server error while deleting user.",
        });
    }
};

export {getAllUsers,searchUsers,addUser,updateUser,deleteUser};