import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Navbar */}
      <nav className="w-full h-20 bg-slate-100 mt-2">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/logo.png" className="h-40 w-auto" alt="Logo" />
          </div>

          {/* Center Links (Hidden on Mobile) */}
          <div className="hidden lg:flex space-x-10 text-lg font-semibold">
            <a href="#" className="text-gray-700 hover:text-gray-900">Products</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Customers</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Pricing</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Learn</a>
          </div>

          {/* Right Buttons */}
          <div className="hidden lg:flex space-x-4">
            <button className="px-5 py-2 border border-gray-500 rounded-lg text-gray-700 hover:bg-gray-100">
              Login
            </button>
            <button className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
              Sign Up
            </button>
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
        <div className="flex justify-between items-center  border-b">
          <img src="/logo.png" className="h-36 w-auto ml-16" alt="Sidebar Logo" />
        
        </div>
        <nav className="flex flex-col space-y-4 p-6 text-lg">
          <a href="#" className="text-gray-700 hover:text-gray-900">Products</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">Customers</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">Pricing</a>
          <a href="#" className="text-gray-700 hover:text-gray-900">Learn</a>
          <button className="w-full py-2 border border-gray-500 rounded-lg text-gray-700 hover:bg-gray-100">
            Login
          </button>
          <button className="w-full py-2 bg-teal-700 text-white rounded-lg hover:bg-800">
            Sign Up
          </button>
        </nav>
      </div>
    </>
  );
};

export default Navbar;
