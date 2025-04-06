import React, { useState, useEffect } from 'react';
import { useFirebase } from '../context/firebase';
import { useNavigate } from 'react-router-dom';
import UserType from '../components/UserType';
import SignIn from '../components/SignIn';
import SignUp from '../components/SignUp';
import ProfileSetup from '../components/ProfileSetup';
import LawyerProfileSetup from '../components/LawyerProfileSetup';
import Particles from '../components/Particle';

function Auth() {
  const { signInWithGoogle, signupEmail, signinEmail } = useFirebase();
  const [authStep, setAuthStep] = useState("userType");
  const [userType, setUserType] = useState("user");
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [signin, setSignin] = useState("no");
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      setUser(result.user);
      setSignin("pending"); // Delay redirection
    } catch (error) {
      console.error("Google sign-up error:", error);
      setError(error.message);
    }
  };
  const handleGoogleSigin = async () => {
    try {
      const result = await signInWithGoogle();
      setUser(result.user);
      setSignin("done"); // Delay redirection
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError(error.message);
    }
  };
  
  const handleSignup = async (email, password) => {
    try {
      const result = await signupEmail(email, password);
      setUser(result.user);
      setSignin("pending"); // Delay redirection
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message);
    }
  };
  
  const handleSignin = async (email, password) => {
    try {
      console.log(signin);
      setSignin("done");
      const result = await signinEmail(email, password);
      setUser(result.user);
      setSignin("done"); // Delay redirection
    } catch (error) {
      console.error("Signin error:", error);
      setError(error.message);
    }
  };
  const renderSignup = () => {
    setAuthStep("signup");
  }
  useEffect(() => {
    console.log(authStep);
    
    if(signin ==="done")
        navigate("/");
    
    if (user && signin === "yes") {
      if (userType === "lawyer" && !user.profileCompleted) {
        return;
      }
      navigate("/");
    }
  }, [signin, user, navigate, userType,authStep]);

  if (user && signin === "pending") {
    return userType === "lawyer" ? (
      <LawyerProfileSetup user={user} onComplete={() => navigate("/")} />
    ) : (
      <ProfileSetup user={user} onComplete={() => navigate("/")} />
    );
  }
  

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="absolute inset-0 z-0">
        <Particles 
          particleColors={["#14b8a6", "#0d9488", "#0f766e", "#115e59", "#134e4a"]} 
          particleCount={250} 
        />
      </div>
      <div className="relative z-10 w-full">
        {authStep === "userType" && <UserType onUserTypeSelected={(type) => { setUserType(type); setAuthStep("signup"); }} onSignInClick={() => setAuthStep("signin")} />}
        {authStep === "signin" && <SignIn onGoogleLogin={handleGoogleSigin} onEmailSignIn={handleSignin} error={error} onSignUpClick={() => setAuthStep("userType")}/>}
        {authStep === "signup" && <SignUp userType={userType} onGoogleLogin={handleGoogleLogin} onEmailSignUp={handleSignup} error={error} onSignInClick={() => setAuthStep("signin")}/>}
      </div>
    </div>
  );
}

export default Auth;
