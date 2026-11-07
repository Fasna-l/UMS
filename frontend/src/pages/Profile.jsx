import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { updateProfileAction } from "../features/auth/authActions";
import "../css/Profile.css";

function Profile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    // React Hook Form
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            name: "",
        },
    });

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
                    throw new Error(
                        result.message || "Failed to fetch profile"
                    );
                }

                setProfile(result.user);

                // Set fetched name in React Hook Form
                reset({
                    name: result.user.name || "",
                });

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
    }, [token, dispatch, navigate, reset]);

    // Clean up temporary image preview URLs
    useEffect(() => {
        return () => {
            if (preview.startsWith("blob:")) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

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

    // Update profile using React Hook Form
    const onSubmit = async (data) => {
        try {
            const formData = new FormData();

            formData.append("name", data.name.trim());

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
                throw new Error(
                    result.message || "Profile update failed"
                );
            }

            setProfile(result.user);

            // Update React Hook Form with saved name
            reset({
                name: result.user.name || "",
            });

            setPreview(result.user.profileImage || "");
            setSelectedImage(null);

            // Update localStorage
            localStorage.setItem("user", JSON.stringify(result.user));

            // Update Redux
            dispatch(updateProfileAction(result.user));

            toast.success("Profile updated successfully!");

        } catch (error) {
            toast.error(error.message);
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
                        src={preview || "/default-avatar.png"}
                        alt="Profile"
                        className="profile-image"
                    />

                    <label
                        htmlFor="profileImage"
                        className="change-image-button"
                    >
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
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="profile-form"
                >

                    <div className="profile-field">
                        <label>Name</label>

                        <input
                            type="text"
                            placeholder="Enter your name"
                            {...register("name", {
                                required: "Name is required",
                                validate: (value) =>
                                    value.trim().length > 0 ||
                                    "Name cannot be empty",
                            })}
                        />

                        {errors.name && (
                            <p className="error-message">
                                {errors.name.message}
                            </p>
                        )}
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
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>

                </form>

                <button
                    type="button"
                    className="back-profile-button"
                    onClick={() =>
                        navigate(
                            profile.role === "admin"
                                ? "/admin"
                                : "/home"
                        )
                    }
                >
                    Back to Dashboard
                </button>

            </div>
        </div>
    );
}

export default Profile;