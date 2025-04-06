import React from "react";
import { Navigate } from "react-router-dom";
import { useFirebase } from "../context/firebase";

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useFirebase();

  if (!currentUser) {
    // Not logged in, redirect to /auth
    return <Navigate to="/auth" replace />;
  }
  // Logged in, render children
  return children;
};

export default ProtectedRoute;
