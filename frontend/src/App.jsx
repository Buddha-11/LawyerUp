import { Route, Routes } from "react-router-dom";
import Auth from "./pages/Auth.jsx";
import SearchLawyers from "./components/SearchLawyers.jsx";
import "./App.css";
import HomePage from "./pages/Home.jsx";
import DocAnalyzer from "./components/DocAnalyzer.jsx";
import Chatbot from "./components/Chatbot.jsx";
import LawyerProfileSetup from "./components/LawyerProfileSetup.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx"; // Adjust path as needed
import Dictionary from "./components/Dictionary.jsx";
import UserProfile from "./components/UserProfile.jsx";
function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/dict" element={<Dictionary />} />
      {/* Protected routes */}
      <Route
        path="/doc"
        element={
          <ProtectedRoute>
            <DocAnalyzer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chatbot />
          </ProtectedRoute>
        }
      />
       <Route
        path="/user"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search-lawyers"
        element={
          <ProtectedRoute>
            <SearchLawyers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lawyer-profile-update"
        element={
          <ProtectedRoute>
            <LawyerProfileSetup />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
