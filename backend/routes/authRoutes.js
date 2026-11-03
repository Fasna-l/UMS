import express from "express";
import {registerUser,loginUser,getCurrentUser} from '../controllers/authController.js'

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/me", protect, getCurrentUser);

export default router;

/*
A router lets us organize related API endpoints in a separate file rather than putting
every endpoint in server.js.
*/