import { useState } from "react";
import { AppContext } from "./AppContextProvider";
import { useAuth, useClerk, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AppContextProvider = (props) => {
  const [credit, setCredit] = useState(false);

  const [image, setImage] = useState(false);
  const [resultImage, setResultImage] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  // console.log(backendUrl);
  const navigate = useNavigate();

  const { getToken } = useAuth();

  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  const loadCreditsData = async () => {
    try {
      const token = await getToken();
      // console.log(token);

      const response = await axios.get(`${backendUrl}/api/user/credits`, {
        headers: { token },
      });

      const { data } = response;
      // console.log("Response from server:", data);

      if (data.success) {
        setCredit(data.credits);
        // console.log(data.credits);
      }
    } catch (error) {
      console.log("Error in AppContext");
      console.log(error.message);
      toast.error(error.message);
    }
  };

  const removeBg = async (image) => {
    try {
      if (!isSignedIn) {
        return openSignIn();
      }
      setImage(image);
      setResultImage(false);
      navigate("/result");

      const token = await getToken();

      const formData = new FormData();

      image && formData.append("image", image);

      const response = await axios.post(
        backendUrl + "/api/image/remove-bg",
        formData,
        { headers: { token } }
      );
      // console.log(response);

      const { data } = response;
      // console.log(data);

      if (data.success) {
        setResultImage(data.resultImage);
        data.creditBalance && setCredit(data.creditBalance);
      } else {
        toast.error(data.message);
        data.creditBalance && setCredit(data.creditBalance);
        if (data.creditBalance === 0) {
          navigate("/buy");
        }
      }
    } catch (error) {
      console.log("Error in AppContext--- removeBg");
      console.log(error.message);
      toast.error(error.message);
    }
  };

  const value = {
    credit,
    setCredit,
    loadCreditsData,
    backendUrl,
    image,
    setImage,
    removeBg,
    resultImage,
    setResultImage,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
