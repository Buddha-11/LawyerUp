import {Route,Routes} from 'react-router-dom'
import Auth from './pages/Auth.jsx';
import SearchLawyers from './components/SearchLawyers.jsx';
import './App.css';
import HomePage from './pages/Home.jsx';
import DocAnalyzer from './components/DocAnalyzer.jsx';
import Chatbot from './components/Chatbot.jsx';

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/doc" element={<DocAnalyzer />} />
      <Route path="/chat" element={<Chatbot />} />
    </Routes>)
}
export default App;
