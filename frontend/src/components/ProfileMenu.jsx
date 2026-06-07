import { useEffect, useState, useRef } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { FiLogOut } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ProfileMenu = () => {
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const menuRef = useRef();
  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          }
        } catch (err) {
          console.error("Failed to fetch user data", err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!menuRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/auth");
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full overflow-hidden border-2 border-teal-200 shadow-sm hover:border-teal-400 transition-all"
      >
        {userData?.photoURL ? (
          <img src={userData.photoURL} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-teal-50 flex items-center justify-center">
            <FaUserCircle className="text-teal-500 w-full h-full" />
          </div>
        )}
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-white shadow-xl rounded-xl z-50 border border-gray-100 overflow-hidden">
          {/* User info */}
          <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                {userData?.photoURL ? (
                  <img src={userData.photoURL} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-teal-100 flex items-center justify-center">
                    <FaUserCircle className="text-teal-500 w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {userData?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">{userEmail || "..."}</p>
              </div>
            </div>
          </div>

          {/* Profile Button */}
          <button
            onClick={() => { navigate("/user"); setOpen(false); }}
            className="w-full text-left px-4 py-3 flex items-center gap-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FaUserCircle className="text-teal-500" />
            View Profile
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 flex items-center gap-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors border-t border-gray-100"
          >
            <FiLogOut className="text-gray-400" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
