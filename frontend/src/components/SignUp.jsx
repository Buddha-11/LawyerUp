import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Particles from './Particle';

function SignUp({ userType, onGoogleLogin, onEmailSignUp, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0, visibility: 'hidden' }} 
      animate={{ opacity: 1, visibility: 'visible' }} 
      exit={{ opacity: 0, visibility: 'hidden' }} 
      transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.2 }}
      className="relative flex flex-col items-center justify-start min-h-screen pt-20"
    >
      <div className="relative z-10 flex flex-col items-center justify-center w-full sm:w-2/3 lg:w-1/3 bg-white py-14 px-12 shadow-2xl rounded-3xl border border-gray-200 hover:shadow-3xl transition-shadow duration-300">
        <h2 className="text-4xl font-semibold mb-2 text-center text-black tracking-wide whitespace-nowrap">Create Your Account</h2>
        <p className="text-center text-gray-500 mb-8">Sign up to get started</p>

        {error && <p className="text-red-500 mb-4 text-center font-medium">{error}</p>}

        <div className="text-left w-full">
          <label className="block text-black text-sm mb-2">Email</label>
          <input 
            className="w-full p-4 mb-4 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-600 focus:outline-none shadow-sm"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email" 
            placeholder="you@example.com"
          />

          <label className="block text-black text-sm mb-2">Password</label>
          <input 
            className="w-full p-4 mb-6 border border-gray-300 rounded-lg focus:ring-4 focus:ring-teal-600 focus:outline-none shadow-sm"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type="password" 
            placeholder="Enter your password"
          />
        </div>

        <button 
          onClick={() => onEmailSignUp(email, password)} 
          className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-all font-semibold shadow-lg hover:shadow-xl"
        >
          Sign Up
        </button>

        <button 
          onClick={onGoogleLogin} 
          className="w-full bg-teal-600 text-white py-3 rounded-lg mt-4 hover:bg-teal-700 transition-all font-semibold shadow-lg hover:shadow-xl"
        >
          Sign up with Google
        </button>

        <p className="text-center text-gray-500 mt-6">Already have an account? <span className="cursor-pointer text-teal-600 hover:underline">Sign In</span></p>
      </div>
    </motion.div>
  );
}

export default SignUp;