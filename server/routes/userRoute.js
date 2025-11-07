import express from "express";
import {
  clerkWebhooks,
  paymentRazorpay,
  userCredits,
  verifyRazorpay,
} from "../controller/usercontroller.js";
import authUser from "../middleware/auth.js";
// import paymentLink from "razorpay/dist/types/paymentLink.js";

// Setting up router

const userRouter = express.Router();

// userRouter.post(
//   "/webhooks",
//   express.raw({ type: "application/json" }),
//   clerkWebhooks
// );

userRouter.get("/credits", authUser, userCredits);

userRouter.post("/pay-razor", authUser, paymentRazorpay);

userRouter.post("/verify-razor", verifyRazorpay);
// paymentLink
export default userRouter;
