
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutAction } from "../features/auth/authActions";

function ProtectedRoute({ allowedRole }) {
    const dispatch = useDispatch();

    const token = localStorage.getItem("token");

    const [checking, setChecking] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const verifyUser = async () => {
            const storedUser = localStorage.getItem("user");

            // Check whether token and user exist.
            if (!token || !storedUser) {
                if (isMounted) {
                    setIsValid(false);
                    setChecking(false);
                }
                return;
            }

            try {
                const response = await fetch(
                    "http://localhost:3000/api/auth/me",
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                // User was deleted or token is invalid.
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");

                    dispatch(logoutAction());

                    if (isMounted) {
                        setIsValid(false);
                        setChecking(false);
                    }

                    return;
                }

                if (!response.ok) {
                    throw new Error("Unable to verify your account.");
                }

                const result = await response.json();

                if (isMounted) {
                    setCurrentUser(result.user);
                    setIsValid(true);
                    setError("");
                    setChecking(false);
                }

            } catch (error) {
                console.error("Account verification error:", error);

                if (isMounted) {
                    setError("Unable to verify your account. Please refresh the page.");
                    setChecking(false);
                }
            }
        };

        // Verify immediately.
        verifyUser();

        // Verify again every 15 seconds.
        const interval = setInterval(verifyUser, 1500);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };

    }, [token, dispatch]);

    if (checking) {
        return <p>Verifying your account...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    if (!isValid) {
        return <Navigate to="/login" replace />;
    }

    // Check the user's role.
    if (allowedRole && currentUser?.role !== allowedRole) {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
