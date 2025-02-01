
import React from "react";
import { Routes, Route, Link } from "react-router-dom"; // Import necessary components
import LawyerCard from "./components/lawyer/lawyerCard";
import "./style.css";

const App = () => {
  const lawyerData = {
    name: "Dr. Divyashree R.A",
    image: "https://cdn.pixabay.com/photo/2019/10/23/08/03/woman-4570763_1280.jpg", // Replace with actual image URL
    bio: "Experienced lawyer specializing in corporate law.",
    profession: "Corporate Lawyer",
    experience: "16",
    address: "GH-1, Jhalwa, Prayagraj",
    skills: "Corporate Law, Contracts",
    languages: "English, French",
    _id: "1", // Unique ID for the lawyer
    ratings: "4.6 ",
    fee: "1000"
  };

  return (
    <div>
      <h1>Lawyer Profile</h1>
      <LawyerCard {...lawyerData} />

      <Routes>
        <Route path="/lawyers/:id" /> {/* Example Route */}
      </Routes>
    </div>
  );
};

export default App;