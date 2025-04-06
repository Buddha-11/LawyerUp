import React, { useState } from 'react';
import { motion } from 'framer-motion';

function SignIn({ onGoogleLogin, onEmailSignIn, error, onSignUpClick }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, visibility: 'hidden' }}
      animate={{ opacity: 1, visibility: 'visible' }}
      exit={{ opacity: 0, visibility: 'hidden' }}
      transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.2 }}
      className="flex flex-col items-center justify-center min-h-screen w-full"
    >
      {/* Removed the bg-slate-50 background to allow particles to show through */}
      <div className="bg-white py-12 px-8 w-full sm:w-2/3 max-w-xl shadow-xl rounded-2xl border opacity-90 border-gray-100 hover:shadow-2xl transition-all duration-500">
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800 tracking-wide">Welcome Back</h2>
        <p className="text-center text-gray-500 mb-8">Sign in to continue to your account</p>
        
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-red-600 text-center font-medium">{error}</p>
          </div>
        )}
        
        <div className="text-left space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none shadow-sm transition-all duration-200"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-gray-700 text-sm font-medium">Password</label>
              <a href="#" className="text-sm text-teal-600 hover:text-teal-700 font-medium relative group">
                Forgot password?
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>
            <input
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none shadow-sm transition-all duration-200"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              placeholder="Enter your password"
            />
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <button
            onClick={() => onEmailSignIn(email, password)}
            className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
          >
            Sign In
          </button>
          
          <div className="relative flex items-center justify-center">
            <hr className="w-full border-gray-200" />
            <p className="absolute bg-white px-2 text-gray-500 text-sm">OR</p>
          </div>
          
          <button
            onClick={onGoogleLogin}
            className="w-full bg-white text-gray-700 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-0.5 duration-200"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>
        </div>
        
        <p className="text-center text-gray-500 mt-8">
          Don't have an account?{' '}
          <span 
            onClick={onSignUpClick} 
            className="cursor-pointer text-teal-600 font-medium hover:text-teal-700 relative group"
          >
            Sign Up
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300"></span>
          </span>
        </p>
      </div>
    </motion.div>
  );
}

export default SignIn;