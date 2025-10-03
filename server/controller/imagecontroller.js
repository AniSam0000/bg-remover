import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import userModel from "../models/userModel.js";
import { log } from "console";

// Controller function to remove background from image
const removeBgImage = async (req, res) => {
  try {
    const { clerkId } = req.user;
    // console.log(clerkId);

    const user = await userModel.findOne({ clerkId });

    if (!user) {
      return res.json({ success: false, message: " User not found" });
    }

    if (user.creditBalance === 0) {
      return res.json({
        success: false,
        message: "No credit balance",
        creditBalance: user.creditBalance,
      });
    }

    const imagePath = req.file.path;

    // Reading the image file
    const imageFile = fs.createReadStream(imagePath);

    const formdata = new FormData();
    formdata.append("image_file", imageFile);

    //API call
    const { data } = await axios.post(
      "https://clipdrop-api.co/remove-background/v1",
      formdata,
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API,
        },
        responseType: "arraybuffer",
      }
    );

    const base64Image = Buffer.from(data, "binary").toString("base64");

    const resultImage = `data:${req.file.mimetype};base64,${base64Image}`;

    await userModel.findByIdAndUpdate(user._id, {
      creditBalance: user.creditBalance - 1,
    });

    res.json({
      success: true,
      resultImage,
      creditBalance: user.creditBalance - 1,
      message: "Background Removed ",
    });
  } catch (error) {
    console.log("Error in imageController.js");
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export { removeBgImage };
