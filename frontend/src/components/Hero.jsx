import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const lawyerAnimation = "/lawyer-animation1.mp4";

function Hero() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#F5F8FA] min-h-[calc(100vh-4rem)] flex items-center justify-center relative overflow-hidden">
      {/* Background video - properly positioned */}
      <div className="absolute inset-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute right-0 top-0 h-full w-auto max-w-[60%] object-cover opacity-30 hidden md:block"
        >
          <source src={lawyerAnimation} type="video/mp4" />
        </video>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <span className="inline-block text-teal-600 font-semibold text-sm uppercase tracking-widest mb-4 bg-teal-50 px-3 py-1 rounded-full">
              AI-Powered Legal Help
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
          >
            Smart Legal Help,
            <br />
            <span className="text-teal-600">Right at Your</span> Fingertips.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="mt-6 text-gray-500 text-lg leading-relaxed max-w-xl"
          >
            Empowering individuals with AI-driven legal analysis, seamless chatbot support, and expert legal guidance — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <input
              type="email"
              placeholder="Your email address"
              className="px-4 py-3 border border-gray-300 rounded-lg w-full sm:w-72 text-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none bg-white shadow-sm"
            />
            <button
              onClick={() => navigate("/auth")}
              className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-sm font-medium whitespace-nowrap"
            >
              Get Started <span>→</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center gap-6 text-sm text-gray-500"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M10 3L5 8L2 5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M10 3L5 8L2 5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Free to get started
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M10 3L5 8L2 5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Secure &amp; encrypted
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
