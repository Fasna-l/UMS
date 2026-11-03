import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutAction } from "../features/auth/authActions";

function LogoutButton(){
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = ()=>{
        //Clear authentication data from Local Storage.
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        //Clear authentication data from Redux
        dispatch(logoutAction());

        //Redirect to the login page
        navigate("/login",{replace:true});
    };

    return (
        <button className="logout-button" onClick={handleLogout}>
            Logout
        </button>
    )
}

export default LogoutButton;