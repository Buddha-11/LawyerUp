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
        className="w-12 h-12 rounded-full overflow-hidden border-3 border-teal-100 shadow-md"
      >
        {userData?.photoURL ? (
          <img
            src={userData.photoURL}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <FaUserCircle className="w-full h-full text-green-600 bg-wheat" />
        )}
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-100 shadow-xl rounded-xl z-50 border border-green-300">
          <div className="p-4 border-b border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-3 border-teal-600">
                {userData?.photoURL ? (
                  <img
                    src={userData.photoURL}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="w-full h-full text-green-600" />
                )}
              </div>
              <div>
                <p className="text-lg font-semibold text-teal-600">
                  {userData?.name || "Loading..."}
                </p>
                <p className="text-md text-teal-600 mr-2">{userEmail || "..."}</p>
              </div>
            </div>
          </div>

          {/* 👤 Profile Button */}
          <button
            onClick={() => navigate("/user")}
            className="w-full text-left px-4 py-2 flex items-center gap-2 text-teal-800 hover:bg-green-100 transition-all border-t border-green-200"
          >
            <FaUserCircle /> Profile
          </button>

          {/* 🔌 Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 flex items-center gap-2 text-teal-800 hover:bg-green-100 transition-all border-t border-green-200"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;
