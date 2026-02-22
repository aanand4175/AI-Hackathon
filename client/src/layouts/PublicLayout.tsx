import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const PublicLayout: React.FC = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <footer className="footer">
        <p>
          &copy; 2026 Farmer Profitability Estimator. Built for Indian
          Agriculture.
        </p>
      </footer>
    </>
  );
};

export default PublicLayout;
