import React from 'react';
import { useNavigate } from 'react-router-dom';
import './navBar.css';

const NavBar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSignUpClick = () => {
        navigate('/login');
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    return (
        <header>
            <nav>
                <div className="logo clickable" onClick={handleLogoClick}>
                    <img src="/Image/Logo.png" alt="Shopping List Logo" />
                    Shopping List
                </div>
                <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                    <li><a href="#home" className="active">Home</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#categories">Categories</a></li>
                    <li><a href="#services">Services</a></li>
                    <li><a href="#contact">Contact</a></li>
                    <li><button className="signup-btn btn-primary" onClick={handleSignUpClick}>SignUp</button></li>
                </ul>
                <button className="mobile-menu-btn" onClick={toggleMenu}>
                    {isMenuOpen ? '✕' : '☰'}
                </button>
            </nav>
        </header>
    );
};

export default NavBar;
