import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });
  const navigate = useNavigate();

  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  return (
    <footer ref={ref} className="bg-[#F5F8FA] border-t border-gray-200 py-10 px-4 sm:px-6">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={footerVariants}
        className="max-w-5xl mx-auto"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          {/* Logo & Social */}
          <div className="col-span-2 sm:col-span-1">
            <img src="/logo.png" className="h-12 w-auto mb-4" alt="LawyerUp Logo" />
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              AI-powered legal assistance for everyone.
            </p>
            <div className="flex gap-3">
              <a
                href="https://x.com/LawyerUp_X"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-teal-100 hover:text-teal-600 flex items-center justify-center text-gray-500 transition-all text-sm"
              >
                <FaTwitter />
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-teal-100 hover:text-teal-600 flex items-center justify-center text-gray-500 transition-all text-sm"
              >
                <FaLinkedin />
              </a>
              <a
                href="https://www.instagram.com/lawyerup_01/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-teal-100 hover:text-teal-600 flex items-center justify-center text-gray-500 transition-all text-sm"
              >
                <FaInstagram />
              </a>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Solutions</h3>
            <ul className="space-y-2">
              {[
                { label: "Legal Document Analysis", path: "/doc" },
                { label: "AI Legal Chatbot", path: "/chat" },
                { label: "Find Lawyers", path: "/search-lawyers" },
                { label: "Legal Library", path: "/dict" },
              ].map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className="text-sm text-gray-500 hover:text-teal-600 transition-colors text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><span className="hover:text-teal-600 cursor-pointer transition-colors">About Us</span></li>
              <li><span className="hover:text-teal-600 cursor-pointer transition-colors">Careers</span></li>
              <li>
                <a
                  href="mailto:contactus.lawyerup@gmail.com"
                  className="hover:text-teal-600 transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Support</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><span className="hover:text-teal-600 cursor-pointer transition-colors">Help Center</span></li>
              <li><span className="hover:text-teal-600 cursor-pointer transition-colors">Privacy Policy</span></li>
              <li><span className="hover:text-teal-600 cursor-pointer transition-colors">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 text-center">
          <p className="text-gray-400 text-xs">© LawyerUp 2025. All Rights Reserved.</p>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
