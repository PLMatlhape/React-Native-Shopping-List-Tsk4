import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import NavBar from './Components/Pages/Navigation-Bar/NavBar'
import Home from './Components/Pages/Home-Page/Home'
import LoginRegister from './Components/Login-Register/LoginRegister'
import Dashboard from './Components/Pages/Dashboard/Dashboard'
import Profile from './Components/Pages/Profile/Profile'
import './App.css'


// Component to conditionally render NavBar
const AppContent = () => {
  const location = useLocation();
  const hideNavBar = location.pathname === '/login' || location.pathname === '/dashboard' || location.pathname === '/profile';

  return (
    <>
      {!hideNavBar && <NavBar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginRegister />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <div className='app-container'>
      <Router>
        <AppContent />
      </Router>
    </div>
  )
}

export default App
