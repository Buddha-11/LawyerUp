import {Route,Routes} from 'react-router-dom'
import Auth from './pages/Auth.jsx'; 
import './App.css';
import HomePage from './pages/Home.jsx';

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<HomePage />} />
    </Routes>)
}
export default App;
