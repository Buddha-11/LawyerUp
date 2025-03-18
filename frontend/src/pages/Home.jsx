import React from 'react';
import { useAuthState } from "react-firebase-hooks/auth";
import  firebaseAuth  from "../context/firebase"; // Ensure the auth import is correctly linked

export default function Home() {
  const [user] = useAuthState(firebaseAuth);

  return (
    <div className='Home'>
      {user ? (
        <h1>Welcome, {user.displayName || "User"}!</h1> 
      ) : (
        <h1>Welcome to the Home Page!</h1>
      )}
    </div>
  );
}
