import User from "../models/userModel.js";
import cloudinary from "../config/cloudinary.js";

// Get logged-in user's profile
const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            message: "Profile fetched successfully",
            user,
        });

    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            message: "Failed to fetch profile",
        });
    }
};


// Update profile and upload image
const updateMyProfile = async (req, res) => {
    try {
        const { name } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Update name if provided
        if (name !== undefined) {
            if (!name.trim()) {
                return res.status(400).json({
                    message: "Name cannot be empty",
                });
            }

            user.name = name.trim();
        }

        // Upload profile image to Cloudinary
        if (req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: "ums-profiles",
                        resource_type: "image",
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                );

                uploadStream.end(req.file.buffer);
            });

            user.profileImage = uploadResult.secure_url;
        }

        await user.save();

        const updatedUser = await User.findById(user._id).select("-password");

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });

    } catch (error) {
        console.error("Update profile error:", error);

        return res.status(500).json({
            message: "Failed to update profile",
        });
    }
};

export {
    getMyProfile,
    updateMyProfile,
};