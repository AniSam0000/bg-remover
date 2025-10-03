import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContextProvider.js";

const Upload = () => {
  const { removeBg } = useContext(AppContext);
  return (
    <div className="pb-16  ">
      {/* ----- Title ----- */}
      <h1 className="text-center text-2xl md:text-3xl lg:text-4xl mt-4 font-semibold bg-gradient-to-r from-gray-900 to-gray-400 bg-clip-text text-transparent py-6 md:py-16 ">
        See the magic , try now
      </h1>

      <div className="text-center mb-24 ">
        <input
          onChange={(e) => removeBg(e.target.files[0])}
          accept="image/*"
          type="file"
          name=""
          id="upload2"
          hidden
        />
        <label
          htmlFor="upload2"
          className="inline-flex gap-3 px-8 py-3.5 rounded-full cursor-pointer bg-gradient-to-r from-violet-500 to-fuchsia-400 m-auto hover:scale-105 transition-all duration-700   "
        >
          <img width={20} src={assets.upload_btn_icon} alt="" />
          <p className="text-white text-sm ">Upload your image</p>
        </label>
      </div>
    </div>
  );
};

export default Upload;
