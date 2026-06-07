import React from "react";
import { Navigate } from "react-router-dom";
import { useFirebase } from "../context/firebase";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useFirebase();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F0F8F8]">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
