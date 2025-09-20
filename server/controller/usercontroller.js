// API Controller function to Manage Clerk User with Database
// https://localhost:4000/api/user/webhooks

import { Webhook } from "svix";
import userModel from "../models/userModel.js";

const clerkWebhooks = async (req, res) => {
  try {
    const payload = req.body;
    const headers = req.headers;

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const evt = whook.verify(payload, headers);

    const { data, type } = evt;

    switch (type) {
      case "user.created": {
        const userdata = {
          clerkId: data.id,
          email: data.email_addresses[0].email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          photo: data.image_url,
        };

        await userModel.create(userdata);
        // FIX: Use 'return' to send response and exit the function
        return res.status(201).json({ success: true, message: "User created" });
      }

      case "user.updated": {
        const userdata = {
          email: data.email_addresses[0].email_address,
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
        console.log(`Received unhandled event type: ${type}`);
        return res
          .status(200)
          .json({ success: true, message: "Webhook received" });
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    //FIX: Return from the catch block as well
    return res.status(400).json({ success: false, message: error.message });
  }
};

export { clerkWebhooks };
