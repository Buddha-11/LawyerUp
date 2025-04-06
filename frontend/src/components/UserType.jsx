import React from 'react';
import UserIcon from '/user.svg';
import LawyerIcon from '/lawyer.svg';

function UserType({ onUserTypeSelected, onSignInClick }) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen">
      {/* Removed the bg-slate-50 from this div to allow particles to show through */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full sm:w-2/3 max-w-4xl py-16 px-8 rounded-2xl shadow-xl bg-white border border-gray-100 hover:shadow-2xl transition-all duration-500 opacity-90">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-800 tracking-wide">Welcome! Join us as</h2>
       
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 w-full max-w-3xl px-4 md:px-8">
          <div className="flex flex-col items-center p-6 rounded-xl hover:bg-slate-50 transition-colors duration-300">
            <div className="bg-teal-50 p-6 rounded-full mb-6">
              <img
                src={LawyerIcon}
                alt="Lawyer Icon"
                className="h-20 w-20"
              />
            </div>
            <h3 className="text-xl font-medium mb-4 text-gray-700">Professional</h3>
            <button
              onClick={() => onUserTypeSelected('lawyer')}
              className="px-8 py-3 bg-teal-600 text-white rounded-lg w-full md:w-56 hover:bg-teal-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Join as Lawyer
            </button>
          </div>
         
          <div className="flex flex-col items-center p-6 rounded-xl hover:bg-slate-50 transition-colors duration-300">
            <div className="bg-teal-50 p-6 rounded-full mb-6">
              <img
                src={UserIcon}
                alt="User Icon"
                className="h-20 w-20"
              />
            </div>
            <h3 className="text-xl font-medium mb-4 text-gray-700">Client</h3>
            <button
              onClick={() => onUserTypeSelected('user')}
              className="px-8 py-3 bg-teal-600 text-white rounded-lg w-full md:w-56 hover:bg-teal-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              Join as User
            </button>
          </div>
        </div>
       
        <p className="mt-12 text-center text-gray-600">
          Already have an account?{' '}
          <span
            onClick={onSignInClick}
            className="text-teal-600 cursor-pointer font-medium hover:text-teal-700 transition-colors relative group"
          >
            Sign in instead
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300"></span>
          </span>
        </p>
      </div>
    </div>
  );
}

export default UserType;