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
      className="flex flex-col items-center justify-center min-h-screen bg-white p-10 shadow-lg rounded-lg"
    >
      <h2 className="text-3xl font-bold mb-6">Welcome Back</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <input 
        className="w-3/4 p-3 mb-4 border border-gray-300 rounded-md"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        type="email" 
        placeholder="Enter your email"
      />
      <input 
        className="w-3/4 p-3 mb-4 border border-gray-300 rounded-md"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        type="password" 
        placeholder="Enter your password"
      />
      <button 
        onClick={() => onEmailSignIn(email, password)} 
        className="w-3/4 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700"
      >
        Sign In
      </button>
      <button 
        onClick={onGoogleLogin} 
        className="w-3/4 bg-red-500 text-white py-3 rounded-md mt-4 hover:bg-red-600"
      >
        Sign in with Google
      </button>
    </motion.div>
  );
}

export default SignIn;
