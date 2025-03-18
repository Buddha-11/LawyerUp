import React from 'react';
import LawyerIcon from '../images/lawyer.svg';
import UserIcon from '../images/user.svg';

function UserType({ onUserTypeSelected, onSignInClick }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col items-center justify-center w-full sm:w-2/3 bg-gray-300 py-12 px-4 shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold mb-14 text-center">Welcome! Join us as</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 w-full max-w-3xl px-4 md:px-8">
          <div className="flex flex-col items-center">
            <img
              src={LawyerIcon}
              alt="Lawyer Icon"
              className="h-24 w-24 mb-6"
            />
            <button 
              onClick={() => onUserTypeSelected("lawyer")}
              className="px-6 py-3 bg-teal-600 border border-gray-500 rounded-md w-full md:w-48 text-white hover:bg-teal-700"
            >
              Lawyer
            </button>
          </div>

          <div className="flex flex-col items-center">
            <img
              src={UserIcon}
              alt="User Icon"
              className="h-24 w-24 mb-6"
            />
            <button 
              onClick={() => onUserTypeSelected("user")}
              className="px-6 py-3 bg-teal-600 border border-gray-500 rounded-md w-full md:w-48 text-white hover:bg-teal-700"
            >
              User
            </button>
          </div>
        </div>
        
        <p className="mt-8 text-center">
          Already have an account?{" "}
          <span 
            onClick={onSignInClick} 
            className="text-teal-600 cursor-pointer"
          >
            Sign in instead
          </span>
        </p>
      </div>
    </div>
  );
}

export default UserType;
