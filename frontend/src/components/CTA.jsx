import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function CTASection() {
  const navigate = useNavigate();

  return (
    <div className="px-4 sm:px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.2 }}
        className="bg-[#02243A] text-white rounded-2xl overflow-hidden max-w-5xl mx-auto"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-8 sm:px-12 py-12 md:py-14">
          {/* Left Side */}
          <div className="max-w-xl text-center md:text-left">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">Try it now</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-snug">
              Ready to simplify your<br className="hidden sm:block" /> legal journey?
            </h2>
            <p className="text-gray-400 text-sm md:text-base mt-4 leading-relaxed">
              Empower yourself with AI-driven legal document analysis, instant explanations, and a smart chatbot — your one-stop solution.
            </p>
          </div>

          {/* Right Side - Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto flex-shrink-0">
            <button
              onClick={() => navigate("/auth")}
              className="bg-teal-500 hover:bg-teal-400 text-white px-8 py-3.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              Get Started Now
            </button>
            <button
              onClick={() => navigate("/")}
              className="border border-white/30 text-white px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              Learn More <span>↗</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default CTASection;
