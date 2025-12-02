import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SignUpFormData, SignInFormData } from '../Auth/auth';
import './loginRegister.css';

const LoginRegister: React.FC = () => {
    const [isActive, setIsActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();
    
    // State for Sign Up form
    const [signUpData, setSignUpData] = useState<SignUpFormData>({
        name: '',
        surname: '',
        email: '',
        cellNumber: '',
        password: ''
    });
    
    // State for Sign In form
    const [signInData, setSignInData] = useState<SignInFormData>({
        email: '',
        password: ''
    });

    // Load saved email on component mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('lastRegisteredEmail');
        if (savedEmail) {
            setSignInData(prev => ({
                ...prev,
                email: savedEmail
            }));
        }
    }, []);

    // Handle input changes for Sign Up
    const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSignUpData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle input changes for Sign In
    const handleSignInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSignInData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRegisterClick = () => {
        setIsActive(true);
    };

    const handleLoginClick = () => {
        setIsActive(false);
    };

    // Handle registration submission
    const handleSignUpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Validate required fields
            if (!signUpData.name || !signUpData.surname || !signUpData.email || 
                !signUpData.cellNumber || !signUpData.password) {
                setMessage({ type: 'error', text: 'Please fill in all required fields.' });
                setLoading(false);
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(signUpData.email)) {
                setMessage({ type: 'error', text: 'Please enter a valid email address.' });
                setLoading(false);
                return;
            }

            // Validate password length
            if (signUpData.password.length < 6) {
                setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
                setLoading(false);
                return;
            }

            // Create new user
            const newUser = {
                id: Date.now().toString(),
                name: signUpData.name,
                surname: signUpData.surname,
                email: signUpData.email,
                cellNumber: signUpData.cellNumber,
                password: signUpData.password,
                createdAt: new Date().toISOString()
            };

            // Get existing users from localStorage
            const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            
            // Check if email already exists
            const emailExists = existingUsers.some((user: any) => user.email === signUpData.email);
            if (emailExists) {
                setMessage({ type: 'error', text: 'Email already registered. Please login.' });
                setLoading(false);
                return;
            }

            // Add new user to array and save
            existingUsers.push(newUser);
            localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

            // Show success message
            setMessage({ type: 'success', text: 'Account created successfully! Please log in.' });
            
            // Store registration info for auto-fill login
            localStorage.setItem('lastRegisteredEmail', signUpData.email);
            
            // Auto-fill login form with registered email
            setSignInData(prev => ({
                ...prev,
                email: signUpData.email
            }));

            // Clear registration form
            setSignUpData({
                name: '',
                surname: '',
                email: '',
                cellNumber: '',
                password: ''
            });

            // Auto-transition to login after 1.5 seconds
            setTimeout(() => {
                setIsActive(false);
                setMessage({ type: '', text: '' });
            }, 1500);

        } catch (error) {
            console.error('Registration error:', error);
            setMessage({ type: 'error', text: 'Failed to create account. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    // Handle login submission
    const handleSignInSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Validate required fields
            if (!signInData.email || !signInData.password) {
                setMessage({ type: 'error', text: 'Please enter both email and password.' });
                setLoading(false);
                return;
            }

            // Get users from localStorage
            const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            
            const user = users.find((u: any) => 
                u.email === signInData.email && u.password === signInData.password
            );

            if (!user) {
                setMessage({ type: 'error', text: 'Invalid email or password.' });
                setLoading(false);
                return;
            }

            // Save login info to localStorage for persistence
            localStorage.setItem('userInfo', JSON.stringify({
                id: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                cellNumber: user.cellNumber,
                loginTime: new Date().toISOString()
            }));

            // Show success message
            setMessage({ type: 'success', text: 'Login successful! Redirecting...' });

            // Navigate to dashboard after 1 second
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);
            setMessage({ type: 'error', text: 'Login failed. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleBackClick = () => {
        navigate('/');
    };

    return (
        <div className="login-register-wrapper">
            <button className="back-arrow btn-secondary btn-compact" onClick={handleBackClick} aria-label="Go back to home">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Home
            </button>
            {message.text && (
                <div className={`message ${message.type === 'success' ? 'success' : 'error'}`}>
                    {message.text}
                </div>
            )}
            <div className={`login-register-container ${isActive ? 'active' : ''}`} id="container">
                <div className="form-container sign-up">
                    <form onSubmit={handleSignUpSubmit}>
                        <h1>Create Account</h1>
                        <div className="social-icons">
                            <a href="#" className="icon" aria-label="Sign up with Google"><i className="fa-brands fa-google-plus-g"></i></a>
                            <a href="#" className="icon" aria-label="Sign up with Facebook"><i className="fa-brands fa-facebook-f"></i></a>
                            <a href="#" className="icon" aria-label="Sign up with GitHub"><i className="fa-brands fa-github"></i></a>
                            <a href="#" className="icon" aria-label="Sign up with LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
                        </div>
                        <span>or use your details for registration</span>
                        <input 
                            type="text" 
                            name="name"
                            placeholder="First Name" 
                            value={signUpData.name}
                            onChange={handleSignUpChange}
                            autoComplete="given-name"
                            required
                            minLength={2}
                            title="Please enter your first name (at least 2 characters)"
                            disabled={loading}
                        />
                        <input 
                            type="text" 
                            name="surname"
                            placeholder="Surname" 
                            value={signUpData.surname}
                            onChange={handleSignUpChange}
                            autoComplete="family-name"
                            required
                            minLength={2}
                            title="Please enter your surname (at least 2 characters)"
                            disabled={loading}
                        />
                        <input 
                            type="email" 
                            name="email"
                            placeholder="Email Address" 
                            value={signUpData.email}
                            onChange={handleSignUpChange}
                            autoComplete="email"
                            required
                            title="Please enter a valid email address"
                            disabled={loading}
                        />
                        <input 
                            type="tel" 
                            name="cellNumber"
                            placeholder="Cell Number (e.g., +27 123 456 7890)" 
                            value={signUpData.cellNumber}
                            onChange={handleSignUpChange}
                            autoComplete="tel"
                            pattern="[+]?[0-9\s\-\(\)]+"
                            required
                            title="Please enter a valid cell number"
                            disabled={loading}
                        />
                        <input 
                            type="password" 
                            name="password"
                            placeholder="Password" 
                            value={signUpData.password}
                            onChange={handleSignUpChange}
                            autoComplete="new-password"
                            required
                            minLength={6}
                            title="Password must be at least 6 characters long"
                            disabled={loading}
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>
                </div>
                <div className="form-container sign-in">
                    <form onSubmit={handleSignInSubmit}>
                        <h1>Sign In</h1>
                        <div className="social-icons">
                            <a href="#" className="icon" aria-label="Sign in with Google"><i className="fa-brands fa-google-plus-g"></i></a>
                            <a href="#" className="icon" aria-label="Sign in with Facebook"><i className="fa-brands fa-facebook-f"></i></a>
                            <a href="#" className="icon" aria-label="Sign in with GitHub"><i className="fa-brands fa-github"></i></a>
                            <a href="#" className="icon" aria-label="Sign in with LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
                        </div>
                        <span>or use your email password</span>
                        <input 
                            type="email" 
                            name="email"
                            placeholder="Email Address" 
                            value={signInData.email}
                            onChange={handleSignInChange}
                            autoComplete="email"
                            required
                            title="Please enter your email address"
                            disabled={loading}
                        />
                        <input 
                            type="password" 
                            name="password"
                            placeholder="Password" 
                            value={signInData.password}
                            onChange={handleSignInChange}
                            autoComplete="current-password"
                            required
                            title="Please enter your password"
                            disabled={loading}
                        />
                        <a href="#">Forget Your Password?</a>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                </div>
                <div className="toggle-container">
                    <div className="toggle">
                        <div className="toggle-panel toggle-left">
                            <h1>Welcome Back!</h1>
                            <p>Enter your personal details to use all of site features</p>
                            <button className="hidden" onClick={handleLoginClick}>Sign In</button>
                        </div>
                        <div className="toggle-panel toggle-right">
                            <h1>Hello, Friend!</h1>
                            <p>Register with your personal details to use all of site features</p>
                            <button className="hidden" onClick={handleRegisterClick}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginRegister;
