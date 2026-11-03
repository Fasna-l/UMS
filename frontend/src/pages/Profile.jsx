import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { updateProfileAction } from "../features/auth/authActions";
import "../css/Profile.css";

function Profile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [name, setName] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const token = localStorage.getItem("token");

    // Fetch logged-in user's profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(
                    "http://localhost:3000/api/profile",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || "Failed to fetch profile");
                }

                setProfile(result.user);
                setName(result.user.name);
                setPreview(result.user.profileImage || "");

                // Keep Redux and localStorage synchronized
                localStorage.setItem("user", JSON.stringify(result.user));
                dispatch(updateProfileAction(result.user));

            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchProfile();
        } else {
            navigate("/login", { replace: true });
        }
    }, [token, dispatch, navigate]);

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file.");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5 MB.");
            e.target.value = "";
            return;
        }

        setSelectedImage(file);

        const imagePreview = URL.createObjectURL(file);
        setPreview(imagePreview);
    };

    // Update profile
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Name cannot be empty.");
            return;
        }

        try {
            setSaving(true);

            const formData = new FormData();

            formData.append("name", name.trim());

            if (selectedImage) {
                formData.append("profileImage", selectedImage);
            }

            const response = await fetch(
                "http://localhost:3000/api/profile",
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Profile update failed");
            }

            setProfile(result.user);
            setName(result.user.name);
            setPreview(result.user.profileImage || "");
            setSelectedImage(null);

            // Update localStorage
            localStorage.setItem("user", JSON.stringify(result.user));

            // Update Redux
            dispatch(updateProfileAction(result.user));

            toast.success("Profile updated successfully!");

        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <h2 className="profile-loading">Loading profile...</h2>;
    }

    if (!profile) {
        return <h2 className="profile-loading">Unable to load profile.</h2>;
    }

    return (
        <div className="profile-page">
            <div className="profile-card">

                <h1>My Profile</h1>

                {/* Profile Image */}
                <div className="profile-image-section">
                    <img
                        src={
                            preview ||
                            "https://placehold.co/150x150?text=Profile"
                        }
                        alt="Profile"
                        className="profile-image"
                    />

                    <label htmlFor="profileImage" className="change-image-button">
                        Change Profile Picture
                    </label>

                    <input
                        type="file"
                        id="profileImage"
                        accept="image/*"
                        onChange={handleImageChange}
                        hidden
                    />

                    <p className="image-help-text">
                        JPG, PNG or other image formats. Maximum 5 MB.
                    </p>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSubmit} className="profile-form">

                    <div className="profile-field">
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            required
                        />
                    </div>

                    <div className="profile-field">
                        <label>Email</label>
                        <input
                            type="email"
                            value={profile.email}
                            readOnly
                        />
                    </div>

                    <div className="profile-field">
                        <label>Role</label>
                        <input
                            type="text"
                            value={profile.role}
                            readOnly
                        />
                    </div>

                    <button
                        type="submit"
                        className="save-profile-button"
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>

                </form>

                <button
                    type="button"
                    className="back-profile-button"
                    onClick={() => navigate(
                        profile.role === "admin" ? "/admin" : "/home"
                    )}
                >
                    Back to Dashboard
                </button>

            </div>
        </div>
    );
}

export default Profile;