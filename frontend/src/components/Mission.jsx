import React from "react";
import { motion } from "framer-motion";

const stats = [
  { value: "24%", label: "Revenue business" },
  { value: "180K", label: "In annual revenue" },
  { value: "10+", label: "Months of runway" },
];

function MissionSection() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      className="bg-white text-black flex items-center justify-center py-20 px-6 mt-30"
    >
      <div className="max-w-5xl w-full text-center">
        {/* Heading */}
        <motion.h2
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
          }}
          className="text-xl font-semibold text-[#008080] uppercase tracking-wide"
        >
          Our Mission
        </motion.h2>

        <motion.h3
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.3 } },
          }}
          className="text-5xl font-semibold mt-2"
        >
          We’ve helped <br /> innovative companies
        </motion.h3>

        <motion.p
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.5 } },
          }}
          className="text-gray-500 text-lg mt-4"
        >
          Hundreds of all sizes and across all industries have made a big improvement with us.
        </motion.p>

        {/* Stats */}
        <div className="flex flex-col md:flex-row justify-center gap-12 mt-10">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.value}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.7 + index * 0.3 } },
              }}
              className="text-center"
            >
              <h4 className="text-5xl font-bold text-black">{stat.value}</h4>
              <p className="text-gray-500 text-lg">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default MissionSection;
