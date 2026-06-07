import React from "react";
import { motion } from "framer-motion";
import { FiRepeat, FiShield } from "react-icons/fi";
import { HiOutlineBanknotes } from "react-icons/hi2";

const features = [
  {
    icon: <FiRepeat className="text-teal-600 text-3xl" />,
    title: "Effortless Document Analysis",
    description: "Upload legal documents and let AI simplify complex jargon with clear, concise insights.",
  },
  {
    icon: <HiOutlineBanknotes className="text-teal-600 text-3xl" />,
    title: "Smart Legal Chatbot",
    description: "Ask questions and get instant, reliable legal answers without the confusion.",
  },
  {
    icon: <FiShield className="text-teal-600 text-3xl" />,
    title: "Unmatched Security",
    description: "Protect your sensitive legal data with industry-leading security and encryption.",
  },
];

const FeaturesSection = () => {
  return (
    <div className="bg-[#F5F9FC] py-12 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 sm:px-10 md:px-14 py-10 md:py-14 max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="text-center md:text-left mb-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: false }}
            className="text-teal-600 font-semibold text-xs uppercase tracking-widest"
          >
            Legal Made Simple
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: false }}
            className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight mt-2"
          >
            <span className="text-teal-800">Simplify </span>Legal Complexity.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: false }}
            className="text-gray-500 mt-3 text-base md:text-lg max-w-lg mx-auto md:mx-0"
          >
            Harness the power of AI to streamline legal processes and gain instant clarity on complex documents.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 md:gap-10">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.15 }}
              viewport={{ once: false, amount: 0.2 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-base md:text-lg text-gray-800">{feature.title}</h3>
              <p className="text-gray-500 mt-2 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default FeaturesSection;
