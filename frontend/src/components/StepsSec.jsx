import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    title: "Upload Your Documents",
    desc: "Sign up on LawyerUp and upload your legal documents directly from the dashboard.",
  },
  {
    number: "2",
    title: "Get Instant Analysis",
    desc: "Our AI breaks down complex legal jargon, summarizes key points, and provides clear explanations.",
  },
  {
    number: "3",
    title: "Get Clear Legal Answers",
    desc: "Understand your rights, obligations, and key details — all in simple, actionable language.",
  },
];

function StepsSection() {
  return (
    <div className="bg-[#02243A] text-white py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.2 }}
          className="mb-10 md:mb-14"
        >
          <p className="text-gray-400 text-sm uppercase tracking-widest mb-3">Steps</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-snug">
            Simplify Your Legal Process
            <br className="hidden sm:block" />
            <span className="text-teal-400"> in 3 Easy Steps</span>
          </h2>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.15 }}
              viewport={{ once: false, amount: 0.2 }}
              className="bg-[#04344F] p-6 md:p-8 rounded-2xl border border-white/5 hover:border-teal-500/30 transition-all duration-300"
            >
              <h3 className="text-5xl md:text-6xl font-bold bg-gradient-to-b from-gray-300 to-gray-600 text-transparent bg-clip-text">
                {step.number}
              </h3>
              <h4 className="text-lg md:text-xl font-semibold mt-4 mb-2">{step.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StepsSection;
