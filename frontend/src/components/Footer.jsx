import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FaTwitter, FaLinkedin, FaFacebook } from "react-icons/fa";

const Footer = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  const fadeInVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <footer ref={ref} className="bg-[#F5F8FA] text-[#003366] py-12 px-8">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-left relative"
      >
        {/* Social Media Icons - Top Right */}
        <motion.div
          variants={fadeInVariants}
          className="absolute top-0 right-0 flex items-center space-x-4 text-[#003366] text-xl mt-2"
        >
          {/* <span className="text-lg font-semibold">Follow us on</span> */}
          <FaTwitter className="cursor-pointer hover:text-[#1DA1F2]" />
          <FaLinkedin className="cursor-pointer hover:text-[#0077B5]" />
          <FaFacebook className="cursor-pointer hover:text-[#1877F2]" />
        </motion.div>

        {/* Logo Section */}
        <motion.div variants={fadeInVariants}>
          {/* <h2 className="text-2xl font-bold">Finpay</h2> */}
          <img src="/logo.png" className="h-30 w-auto" alt="Logo" />
        </motion.div>

        {/* Solutions Section */}
        <motion.div variants={fadeInVariants}>
          <h3 className="text-lg font-semibold mb-2">Solutions</h3>
          <ul className="space-y-1 text-gray-600">
            <li>Legal Document Analysis</li>
            <li>Chatbot for Legal Queries</li>
            <li>Compliance Management</li>
            <li>Legal Templates</li>
          </ul>
        </motion.div>

        {/* Company Section */}
        <motion.div variants={fadeInVariants}>
          <h3 className="text-lg font-semibold mb-2">Company</h3>
          <ul className="space-y-1 text-gray-600">
            <li>About Us</li>
            <li>Career</li>
            <li>Contact</li>
          </ul>
        </motion.div>

        {/* Learn Section */}
        <motion.div variants={fadeInVariants}>
          <h3 className="text-lg font-semibold mb-2">Support</h3>
          <ul className="space-y-1 text-gray-600">
            <li>Help Center</li>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
            <li>Security</li>
          </ul>
        </motion.div>
      </motion.div>

      {/* Copyright Section - Centered */}
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={fadeInVariants}
        className="mt-8 text-center"
      >
        <p className="text-gray-500 text-sm">© LawyerUp 2025. All Rights Reserved.</p>
      </motion.div>
    </footer>
  );
};

export default Footer;
