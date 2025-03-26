import {Route,Routes} from 'react-router-dom'
import Auth from './pages/Auth.jsx'; 
import './App.css';
import HomePage from './pages/Home.jsx';
import Chat from './components/chatbot/Chat.jsx';

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>)
}
export default App;
