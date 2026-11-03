import User from '../models/userModel.js';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registerUser = async (req,res) => {
    try {
        const { name, email, password } = req.body;

        //1. Check whether all required field are provided
        if(!name || !email || !password) {
            return res.status(400).json({
                message:"Please provide name,email, and password"
            });
        }

        //2.Validate the name
        if(name.trim().length < 2){
            return res.status(400).json({
                message:"Name must contain at least 2 characters",
            });
        }

        //3.Validate the email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!emailRegex.test(email.trim())){
            return res.status(400).json({
                message:"Please enter a valid email address",
            });
        }

        //4.Validate the password Length
        if(password.length < 6){
            return res.status(400).json({
                message:"Password must contain at least 6 characters",
            });
        }

        //5.Check whether email already exists
        const existingUser = await User.findOne({
            email:email.trim().toLowerCase(),
        });

        if(existingUser){
            return res.status(409).json({
                message:"Email is already registered"
            });
        }

        //6.Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        //7.Create the user
        const newUser = await User.create({
            name:name.trim(),
            email:email.trim().toLowerCase(),
            password:hashedPassword,
        });

        //8.Send the response
        return res.status(201).json({
            message:"Registration successful",
            user:{
                id:newUser._id,
                name:newUser.name,
                email:newUser.email,
                role:newUser.role,
                profileImage: newUser.profileImage,
            },
        });

    } catch (error) {
        console.error("Registration error:", error);

        //Handle duplicate-email errors if concurrent request occur
        if(error.code === 11000 ) {
            return res.status(409).json({
                message:"Email is already registered",
            });
        } 
        return res.status(500).json({
            message:"Server error during registration",
        });
    }
};

const loginUser = async (req,res) => {
    try {
        const {email,password} = req.body;

        //1.validate the input
        if(!email || !password){
            return res.status(400).json({
                message:"Please provide email and password",
            });
        }

        //2.Find the user by email
        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        });
        if(!user){
            return res.status(401).json({
                message:"Invalid email or password",
            });
        }
        //3.Compare the entered password with the stored hash
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );
        if(!isPasswordCorrect){
            return res.status(401).json({
                message:"Invalid email or password",
            });
        }
        //4.Generate a JWT
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                role:user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );
        //5.Return the successful login response
        return res.status(200).json({
            message:"Login successful",
            token,
            user: {
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role,
                profileImage: user.profileImage,
            },
        });
    } catch (error) {
        console.error("Login error:",error);
        return res.status(500).json({
            message:"Server error during login",
        });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        return res.status(200).json({
            user: req.user,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Unable to fetch user details.",
        });
    }
};

export {registerUser,loginUser,getCurrentUser};

/*
11000 → MongoDB duplicate key error.
409 Conflict → HTTP response indicating a conflict with existing data.
*/