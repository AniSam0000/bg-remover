import express from "express";
import { clerkWebhooks } from "../controller/usercontroller.js";

// Setting up router

const userRouter = express.Router();

userRouter.post(
  "/webhooks",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);

export default userRouter;
