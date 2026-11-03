import { Link, useNavigate } from "react-router-dom";
import {useForm} from "react-hook-form";
import { toast } from "react-toastify";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "../css/Auth.css";
import { useDispatch } from "react-redux";
import { loginAction } from "../features/auth/authActions";

function Login(){
    const {register,handleSubmit,reset,formState:{errors,isSubmitting}} = useForm();
    const navigate = useNavigate();
    const [showPassword,setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const onSubmit = async (data) => {
        try {
            const response = await fetch(
                "http://localhost:3000/api/auth/login",
                {
                    method:"POST",
                    headers: {
                        "Content-Type":"application/json",
                    },
                    body: JSON.stringify({
                        email:data.email.trim(),
                        password:data.password,
                    }),
                }
            );

            const result = await response.json();

            if(!response.ok){
                throw new Error(result.message || "Login failed");
            }

             // Store the JWT returned by the backend.
            localStorage.setItem("token", result.token);

            // Store the logged-in user's information.
            localStorage.setItem("user", JSON.stringify(result.user));

            dispatch(loginAction(result.user, result.token));
            
            toast.success(result.message || "Login successful!");

            console.log("Login response:",result);
            reset();

            // Redirect according to the user's role.
            if (result.user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/home");
            }
        } catch (error) {
            toast.error(error.message || "Unable to connect to the server");
            console.error("Login error:",error);
        }
    };

    return (
      <div className="auth-page">  
        <div className="auth-card">
            <h1>Welcome Back!</h1>

            <p className="auth-subtitle">
                Log in to access your account.
            </p>
            <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="auth-field">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Enter your email"
                        {...register("email",{
                            required:"Email is required",
                            pattern:{
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message:"Please enter a valid email address",
                            },
                        })}
                    />
                    {errors.email && <p className="auth-error">{errors.email.message}</p>}
                </div>

                <div className="auth-field">
                    <label htmlFor="password">Password</label>

                    <div className="password-input-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder="Enter your password"
                            {...register("password", {
                                required: "Password is required",
                            })}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword((previous) => !previous)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {errors.password && <p className="auth-error">{errors.password.message}</p>}
                </div>

                <button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Logging in..." : "Login" }</button>
            </form>

            <p className="auth-footer">
                Don't have an account? <Link className="auth-link" to="/register">Register</Link>
            </p>
        </div>

      </div>  
    );
}

export default Login;