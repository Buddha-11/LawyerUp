import React from 'react';
import UserIcon from '/user.svg';
import LawyerIcon from '/lawyer.svg';

function UserType({ onUserTypeSelected, onSignInClick }) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-teal-200/25">
      <div className="relative z-10 flex flex-col items-center justify-center w-full sm:w-2/3 py-12 px-4 rounded-3xl shadow-2xl border border-gray-200 hover:shadow-3xl transition-shadow duration-300">
        <h2 className="text-4xl font-semibold mb-4 text-center text-black tracking-wide">Welcome! Join us as</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 w-full max-w-3xl px-4 md:px-8">
          <div className="flex flex-col items-center">
            <img
              src={LawyerIcon}
              alt="Lawyer Icon"
              className="h-24 w-24 mb-6"
            />
            <button 
              onClick={() => onUserTypeSelected('lawyer')}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg w-full md:w-48 hover:bg-teal-700 transition-all font-semibold shadow-lg hover:shadow-xl"
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
              onClick={() => onUserTypeSelected('user')}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg w-full md:w-48 hover:bg-teal-700 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              User
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-gray-500">
          Already have an account?{' '}
          <span 
            onClick={onSignInClick} 
            className="text-teal-600 cursor-pointer hover:underline"
          >
            Sign in instead
          </span>
        </p>
      </div>
    </div>
  );
}

export default UserType;