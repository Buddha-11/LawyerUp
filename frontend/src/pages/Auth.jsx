import { useState } from 'react';
import { useFirebase } from '../context/firebase';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { motion } from 'framer-motion';
import ProfileSetup from '../component/ProfileSetup';
import LawyerProfileSetup from "../component/LawyerProfileSetup";
function Auth() {
  const { signInWithGoogle, signupEmail, signinEmail } = useFirebase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignIn, setIsSignIn] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState("user"); // Default user type
  const navigate = useNavigate();

  const handleProfileComplete = () => {
    navigate("/"); // Redirect to home after profile completion
  };

  const syncUserWithBackend = async (user) => {
    try {
      await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseId: user.uid,
          name: user.displayName || "User", // Default name for email signups
          email: user.email,
          photoURL: user.photoURL || undefined,
          type: userType, // Include selected user type
        }),
      });
      console.log("User synced with backend:", user);
    } catch (error) {
      console.error("Backend sync error:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      await syncUserWithBackend(user);
      setUser(result.user);
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError(error.message);
    }
  };

  const handleSignup = async () => {
    try {
      const result = await signupEmail(email, password);
      const user = result.user;
      await syncUserWithBackend(user);
      setUser(result.user);
      setError(null);
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message);
    }
  };

  const handleSignin = async () => {
    try {
      const result = await signinEmail(email, password);
      setError(null);
    } catch (error) {
      console.error("Signin error:", error);
      setError(error.message);
    }
  };

  if (user) {
    console.log(userType);
    
    return userType === "lawyer" ? (
      <LawyerProfileSetup user={user} onComplete={handleProfileComplete} />
    ) : (
      <ProfileSetup user={user} onComplete={handleProfileComplete} />
    );
  }


  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 relative">
      {/* Sign In Form */}
      {isSignIn && (
        <motion.div 
          initial={{ opacity: 0, visibility: 'hidden' }} 
          animate={{ opacity: 1, visibility: 'visible' }} 
          exit={{ opacity: 0, visibility: 'hidden' }} 
          transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.2 }}
          className="absolute left-0 w-1/2 h-full bg-white flex flex-col items-center justify-center text-gray-800 p-10 shadow-lg rounded-lg z-10"
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
          <button onClick={handleSignin} className="w-3/4 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700">
            Sign In
          </button>
          <button onClick={handleGoogleLogin} className="w-3/4 bg-red-500 text-white py-3 rounded-md mt-4 hover:bg-red-600">
            Sign in with Google
          </button>
          <p className='py-3'>Don't have an account? <span className='text-blue-600 cursor-pointer' onClick={() => setIsSignIn(false)}>Sign up instead</span></p>
        </motion.div>
      )}

      {/* Sign Up Form */}
      {!isSignIn && (
        <motion.div 
          initial={{ opacity: 0, visibility: 'hidden' }} 
          animate={{ opacity: 1, visibility: 'visible' }} 
          exit={{ opacity: 0, visibility: 'hidden' }} 
          transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.2 }}
          className="absolute right-0 w-1/2 h-full bg-white flex flex-col items-center justify-center text-gray-800 p-10 shadow-lg rounded-lg z-10"
        >
          <h2 className="text-3xl font-bold mb-6">Welcome</h2>
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

          {/* Lawyer Checkbox */}
          <div className="w-3/4 flex items-center mt-3">
            <input 
              type="checkbox" 
              id="lawyerCheckbox" 
              className="mr-2"
              checked={userType === "lawyer"}
              onChange={(e) => setUserType(e.target.checked ? "lawyer" : "user")}
            />
            <label htmlFor="lawyerCheckbox" className="text-gray-600">Are you a lawyer?</label>
          </div>

          <button onClick={handleSignup} className="w-3/4 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 mt-4">
            Sign Up
          </button>
          <button onClick={handleGoogleLogin} className="w-3/4 bg-red-500 text-white py-3 rounded-md mt-4 hover:bg-red-600">
            Sign up with Google
          </button>
          <p className='py-3'>Already have an account? <span className='text-blue-600 cursor-pointer' onClick={() => setIsSignIn(true)}>Sign in instead</span></p>
        </motion.div>
      )}
    </div>
  );
}

export default Auth;
