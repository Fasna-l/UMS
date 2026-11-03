import {Link} from 'react-router-dom';
import {useForm} from 'react-hook-form';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'
import { toast } from "react-toastify";
import '../css/Auth.css'

function Register(){
    const {register,handleSubmit,watch,reset,formState:{errors,isSubmitting}} = useForm();

    const [showPassword,setShowPassword] = useState(false); //initially false -> password remain hidden
    const [showConfirmPassword,setShowConfirmPassword] = useState(false); // initially false -> password remain hidden
    
    const onSubmit = async (data) => {
        try {
            const response = await fetch(
                "http://localhost:3000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":"application/json",
                    },
                    body: JSON.stringify({
                        name:data.name.trim(),
                        email:data.email.trim(),
                        password:data.password,
                    })
                }
            );

            const result = await response.json();

            if(!response.ok){
                throw new Error(result.message || "Registration failed");
            }
            toast.success(result.message || "Registration successful!");
            reset();
            setShowPassword(false);
            setShowConfirmPassword(false);

            console.log("Registration user:",result.user);

        } catch (error) {
            toast.error(error.message || "Unable to connect to the server");
            console.error("Registration error:",error);
        }
    }

    const password = watch("password");
    return(
      <div className="auth-page">  
        <div className="auth-card">
            <h1>Create Account</h1>

            <p className="auth-subtitle">
                Register to get started with UMS.
            </p>
            {/* <h1>Register</h1> */}
            <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                <div className="auth-field">
                    <label htmlFor='name'>FullName</label>
                    <input
                        type='text'
                        id='name'
                        placeholder='Enter your full name'
                        {...register("name",{
                            required:"Full name is required",
                            validate: (value)=>
                                value.trim().length >= 2 ||
                            "Name must contain at least 2 characters"
                        })}
                    />
                    {errors.name && <p className="auth-error">{errors.name.message}</p>}
                </div>
                <div className="auth-field">
                    <label htmlFor='email'>Email</label>
                    <input
                        type='email'
                        id='email'
                        placeholder='Enter your email'
                        {...register("email",{
                            required:"Email is required",
                            pattern: {
                                value : /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message : "Please enter a valid email address",
                            },
                        })}
                    />
                    {errors.email && <p className="auth-error">{errors.email.message}</p>}
                </div>
                <div className="auth-field">
                    <label htmlFor='password'>Password</label>
                    <div className="password-input-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            id='password'
                            placeholder='Create a password'
                            {...register("password",{
                                required:"Password is required",
                                minLength:{
                                    value:6,
                                    message:"Password must be at least 6 characters",
                                },
                            })}
                        />
                        <button
                            type='button'
                            onClick={()=>setShowPassword((previous)=>!previous)}
                            aria-label={showPassword ? "Hide Password":"Show Password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>    
                    {errors.password && <p className="auth-error">{errors.password.message}</p>}
                </div>
                <div className="auth-field">
                    <label htmlFor='confirmPassword'>Confirm Password</label>
                    
                    <div className="password-input-container">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id='confirmPassword'
                            placeholder='Confirm your password'
                            {...register("confirmPassword",{
                                required:"Please confirm your password",
                                validate: (value)=> value === password || "Passwords do not match"
                            })}
                        />
                        <button
                            type='button'
                            onClick={()=>setShowConfirmPassword((previous) => !previous)}
                            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>    
                    {errors.confirmPassword && <p className="auth-error">{errors.confirmPassword.message}</p>}
                </div>
                <button className="auth-submit" type='submit' disabled={isSubmitting}>{isSubmitting ? "Registering..." : "Register"}</button>
            </form>
            <p className="auth-footer">
                Already have an account? <Link className="auth-link" to="/login">Login</Link>
            </p>
        </div>
      </div>  
    );
}

export default Register;