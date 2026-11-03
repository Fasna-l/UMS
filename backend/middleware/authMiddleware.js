import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protect = async (req, res, next) => {
    try {
        let token;

        // Check whether the Authorization header contains a Bearer token.
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                message: "Not authorized. No token provided.",
            });
        }

        // Verify the JWT.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user associated with the token.
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({
                message: "User no longer exists.",
            });
        }

        // Attach the user to the request.
        req.user = user;

        next();

    } catch (error) {
        console.error("Authentication error:", error);

        return res.status(401).json({
            message: "Invalid or expired token.",
        });
    }
};

export { protect };