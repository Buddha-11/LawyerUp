import { createContext, useContext } from "react";
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    GoogleAuthProvider, 
    signInWithPopup 
} from "firebase/auth";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "firebase/storage";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MSG_SEND_ID,
    appId: import.meta.env.VITE_APP_ID
};

// Initialize Firebase services
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(firebaseApp);

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

    // Upload profile image to Firestore Storage and return download URL
    const uploadProfileImage = async (userId, file) => {
        if (!file) return null;
        
        try {
            const storageRef = ref(storage, `profileImages/${userId}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            return downloadURL;
        } catch (error) {
            console.error("Error uploading profile image:", error);
            throw error;
        }
    };

    return (
        <FirebaseContext.Provider value={{ signupEmail, signInWithGoogle, signinEmail, uploadProfileImage }}>
            {children}
        </FirebaseContext.Provider>
    );
};
