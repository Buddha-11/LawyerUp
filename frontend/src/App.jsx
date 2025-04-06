import {Route,Routes} from 'react-router-dom'
import Auth from './pages/Auth.jsx';
import SearchLawyers from './components/SearchLawyers.jsx';
import './App.css';
import HomePage from './pages/Home.jsx';
import DocAnalyzer from './components/DocAnalyzer.jsx';
import Chatbot from './components/Chatbot.jsx';
import LawyerProfileSetup from './components/LawyerProfileSetup.jsx';
import UserProfile from './components/UserProfile.jsx';
function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/doc" element={<DocAnalyzer />} />
      <Route path="/chat" element={<Chatbot />} />
      <Route path="/search-lawyers" element={<SearchLawyers />} />
      <Route path="/user" element={<UserProfile />} />

      <Route path="/lawyer-profile-update" element={<LawyerProfileSetup />} />
    </Routes>)
} 
export default App;
