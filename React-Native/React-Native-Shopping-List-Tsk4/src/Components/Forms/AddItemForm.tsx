import React, { useState } from 'react';
import type { CreateShoppingItemDto, Category } from '../../types/shopping';
import './AddItemForm.css';

interface AddItemFormProps {
  categories: Category[];
  onAddItem: (item: CreateShoppingItemDto) => Promise<void>;
  onCancel: () => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ categories, onAddItem, onCancel }) => {
  const [formData, setFormData] = useState<CreateShoppingItemDto>({
    name: '',
    quantity: undefined as unknown as number,
    unit: '',
    price: undefined as unknown as number,
    category: '',
  priority: undefined,
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    

    // Validation
    if (!formData.name.trim() ||
        !formData.category ||
        !formData.unit ||
        !formData.priority ||
        formData.quantity === undefined || formData.quantity === null || isNaN(formData.quantity) || formData.quantity <= 0 ||
        formData.price === undefined || formData.price === null || isNaN(formData.price) || formData.price < 0
    ) {
      alert('Please fill in all required fields with valid values. Quantity must be > 0, Price must be >= 0, and no field can be empty.');
      return;
    }

    setLoading(true);
    try {
      await onAddItem(formData);
      // Reset form
      setFormData({
        name: '',
        quantity: 1,
        unit: 'pieces',
        price: 0,
        category: '',
        priority: 'medium',
        notes: ''
      });
      onCancel();
    } catch (error) {
      console.error('Failed to add item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Prevent leading zeros in number fields
    if (name === 'quantity' || name === 'price') {
      let numValue = value.replace(/^0+(?=\d)/, '');
      if (numValue === '') numValue = '0';
      setFormData(prev => ({
        ...prev,
        [name]: Number(numValue)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="add-item-form-overlay">
      <div className="add-item-form">
        <h3>Add New Item</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Item Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter item name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity === undefined ? '' : formData.quantity}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unit</label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              >
                <option value="">Select unit</option>
                <option value="pieces">Pieces</option>
                <option value="kg">Kg</option>
                <option value="grams">Grams</option>
                <option value="liters">Liters</option>
                <option value="ml">ml</option>
                <option value="bottles">Bottles</option>
                <option value="packs">Packs</option>
                <option value="loaves">Loaves</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price (R)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price === undefined ? '' : formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="">Select priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes (optional)"
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemForm;
