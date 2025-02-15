import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import './App.css'
import Navbar from './components/Navbar'
import HomePage from './pages/Home';
function App() {

  return (
    <>
    <Router>
      <div className="App">
        <Routes>
        <Route path="/" element={<HomePage />} />
    
        </Routes>
      </div>
    </Router>
    </>
  );
};

export default App;
