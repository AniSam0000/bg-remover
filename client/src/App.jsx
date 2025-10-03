/* eslint-disable no-unused-vars */
import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Result from "./pages/Result";
import BuyCredit from "./pages/BuyCredit";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastContainer, toast } from "react-toastify";
// import { SignInButton } from "@clerk/clerk-react";

const App = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <ToastContainer position="bottom-right" />
      <Navbar />
      {/* <SignInButton /> */}
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/result" element={<Result />}></Route>
        <Route path="/buy" element={<BuyCredit />}></Route>
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
