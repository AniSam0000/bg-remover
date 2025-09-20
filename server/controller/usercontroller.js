// API Controller function to Manage Clerk User with Database
// https://localhost:4000/api/user/webhooks

import { Webhook } from "svix";
import userModel from "../models/userModel.js";

const clerkWebhooks = async (req, res) => {
  try {
    const payload = req.body; // This is now the raw buffer
    const headers = req.headers;
    //Create a svix instance with clerk webhook secret
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    const evt = await whook.verify(payload, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = evt;

    console.log(data);

    switch (type) {
      case "user.created": {
        const userdata = {
          clerkid: data.id,
          email: data.email_addresses[0].email_address,
          firstname: data.first_name,
          lastname: data.last_name,
          photo: data.image_url,
        };

        await userModel.create(userdata);

        res.json({});

        break;
      }

      case "user.updated": {
        const userdata = {
          email: data.email_addresses[0].email_address,
          firstname: data.first_name,
          lastname: data.last_name,
          photo: data.image_url,
        };

        await userModel.findOneAndUpdate({ clerkid: data.id }, userdata);
        res.json({});
        break;
      }

      case "user.deleted": {
        await userModel.findOneAndDelete({ clerkid: data.id });
        res.json({});
        break;
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(" Error in usercontroller.js and in clerkwebhooks function");

    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export { clerkWebhooks };
