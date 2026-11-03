import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from './routes/authRoutes.js';
import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);

app.get("/",(req,res)=>{
    res.send("UMS Backend is running!");
});

const startServer = async () => {
    await connectDB();

    const PORT = process.env.PORT || 3000;

    app.listen(PORT,()=>{
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();