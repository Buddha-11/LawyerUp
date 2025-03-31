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
  const [authStep, setAuthStep] = useState("userType"); // "userType", "signup", or "signin"
  const [userType, setUserType] = useState("user"); // default user type
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [signin, setSignin] = useState("no"); // Tracks if user is signing in
  const navigate = useNavigate();

  // Function to sync the user with your MongoDB backend
  const syncUserWithBackend = async (user) => {
    try {
      await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebaseId: user.uid,
          name: user.displayName || "User",
          email: user.email,
          photoURL: user.photoURL || undefined,
          type: userType,
        }),
      });
      console.log("User synced with backend:", user);
    } catch (error) {
      console.error("Backend sync error:", error);
    }
  };

  // Google login handler (for both signup and signin)
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      const currentUser = result.user;
      await syncUserWithBackend(currentUser);
      setUser(currentUser);
      setSignin("yes"); // Mark as signed in
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError(error.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithGoogle();
      const currentUser = result.user;
      await syncUserWithBackend(currentUser);
      setUser(currentUser);
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError(error.message);
    }
  };

  // Email signup handler
  const handleSignup = async (email, password) => {
    try {
      const result = await signupEmail(email, password);
      const currentUser = result.user;
      await syncUserWithBackend(currentUser);
      setUser(currentUser);
      setError(null);
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message);
    }
  };

  // Email signin handler
  const handleSignin = async (email, password) => {
    try {
      const result = await signinEmail(email, password);
      setSignin("yes"); // Mark as signed in
      setUser(result.user);
      setError(null);
    } catch (error) {
      console.error("Signin error:", error);
      setError(error.message);
    }
  };

  // Profile completion handler
  const handleProfileComplete = () => {
    navigate("/"); // Redirect to home after profile completion
  };

  // Effect to handle navigation after sign-in
  useEffect(() => {
    if (signin === "yes") {
      navigate("/"); // Redirect to home after sign-in
    }
  }, [signin, navigate]);

  // Render the profile setup page if the user is authenticated and sign-up flow is followed
  if (user && signin === "no") {
    return userType === "lawyer" ? (
      <div className="relative flex flex-col items-center justify-center min-h-screen">
        <div className="absolute inset-0 z-0">
          <Particles
            particleColors={['#000000', '#000000']}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover={false}
            alphaParticles={false}
            disableRotation={false}
          />
        </div>

        <div className="relative z-10 w-full">
          <LawyerProfileSetup user={user} onComplete={handleProfileComplete} />
        </div>
      </div>
    ) : (
      <div className="relative flex flex-col items-center justify-center min-h-screen">
        <div className="absolute inset-0 z-0">
          <Particles
            particleColors={['#000000', '#000000']}
            particleCount={200}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover={false}
            alphaParticles={false}
            disableRotation={false}
          />
        </div>

        <div className="relative z-10 w-full">
          <ProfileSetup user={user} onComplete={handleProfileComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen">
      {/* Keep the particles component outside of the conditional rendering */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={['#000000', '#000000']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={false}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      <div className="relative z-10 w-full">
        {/* Render the proper step based on authStep state */}
        {authStep === "userType" && (
          <UserType 
            onUserTypeSelected={(selectedType) => {
              setUserType(selectedType);
              setAuthStep("signup");
            }}
            onSignInClick={() => setAuthStep("signin")}
          />
        )}
        {authStep === "signin" && (
          <SignIn 
            onGoogleLogin={handleGoogleLogin}
            onEmailSignIn={handleSignin}
            error={error}
          />
        )}
        {authStep === "signup" && (
          <SignUp 
            userType={userType}
            onGoogleLogin={handleGoogleSignup}
            onEmailSignUp={handleSignup}
            error={error}
          />
        )}
      </div>
    </div>
  );
}

export default Auth;
