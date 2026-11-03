import express from "express";

import { getAllUsers,searchUsers,addUser,updateUser,deleteUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";  //protect -> verifies the JWT
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Search users
router.get("/search", protect, adminOnly, searchUsers);

// Add a new user
router.post("/", protect, adminOnly, addUser);

// Update an existing user
router.put("/:id", protect, adminOnly, updateUser);

// Delete a user
router.delete("/:id", protect, adminOnly, deleteUser);

//Get all users.
router.get("/", protect, adminOnly, getAllUsers);

export default router;