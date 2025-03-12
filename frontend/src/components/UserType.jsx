import React from 'react';

function UserType({ onUserTypeSelected, onSignInClick }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-3xl font-bold mb-6">Welcome! Are you a lawyer?</h2>
      <div className="flex space-x-4">
        <button 
          onClick={() => onUserTypeSelected("lawyer")}
          className="px-6 py-3 bg-blue-600 text-white rounded-md"
        >
          Yes, I'm a Lawyer
        </button>
        <button 
          onClick={() => onUserTypeSelected("user")}
          className="px-6 py-3 bg-green-600 text-white rounded-md"
        >
          No, I'm a User
        </button>
      </div>
      <p className="mt-6">
        Already have an account?{" "}
        <span 
          onClick={onSignInClick} 
          className="text-blue-600 cursor-pointer"
        >
          Sign in instead
        </span>
      </p>
    </div>
  );
}

export default UserType;
