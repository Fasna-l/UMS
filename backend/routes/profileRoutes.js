import express from "express";

import {
    getMyProfile,
    updateMyProfile,
} from "../controllers/profileController.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Get profile
router.get("/", protect, getMyProfile);

// Update profile and upload image
router.put("/", protect, upload.single("profileImage"), updateMyProfile);

export default router;