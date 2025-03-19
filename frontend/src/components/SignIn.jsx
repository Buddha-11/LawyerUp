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
      className="flex flex-col items-center justify-center min-h-screen "
    >
      <div className="bg-gray-300 py-12 px-6 w-full sm:w-2/3 lg:w-1/2 shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">Welcome Back</h2>
        
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        
        <input 
          className="w-full p-3 mb-4 border border-gray-300 rounded-md"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email" 
          placeholder="Enter your email"
        />
        <input 
          className="w-full p-3 mb-4 border border-gray-300 rounded-md"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password" 
          placeholder="Enter your password"
        />
        <button 
          onClick={() => onEmailSignIn(email, password)} 
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700"
        >
          Sign In
        </button>
        <button 
          onClick={onGoogleLogin} 
          className="w-full bg-red-500 text-white py-3 rounded-md mt-4 hover:bg-red-600"
        >
          Sign in with Google
        </button>
      </div>
    </motion.div>
  );
}

export default SignIn;
