import { useState } from "react";
import { useNavigate, NavLink } from 'react-router-dom';
import { Menu, X, Scale } from "lucide-react";
import { useFirebase } from "../context/firebase";
import ProfileMenu from "./ProfileMenu";

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { currentUser, signOutUser } = useFirebase();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const navLinks = [
    { label: "Services", href: "/" },
    { label: "Find Lawyers", href: "/search-lawyers" },
    { label: "AI Assistant", href: "/chat" },
    { label: "Doc Analyser", href: "/doc" },
    { label: "Case Monitor", href: "/upload" },
    { label: "Legal Library", href: "/dict" },
  ];

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      {/* Navbar */}
      <nav className="w-full h-16 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center h-full px-4 lg:px-6">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <img src="/logo.png" className="h-12 w-auto" alt="LawyerUp Logo" />
          </div>

          {/* Center Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                end={link.href === "/"}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group ${
                    isActive
                      ? "text-teal-700 bg-teal-50"
                      : "text-gray-600 hover:text-teal-700 hover:bg-teal-50"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex space-x-3 items-center">
            {currentUser ? (
              <div className="flex items-center gap-3">
                {currentUser.isAnonymous && (
                  <>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Guest
                    </span>
                    <button
                      onClick={() => navigate("/auth")}
                      className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-sm"
                    >
                      Create Account
                    </button>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  Logout
                </button>
                {!currentUser.isAnonymous && <ProfileMenu />}
              </div>
            ) : (
              <>
                <button
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
                  onClick={() => navigate("/auth")}
                >
                  Login
                </button>
                <button
                  className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-sm"
                  onClick={() => navigate("/auth")}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} className="text-gray-700" />
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 lg:hidden ${
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      />

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 w-72 h-screen bg-white shadow-2xl z-50 transform transition-transform duration-300 lg:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center border-b border-gray-100 p-4">
          <img src="/logo.png" className="h-10 w-auto" alt="LawyerUp Logo" />
          <button
            onClick={closeSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <nav className="flex flex-col p-4 gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href === "/"}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "text-teal-700 bg-teal-50"
                    : "text-gray-700 hover:text-teal-700 hover:bg-teal-50"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <div className="mt-4 pt-4 border-t border-gray-100">
            {currentUser ? (
              <div className="space-y-2">
                {currentUser.isAnonymous && (
                  <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs font-semibold text-amber-800 mb-1">You're browsing as Guest</p>
                    <p className="text-xs text-amber-600 mb-2">Create a free account to save your work.</p>
                    <button
                      onClick={() => { navigate("/auth"); closeSidebar(); }}
                      className="w-full py-2 text-xs bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all font-medium"
                    >
                      Create Account
                    </button>
                  </div>
                )}
                {!currentUser.isAnonymous && (
                  <div className="px-4">
                    <ProfileMenu />
                  </div>
                )}
                <button
                  onClick={() => { handleLogout(); closeSidebar(); }}
                  className="w-full py-3 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
                >
                  {currentUser.isAnonymous ? "Exit Guest Session" : "Logout"}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  className="w-full py-3 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
                  onClick={() => { navigate("/auth"); closeSidebar(); }}
                >
                  Login
                </button>
                <button
                  className="w-full py-3 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
                  onClick={() => { navigate("/auth"); closeSidebar(); }}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
