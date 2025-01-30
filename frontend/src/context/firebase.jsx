import { createContext ,useContext } from "react";
import {initializeApp} from "firebase/app"
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    GoogleAuthProvider, 
    signInWithPopup 
} from "firebase/auth"; // Should log your API key

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MSG_SEND_ID,
    appId: import.meta.VITE_APP_ID
  };
  
  
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();
const FirebaseContext = createContext(null);
export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = (props) => {
    const signinEmail =(email,password) =>{
        return signInWithEmailAndPassword(firebaseAuth,email,password)
    }
    const signupEmail = (email,password) =>{
        return createUserWithEmailAndPassword(firebaseAuth,email, password)
    }
    const signInWithGoogle = () => {
        return signInWithPopup(firebaseAuth, googleProvider);
    };
    return (
        <FirebaseContext.Provider value={{signupEmail , signInWithGoogle , signinEmail}} >
            {props.children}
        </FirebaseContext.Provider>
    )
}