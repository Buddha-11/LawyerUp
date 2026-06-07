import React from "react";
import { motion } from "framer-motion";

const stats = [
  { value: "95%", label: "Faster document analysis" },
  { value: "1M+", label: "Legal queries answered" },
  { value: "10x", label: "Simpler legal understanding" },
];

function MissionSection() {
  return (
    <div className="bg-white py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.2 }}
        >
          <p className="text-teal-600 font-semibold text-xs uppercase tracking-widest mb-3">Our Mission</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-snug">
            Bringing Simplicity<br />to Every Legal Matter
          </h2>
          <p className="text-gray-500 text-base md:text-lg mt-4 max-w-xl mx-auto leading-relaxed">
            We've helped individuals, freelancers, and businesses of all sizes navigate complex legal matters with ease.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 mt-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.value}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.15 }}
              viewport={{ once: false, amount: 0.2 }}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
            >
              <h3 className="text-4xl md:text-5xl font-bold text-teal-600">{stat.value}</h3>
              <p className="text-gray-500 text-sm mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MissionSection;
