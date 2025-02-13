import React from "react";
import { motion } from "framer-motion";

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (delay) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut", delay },
  }),
};

function Hero() {
  return (
    <div className="bg-[#F5F8FA] min-h-screen flex items-center justify-center">
      <div className="w-full flex flex-col md:flex-row items-center justify-between mr-4">
        {/* Left Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0} // No delay for left section
          variants={sectionVariants}
          className="max-w-lg ml-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Get paid early <br /> save automatically <br /> all your pay.
          </h1>
          <p className="mt-4 text-gray-600 text-lg">
            Supports small businesses with simple invoicing, powerful integrations, and cash flow management tools.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <input
              type="email"
              placeholder="Your business email"
              className="px-4 py-3 border border-gray-300 rounded-md w-64 text-gray-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-md flex items-center">
              Get Started <span className="ml-2">→</span>
            </button>
          </div>
          <div className="mt-6 flex items-center space-x-6 text-gray-500 text-lg">
            <span className="font-semibold">Klarna</span>
            <span className="font-semibold">coinbase</span>
            <span className="font-semibold">instacart</span>
          </div>
        </motion.div>

        {/* Right Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0.5} // Delay for right section
          variants={sectionVariants}
          className="mt-10 md:mt-0 relative mr-10 mb-10"
        >
          <div className="bg-white shadow-xl rounded-lg p-6 w-80">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 text-white text-xl font-bold h-10 w-10 flex items-center justify-center rounded-full">
                D
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Dipa Inhouse</h3>
                <p className="text-gray-500 text-sm">dipainhouse@gmail.com</p>
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <p className="text-gray-600 text-sm">Invoice</p>
              <h2 className="text-2xl font-bold text-gray-900">$1,876,580</h2>
              <p className="text-gray-500 text-sm">April 21, 2024</p>
            </div>

            <div className="mt-4 space-y-3">
              <label className="flex items-center space-x-2">
                <input type="radio" name="payment" className="text-teal-500" />
                <span className="text-gray-700">Credit Card</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="payment" className="text-teal-500" />
                <span className="text-gray-700">Bank Account</span>
              </label>
            </div>

            <button className="mt-6 bg-gray-900 hover:bg-gray-800 text-white text-lg font-semibold w-full py-3 rounded-lg">
              Pay
            </button>
          </div>

          {/* Floating Credit Card */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={1} // Further delay for floating card
            variants={sectionVariants}
            className="absolute -top-10 -right-10 bg-teal-600 text-white shadow-lg rounded-lg p-4 w-40 flex flex-col items-center"
          >
            <p className="text-sm">Credit Card</p>
            <p className="text-lg font-semibold">234 **** ****</p>
            <p className="mt-2 text-sm font-bold">VISA</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Hero;