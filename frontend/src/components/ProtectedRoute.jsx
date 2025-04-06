import React from "react";
import { Navigate } from "react-router-dom";
import { useFirebase } from "../context/firebase";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useFirebase();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};


export default ProtectedRoute;
