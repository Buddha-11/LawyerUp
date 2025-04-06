import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useFirebase } from "../context/firebase";
import ProfileMenu from "./ProfileMenu";

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { currentUser, signOutUser } = useFirebase(); // ✅ Use inside the component

  const handleLogout = async () => {
    try {
      await signOutUser(); // ✅ Calling from context
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="w-full h-20 bg-slate-100 mt-2">
        <div className="flex justify-between items-center h-full px-4">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/logo.png" className="h-40 w-auto" alt="Logo" />
          </div>
          {/* Center Links */}
          <div className="hidden lg:flex space-x-10 text-lg font-semibold">
            <a href="/" className="text-gray-700 hover:text-gray-900 relative group">
              Services
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="search-lawyers" className="text-gray-700 hover:text-gray-900 relative group">
              Search
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="chat" className="text-gray-700 hover:text-gray-900 relative group">
              AI Assistant
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="doc" className="text-gray-700 hover:text-gray-900 relative group">
              AI Doc Analyser
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>
          {/* Right Side */}
          <div className="hidden lg:flex space-x-4 items-center">
            {currentUser ? (
              <>
                {/* <span className="text-gray-700 font-medium">
                  Hey, {currentUser.displayName || currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 border border-gray-500 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button> */}
                  <div className="flex items-center gap-4">
          <ProfileMenu />
          </div>
              </>
            ) : (
              <>
                <button className="px-5 py-2 border border-gray-500 rounded-lg text-gray-700 hover:bg-gray-100">
                  Login
                </button>
                <button className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                  Sign Up
                </button>
              </>
            )}
          </div>
          {/* Mobile Menu Button */}
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden">
            <Menu size={28} />
          </button>
        </div>
      </nav>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-72 h-screen bg-white shadow-lg transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center border-b p-4">
          <img src="/logo.png" className="h-20 w-auto" alt="Sidebar Logo" />
          <button onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
        </div>
        <nav className="flex flex-col space-y-4 p-6 text-lg">
          <a href="#" className="text-gray-700 hover:text-gray-900 relative group">
            Services
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a href="search-lawyers" className="text-gray-700 hover:text-gray-900 relative group">
            Search
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a href="chat" className="text-gray-700 hover:text-gray-900 relative group">
            AI Assistant
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a href="doc" className="text-gray-700 hover:text-gray-900 relative group">
            AI Doc Analyser
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 group-hover:w-full transition-all duration-300"></span>
          </a>
          {currentUser ? (
            <>
              {/* <span className="text-gray-700 font-medium">
                Hi, {currentUser.displayName || currentUser.email}
              </span>
              <button
                className="w-full py-2 border border-gray-500 rounded-lg text-gray-700 hover:bg-gray-100"
                onClick={handleLogout}
              >
                Logout
              </button> */}

          <div className="flex items-center gap-4">
          <ProfileMenu />
          </div>
            </>
          ) : (
            <>
              <button className="w-full py-2 border border-gray-500 rounded-lg text-gray-700 hover:bg-gray-100">
                Login
              </button>
              <button className="w-full py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800">
                Sign Up
              </button>
            </>
          )}
        </nav>
      </div>
    </>
  );
};

export default Navbar;
