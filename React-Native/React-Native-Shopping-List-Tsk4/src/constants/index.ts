// App constants and shared data

export const COLORS = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  primaryLight: '#4CAF50',
  secondary: '#FF9800',
  accent: '#00BCD4',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  error: '#D32F2F',
  errorLight: '#FFCDD2',
  success: '#388E3C',
  successLight: '#C8E6C9',
  warning: '#F57C00',
  warningLight: '#FFE0B2',
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#BDBDBD',
  border: '#E0E0E0',
  divider: '#EEEEEE',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const PRIORITY_COLORS: { [key: string]: string } = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#D32F2F',
};

export const CATEGORIES = [
  { id: 'fruits', name: 'Fruits', icon: '🍎', color: '#ff6b6b' },
  { id: 'bread', name: 'Bread', icon: '🍞', color: '#ffa726' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥬', color: '#66bb6a' },
  { id: 'fish', name: 'Fish', icon: '🐟', color: '#42a5f5' },
  { id: 'meat', name: 'Meat', icon: '🥩', color: '#ef5350' },
  { id: 'drinks', name: 'Drinks', icon: '🥤', color: '#ff8a65' },
  { id: 'seafood', name: 'Sea Food', icon: '🦐', color: '#26c6da' },
  { id: 'icecream', name: 'Ice cream', icon: '🍦', color: '#ab47bc' },
  { id: 'juice', name: 'Juice', icon: '🧃', color: '#ffee58' },
  { id: 'dairy', name: 'Dairy', icon: '🥛', color: '#90caf9' },
  { id: 'snacks', name: 'Snacks', icon: '🍿', color: '#ffab91' },
  { id: 'bakery', name: 'Bakery', icon: '🥐', color: '#bcaaa4' },
];

export const UNITS = [
  { value: 'pieces', label: 'Pieces' },
  { value: 'kg', label: 'Kg' },
  { value: 'grams', label: 'Grams' },
  { value: 'liters', label: 'Liters' },
  { value: 'ml', label: 'ml' },
  { value: 'bottles', label: 'Bottles' },
  { value: 'packs', label: 'Packs' },
  { value: 'loaves', label: 'Loaves' },
];

export const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#4CAF50' },
  { value: 'medium', label: 'Medium', color: '#FF9800' },
  { value: 'high', label: 'High', color: '#D32F2F' },
];

// Images - using require for React Native
export const AVATAR_OPTIONS = [
  { id: 'boy', name: 'Boy Avatar', image: require('../../assets/images/Boy-avator.png') },
  { id: 'girl', name: 'Girl Avatar', image: require('../../assets/images/Girl-avator.png') },
  { id: 'grandpa', name: 'Grandpa Avatar', image: require('../../assets/images/Grandpa-avatar.png') },
  { id: 'granny', name: 'Granny Avatar', image: require('../../assets/images/Granny-avator.png') },
];

export const HOME_CATEGORIES = [
  {
    id: 'meat',
    name: 'Fresh Meat',
    image: require('../../assets/images/Meat.png'),
  },
  {
    id: 'fast-food',
    name: 'Fast Food',
    image: require('../../assets/images/Fast-Food.png'),
  },
  {
    id: 'fruits-veg',
    name: 'Fruits & Veg',
    image: require('../../assets/images/Fruits-Veg.png'),
  },
  {
    id: 'spices',
    name: 'Spices',
    image: require('../../assets/images/Spices.png'),
  },
];

// Default avatar if user hasn't selected one
export const DEFAULT_AVATAR = require('../../assets/images/Boy-avator.png');

// App logo
export const APP_LOGO = require('../../assets/images/Logo.png');

// Home hero image
export const HERO_IMAGE = require('../../assets/images/Green-Shop-List.png');
