import React from 'react';
import './categories.css';

interface CategoryData {
  id: string;
  name: string;
  image: string;
  alt: string;
  iconClass: string;
}

const categoryData: CategoryData[] = [
  {
    id: 'meat',
    name: 'Fresh Meat',
    image: '/Image/Meat.png',
    alt: 'Fresh Meat',
    iconClass: 'meat-icon'
  },
  {
    id: 'fast-food',
    name: 'Fast Food',
    image: '/Image/Fast-Food.png',
    alt: 'Fast Food',
    iconClass: 'pizza-icon'
  },
  {
    id: 'fruits-veg',
    name: 'Fruits & Vegetables',
    image: '/Image/Fruits-Veg.png',
    alt: 'Fruits & Vegetables',
    iconClass: 'nuts-icon'
  },
  {
    id: 'spices',
    name: 'Spices',
    image: '/Image/Spices.png',
    alt: 'Spices',
    iconClass: 'spices-icon'
  }
];

interface CategoryCardProps {
  category: CategoryData;
  onClick?: (categoryId: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(category.id);
    }
  };

  return (
    <div className="category-card" onClick={handleClick}>
      <div className={`category-icon ${category.iconClass}`}>
        <img src={category.image} alt={category.alt} />
      </div>
      <h3>{category.name}</h3>
    </div>
  );
};

interface CategoriesProps {
  onCategoryClick?: (categoryId: string) => void;
  onSeeAllClick?: () => void;
}

const Categories: React.FC<CategoriesProps> = ({ 
  onCategoryClick, 
  onSeeAllClick 
}) => {
  const handleSeeAllClick = () => {
    if (onSeeAllClick) {
      onSeeAllClick();
    }
  };

  return (
    <section className="categories">
      <div className="section-header">
        <h2>Popular Categories</h2>
        <button className="see-all btn-primary" onClick={handleSeeAllClick}>
          See All →
        </button>
      </div>
      
      <div className="category-grid">
        {categoryData.map((category) => (
          <CategoryCard 
            key={category.id}
            category={category}
            onClick={onCategoryClick}
          />
        ))}
      </div>
    </section>
  );
};

export default Categories;
