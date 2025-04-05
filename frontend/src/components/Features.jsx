import React from "react";
import { motion } from "framer-motion";
import { FiRepeat, FiShield } from "react-icons/fi"; // Icons
import { HiOutlineBanknotes } from "react-icons/hi2";

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: i * 0.5 }, // Sequential delay
  }),
};

const featureVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut", delay: 1.5 + i * 0.6 }, // Start after text animations
  }),
};

const FeaturesSection = () => {
  return (
    <div className="bg-[#F5F9FC] py-2 px-6">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: false, amount: 0.2 }}
        className="bg-white rounded-xl shadow-lg px-10 md:px-16 lg:px-20 py-12 max-w-6xl mx-auto"
      >
        {/* Header Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="text-center md:text-left"
        >
          {[
            <p key="tagline" className="text-teal-600 font-semibold text-sm uppercase">
              Legal Made Simple
            </p>,
            <h2 key="heading" className="text-4xl md:text-5xl font-semibold leading-tight mt-2 ">
              <span className="text-teal-800">Simplify </span>Legal Complexity.
            </h2>,
            <p key="description" className="text-gray-500 mt-4 text-lg max-w-lg">
              Harness the power of AI to streamline legal processes and gain instant clarity on complex documents.
            </p>,
          ].map((text, index) => (
            <motion.div key={index} custom={index} variants={textVariants}>
              {text}
            </motion.div>
          ))}
        </motion.div>

        {/* Features Section */}
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: false, amount: 0.2 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10 text-center"
        >
          {[
            {
              icon: <FiRepeat className="text-teal-600 text-5xl mb-4" />,
              title: "Effortless Document Analysis",
              description:
                "Upload legal documents and let AI simplify complex jargon with clear, concise insights.",
            },
            {
              icon: <HiOutlineBanknotes className="text-teal-600 text-5xl mb-4" />,
              title: "Smart Legal Chatbot",
              description:
                "Ask questions and get instant, reliable legal answers without the confusion.",
            },
            {
              icon: <FiShield className="text-teal-600 text-5xl mb-4" />,
              title: "Unmatched Security",
              description:
                "Protect your sensitive legal data with industry-leading security and encryption.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={featureVariants}
              className="flex flex-col items-center"
            >
              {feature.icon}
              <h3 className="font-medium text-xl">{feature.title}</h3>
              <p className="text-gray-500 mt-3 text-base">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FeaturesSection;
