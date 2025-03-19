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
      className="relative flex flex-col items-center justify-center min-h-screen"
    >
      
      
      <div className="relative z-10 flex flex-col items-center justify-center w-full sm:w-2/3 bg-gray-300 py-12 px-4 shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">Welcome</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <input 
          className="w-full md:w-3/4 p-3 mb-4 border border-gray-500 rounded-md"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email" 
          placeholder="Enter your email"
        />
        
        <input 
          className="w-full md:w-3/4 p-3 mb-4 border border-gray-500 rounded-md"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password" 
          placeholder="Enter your password"
        />
        
        <button 
          onClick={() => onEmailSignUp(email, password)} 
          className="w-full md:w-3/4 bg-teal-600 text-white py-3 rounded-md hover:bg-teal-700 mt-4"
        >
          Sign Up
        </button>
        
        <button 
          onClick={onGoogleLogin} 
          className="w-full md:w-3/4 bg-red-500 text-white py-3 rounded-md mt-4 hover:bg-red-600"
        >
          Sign up with Google
        </button>
      </div>
    </motion.div>
  );
}

export default SignUp;
