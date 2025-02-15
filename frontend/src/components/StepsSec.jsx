import React from "react";
import { motion } from "framer-motion";

const steps = [
  { number: "1", title: "Open your account", desc: "Sign up to Finpay and set up your account from the dashboard." },
  { number: "2", title: "Transfer your money", desc: "Move money from another account into and start earning up." },
  { number: "3", title: "Watch your balance grow", desc: "Access instantly and remain insulated from market volatility." },
];

function StepsSection() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      className="bg-[#02243A] text-white flex items-center justify-center py-17 px-6 mt-48"
    >
      <div className="max-w-6xl w-full">
        {/* Heading */}
        <motion.h2
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
          }}
          className="text-5xl font-normal text-left mb-10"
        >
            <span className="text-xl text-gray-400 mb-8">Steps</span><br ></br><br></br>
          Maximize your returns with a <br />
          Reserve account that generates.
        </motion.h2>

        {/* Steps Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: index * 0.4 } },
              }}
              className="bg-[#04344F] p-8 rounded-xl shadow-lg text-left max-w-[260px] md:max-w-[400px]"
            >
              {/* Gradient Step Number */}
              <h3 className="text-6xl font-bold bg-gradient-to-b from-gray-300 to-gray-600 text-transparent bg-clip-text">
                {step.number}
              </h3>

              {/* Step Title & Description */}
              <h4 className="text-2xl font-semibold mt-4">{step.title}</h4>
              <p className="text-gray-400 text-base mt-2">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default StepsSection;
