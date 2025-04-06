import {Route,Routes} from 'react-router-dom'
import Auth from './pages/Auth.jsx';
import SearchLawyers from './components/SearchLawyers.jsx';
import './App.css';
import HomePage from './pages/Home.jsx';
import Chat from './components/chatbot/Chat.jsx';
import LawyerProfileSetup from './components/LawyerProfileSetup.jsx';
function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/search-lawyers" element={<SearchLawyers />} />

      <Route path="/lawyer-profile-update" element={<LawyerProfileSetup />} />
    </Routes>)
} 
export default App;
