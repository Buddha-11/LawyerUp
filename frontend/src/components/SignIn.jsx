import React, { useState } from 'react';
import { motion } from 'framer-motion';

function SignIn({ onGoogleLogin, onEmailSignIn, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0, visibility: 'hidden' }}
      animate={{ opacity: 1, visibility: 'visible' }} 
      exit={{ opacity: 0, visibility: 'hidden' }} 
      transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.2 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-white"
    >
      <div className="bg-white py-14 px-12 w-full sm:w-2/3 lg:w-1/3 shadow-2xl rounded-3xl border border-gray-200 hover:shadow-3xl transition-shadow duration-300">
        <h2 className="text-4xl font-semibold mb-2 text-center text-black tracking-wide">Welcome Back</h2>
        <p className="text-center text-gray-500 mb-8">Sign in to continue to your account</p>

        {error && <p className="text-red-500 mb-4 text-center font-medium">{error}</p>}

        <div className="text-left">
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
          onClick={() => onEmailSignIn(email, password)} 
          className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-all font-semibold shadow-lg hover:shadow-xl"
        >
          Sign In
        </button>

        <button 
          onClick={onGoogleLogin} 
          className="w-full bg-teal-600 text-white py-3 rounded-lg mt-4 hover:bg-teal-700 transition-all font-semibold shadow-lg hover:shadow-xl"
        >
          Sign in with Google
        </button>

        <p className="text-center text-gray-500 mt-6">Don't have an account? <span className="cursor-pointer text-teal-600 hover:underline">Sign Up</span></p>
      </div>
    </motion.div>
  );
}

export default SignIn;