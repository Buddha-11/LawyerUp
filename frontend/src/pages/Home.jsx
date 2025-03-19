
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturesSection from '../components/Features';
import StepsSection from '../components/StepsSec';
import MissionSection from '../components/Mission';
import CTASection from '../components/CTA';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    
    <div className="w-full bg-white ">
    <Navbar />
    <Hero />
    <FeaturesSection />
    <StepsSection />
    <MissionSection />
    <CTASection />
    <Footer />
    </div>
   
  )}

  export default HomePage;
