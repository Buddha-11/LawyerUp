import {Route,Routes} from 'react-router-dom'
//import Home from './pages/Home.jsx'; 
import Auth from './pages/Auth.jsx'; 
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
    </Routes>
  );
}

export default App;
