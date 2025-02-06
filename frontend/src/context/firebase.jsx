import { createContext, useContext } from "react";
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    GoogleAuthProvider, 
    signInWithPopup 
} from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MSG_SEND_ID,
    appId: import.meta.env.VITE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();
const FirebaseContext = createContext(null);
export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = ({ children }) => {
    
    const saveToken = (user) => {
        user.getIdToken().then((token) => {
            localStorage.setItem("authToken", token);
        }).catch((error) => {
            console.error("Error saving token:", error);
        });
    };

    const signinEmail = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
            saveToken(userCredential.user);
            return userCredential;
        } catch (error) {
            console.error("Sign-in error:", error);
            throw error;
        }
    };

    const signupEmail = async (email, password) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
            saveToken(userCredential.user);
            return userCredential;
        } catch (error) {
            console.error("Sign-up error:", error);
            throw error;
        }
    };

    const signInWithGoogle = async () => {
        try {
            const userCredential = await signInWithPopup(firebaseAuth, googleProvider);
            saveToken(userCredential.user);
            return userCredential;
        } catch (error) {
            console.error("Google sign-in error:", error);
            throw error;
        }
    };

    return (
        <FirebaseContext.Provider value={{ signupEmail, signInWithGoogle, signinEmail }}>
            {children}
        </FirebaseContext.Provider>
    );
};
