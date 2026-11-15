import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function GuestRoute() {
    const { isAuthenticated, user } = useSelector(
        (state) => state
    );

    if (isAuthenticated) {
        if (user?.role === "admin") {
            return <Navigate to="/admin" replace />;
        }

        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
}

export default GuestRoute;