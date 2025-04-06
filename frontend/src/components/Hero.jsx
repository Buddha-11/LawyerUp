import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; 

const lawyerAnimation = "/lawyer-animation1.mp4";

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (delay) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut", delay },
  }),
};

function Hero() {
  const navigate = useNavigate(); 

  const handleGetStarted = () => {
    navigate("/auth"); 
  };

  return (
    <div className="bg-[#F5F8FA] min-h-screen flex items-center justify-center relative">
      <div className="absolute inset-0 flex items-center justify-center opacity-50">
        <video
          autoPlay
          loop
          muted
          className="w-full h-full object-cover ml-[800px]"
        >
          <source src={lawyerAnimation} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="w-full flex flex-col md:flex-row items-center justify-between mr-4 relative z-10">
        {/* Left Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={sectionVariants}
          className="max-w-lg ml-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Smart Legal Help,<br /> Right at Your Fingertips.
          </h1>
          <p className="mt-4 text-gray-600 text-lg">
            Empowering individuals with AI-driven legal analysis, seamless chatbot support, and expert legal guidance—all in one place.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="px-4 py-3 border border-gray-300 rounded-md w-64 text-gray-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <button
              onClick={handleGetStarted}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-md flex items-center"
            >
              Get Started <span className="ml-2">→</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Hero;
