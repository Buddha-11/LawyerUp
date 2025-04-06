import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
function CTASection() {
  const navigate = useNavigate(); 

  const handleGetStarted = () => {
    navigate("/auth"); 
  };
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      className="bg-[#02243A] text-white flex items-center justify-between py-20 px-14  w-full max-w-7xl mx-auto mt-25"
    >
      {/* Left Side - Text Content */}
      <div className="max-w-2xl text-left">
        {/* Small Heading */}
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
          }}
          className="text-sm uppercase tracking-wide text-gray-300"
        >
          Try it now
        </motion.p>

        {/* Main Heading */}
        <motion.h2
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.2 } },
          }}
          className="text-5xl font-medium mt-3 leading-tight"
        >
          Ready to simplify your <br />legal journey?
        </motion.h2>

        {/* Description */}
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.4 } },
          }}
          className="text-gray-300 text-lg mt-5 leading-relaxed"
        >
          Empower yourself with AI-driven legal document analysis, instant explanations, and a smart chatbot—your one-stop solution for legal advice.
        </motion.p>
      </div>

      {/* Right Side - Buttons */}
      <div className="flex flex-col md:flex-row gap-5">
        <motion.button
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.6 } },
          }}
          className="bg-[#008080] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#006666] transition"
          onClick={handleGetStarted}
        >
          Get Started Now
        </motion.button>
        <motion.button
  variants={{
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.8 } },
  }}
  className="border border-white text-white px-8 py-4 rounded-lg text-lg font-semibold 
             hover:bg-white hover:text-[#003366] transition flex items-center gap-2"
>
  Learn More <span className="text-inherit bg-[#02243A]">↗</span>
</motion.button>

      </div>
    </motion.div>
  );
}

export default CTASection;

