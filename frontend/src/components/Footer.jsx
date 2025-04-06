import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FaTwitter, FaLinkedin, FaFacebook , FaInstagram } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const Footer = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  const fadeInVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };
  const navigate = useNavigate(); 

  const handledoc = () => {
    navigate("/doc"); 
  };
  const handleChat = () => {
    navigate("/chat"); 
  }
  const handleSearch = () => {
    navigate("/search-lawyers"); 
  }
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
          <div className="flex gap-4">
            <a href="https://x.com/LawyerUp_X" target="_blank" rel="noopener noreferrer">
              <FaTwitter className="cursor-pointer hover:text-[#1DA1F2]" />
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
              <FaLinkedin className="cursor-pointer hover:text-[#0077B5]" />
            </a>
            <a href="https://www.instagram.com/lawyerup_01/" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="cursor-pointer hover:text-[#E1306C]" />
            </a>
          </div>
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
            <li onClick={handledoc}>Legal Document Analysis</li>
            <li onClick={handleChat}>Chatbot for Legal Queries</li>
            <li onClick={handleSearch}>Lawyer Match Making</li>
            <li>Legal Templates</li>
          </ul>
        </motion.div>

        {/* Company Section */}
        <motion.div variants={fadeInVariants}>
          <h3 className="text-lg font-semibold mb-2">Company</h3>
          <ul className="space-y-1 text-gray-600">
            <li>About Us</li>
            <li>Career</li>
            <li>
              <a
                href="mailto:contactus.lawyerup@gmail.com"
                className="hover:underline "
              >
                Contact Us
              </a>
            </li>
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
