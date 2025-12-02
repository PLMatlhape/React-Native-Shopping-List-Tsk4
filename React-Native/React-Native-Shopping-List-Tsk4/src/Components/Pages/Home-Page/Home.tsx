import React from 'react';
import { useNavigate } from 'react-router-dom';
import Categories from '../Categories-Section/Categories';
import './home.css';

const Home: React.FC = () => {
    const navigate = useNavigate();

    const handleMakeListClick = () => {
        navigate('/dashboard');
    };

    const handleCategoryClick = (categoryId: string) => {
        console.log('Category clicked:', categoryId);
        // Future: Navigate to category page
        // navigate(`/categories/${categoryId}`);
    };

    const handleSeeAllClick = () => {
        console.log('See all categories clicked');
        // Future: Navigate to all categories page
        // navigate('/categories');
    };

    return (
        <main className="home-container">
            <section className="hero">
                <div className="hero-content">
                    <h1>Organize Your<br />Perfect <span className="highlight">Shopping List</span><br />Effortlessly</h1>
                    <p>Create, manage, and organize your shopping lists to never forget essential items. Make grocery shopping simple and efficient for your family's needs.</p>
                    <div className="cta-buttons">
                        <button className="shop-btn btn-primary" onClick={handleMakeListClick}>Make List</button>
                        <div className="order-process">
                            <button className="play-btn" title="Play Order Process Video">▶</button>
                            Order Process
                        </div>
                    </div>
                </div>
                
                <div className="hero-image">
                    <img 
                        src="/Image/Green-Shop-List.png" 
                        alt="Happy customer with shopping bag" 
                        className="main-image"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                                parent.style.background = 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)';
                                parent.style.borderRadius = '20px';
                            }
                        }}
                    />
                    
                    {/* Floating Cards */}
                    <div className="floating-card rating-card">
                        <h4>Our Happy Customer</h4>
                        <div className="stars">⭐⭐⭐⭐⭐</div>
                        <div className="customer-count">4.9 (5k Review)</div>
                    </div>
                </div>
            </section>

            <Categories 
                onCategoryClick={handleCategoryClick}
                onSeeAllClick={handleSeeAllClick}
            />
        </main>
    );
};

export default Home;





