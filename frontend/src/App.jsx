import {Route,Routes} from 'react-router-dom'
import Auth from './pages/Auth.jsx'; 
import './App.css';
import Home from './pages/Home.jsx';

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<Home></Home>} />
    </Routes>
  );
}

export default App;
