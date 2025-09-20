import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/mongodb.js";
import userRouter from "./routes/userRoute.js";

// APP CONFIG
const PORT = process.env.PORT || 4000;

const app = express();
await connectDB();

// Initialize Middleware
app.use(express.json());
app.use(cors()); // Use to connect client running on another server

// API routes
app.get("/", (req, res) => {
  res.send("API Working");
});

app.use("/api/user", userRouter);

app.listen(PORT, () => console.log("Server running on port " + PORT));
