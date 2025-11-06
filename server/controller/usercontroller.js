// API Controller function to Manage Clerk User with Database
// https://localhost:4000/api/user/webhooks

import { Webhook } from "svix";
import userModel from "../models/userModel.js";
import razorpay from "razorpay";
import transactionModel from "../models/transactionModel.js";

const clerkWebhooks = async (req, res) => {
  try {
    if (!req.body || !req.headers) {
      return res.status(400).send("Missing body or headers");
    }
    const payload = req.body;
    const headers = req.headers;

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    let evt;
    try {
      evt = whook.verify(req.body, req.headers);
    } catch (verifyErr) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const { data, type } = evt;

    switch (type) {
      case "user.created": {
        const primaryEmail =
          data.email_addresses?.[0]?.email_address || "no-email@clerk.dev";

        const existingUser = await userModel.findOne({ clerkId: data.id });

        //If the Clerk Id exsists before
        if (existingUser) {
          console.log(`⚠️ User with clerkId ${data.id} already exists`);
          return res
            .status(200)
            .json({ success: false, message: "User already exists" });
        }

        const userdata = {
          clerkId: data.id,
          email: primaryEmail,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };

        const userData = await userModel(userdata);
        userData.save();

        return res.status(201).json({ success: true, message: "User created" });
      }

      case "user.updated": {
        const primaryEmail =
          data.email_addresses?.[0]?.email_address || "no-email@clerk.dev";

        const userdata = {
          email: primaryEmail,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };

        await userModel.findOneAndUpdate({ clerkId: data.id }, userdata);
        // FIX: Use 'return' here too
        return res.status(200).json({ success: true, message: "User updated" });
      }

      case "user.deleted": {
        await userModel.findOneAndDelete({ clerkId: data.id });
        //FIX: And here
        return res.status(200).json({ success: true, message: "User deleted" });
      }

      // BEST PRACTICE: Add a default case for unhandled events
      default:
        return res
          .status(200)
          .json({ success: true, message: "Webhook received" });
    }
  } catch (error) {
    // console.error("Error processing webhook:", error);
    //FIX: Return from the catch block as well
    return res.status(400).json({ success: false, message: error.message });
  }
};

// API controller function to get user  available credits data
// In your usercontroller.js

const userCredits = async (req, res) => {
  try {
    const { clerkId } = req.user;
    // console.log(clerkId);

    if (!clerkId) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    const userData = await userModel.findOne({ clerkId });
    // console.log(userData);

    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found in DB" });
    }

    // Make sure your schema field is named 'credits' or 'creditBalance'
    return res.json({ success: true, credits: userData.creditBalance });
  } catch (error) {
    console.error("Error in userCredits function", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// gateway initialize

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//API to make payments for credit
const paymentRazorpay = async (req, res) => {
  try {
    const { clerkId } = req.user;
    const { planId } = req.body;
    console.log(planId);

    const userData = await userModel.findOne({ clerkId });

    if (!userData || !planId) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    let credits, plan, amount, date;

    switch (planId) {
      case "Basic":
        plan = "Basic";
        credits = 100;
        amount = 10;

        break;
      case "Advanced":
        plan = "Advanced";
        credits = 500;
        amount = 50;

        break;
      case "Business":
        plan = "Business";
        credits = 5000;
        amount = 250;

        break;

      default:
        return res.json({ success: false, message: "Invalid Plan Selected" });
        break;
    }

    date = Date.now();

    //Creating Transaction
    const transactionData = {
      clerkId,
      plan,
      amount,
      credits,
      date,
    };

    const newTransaction = await transactionModel.create(transactionData);

    const options = {
      amount: amount * 100,
      currency: process.env.CURRENCY || "INR",
      receipt: newTransaction._id.toString(),
    };

    const order = await razorpayInstance.orders.create(options);

    res.json({ success: true, order });
  } catch (error) {
    console.error("Error in paymentRazorpay function", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

//API controller function to verify razorpay payment
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status == "paid") {
      const transactionData = await transactionModel.findById(
        orderInfo.receipt
      );

      if (transactionData.payment) {
        return res.json({ success: false, message: "Payment Failed" });
      }
      //Adding Credits in user data
      const userData = await userModel.findOne({
        clerkId: transactionData.clerkId,
      });

      const creditBalance = userData.creditBalance + transactionData.credits;

      await userModel.findByIdAndUpdate(userData._id, { creditBalance });

      //Make the payment status true
      await transactionModel.findByIdAndUpdate(transactionData._id, {
        payment: true,
      });

      res.json({ success: true, message: "Credits added" });
    }
  } catch (error) {
    console.error("Error in verifyRazorpay function", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { clerkWebhooks, userCredits, paymentRazorpay, verifyRazorpay };
