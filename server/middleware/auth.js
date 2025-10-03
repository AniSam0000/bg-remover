import jwt from "jsonwebtoken";

// Middleware func to decode jwt function to get clerk Id

// When want to develop production level project use Clerk express with Auth

const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    // console.log(token);

    if (!token) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    const token_decode = jwt.decode(token);

    // console.log(token_decode);

    // req.body.clerkId = token_decode.clerkId;
    // This works for ALL request types
    req.user = {
      clerkId: token_decode.clerkId,
    };

    // console.log(req.body.clerkId);

    next();
  } catch (error) {
    console.log("Error in Auth function      ", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

export default authUser;
