import express from "express";
import { clerkWebhooks } from "../controller/usercontroller.js";

// Setting up router

const userRouter = express.Router();

userRouter.post("/webhooks", clerkWebhooks);

export default userRouter;
