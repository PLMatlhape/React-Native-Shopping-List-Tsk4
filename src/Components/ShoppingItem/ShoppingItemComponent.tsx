import React, { useState } from 'react';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import type { ShoppingItem, UpdateShoppingItemDto } from '../../types/shopping';
import './ShoppingItemComponent.css';

interface ShoppingItemComponentProps {
  item: ShoppingItem;
  onToggle: (id: string) => Promise<ShoppingItem | null>;
  onUpdate: (id: string, updates: UpdateShoppingItemDto) => Promise<ShoppingItem | null>;
  onDelete: (id: string) => Promise<boolean>;
}

const ShoppingItemComponent: React.FC<ShoppingItemComponentProps> = ({
  item,
  onToggle,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    price: item.price,
    notes: item.notes || ''
  });

  const handleSaveEdit = async () => {
    try {
      await onUpdate(item.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      notes: item.notes || ''
    });
    setIsEditing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  if (isEditing) {
    return (
      <div className="shopping-item editing">
        <div className="item-edit-form">
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
            className="edit-name"
            placeholder="Item name"
          />
          
          <div className="edit-row">
            <input
              type="number"
              value={editData.quantity}
              onChange={(e) => setEditData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
              className="edit-quantity"
              min="1"
              title="Quantity"
              placeholder="Quantity"
            />
            
            <select
              value={editData.unit}
              onChange={(e) => setEditData(prev => ({ ...prev, unit: e.target.value }))}
              className="edit-unit"
              title="Unit of measurement"
            >
              <option value="pieces">Pieces</option>
              <option value="kg">Kg</option>
              <option value="grams">Grams</option>
              <option value="liters">Liters</option>
              <option value="ml">ml</option>
              <option value="bottles">Bottles</option>
              <option value="packs">Packs</option>
              <option value="loaves">Loaves</option>
            </select>
            
            <input
              type="number"
              value={editData.price}
              onChange={(e) => setEditData(prev => ({ ...prev, price: Number(e.target.value) }))}
              className="edit-price"
              min="0"
              step="0.01"
              placeholder="Price"
            />
          </div>
          
          <input
            type="text"
            value={editData.notes}
            onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
            className="edit-notes"
            placeholder="Notes (optional)"
          />
          
          <div className="edit-actions">
            <button onClick={handleSaveEdit} className="btn-primary btn-sm">
              <Check size={16} /> Save
            </button>
            <button onClick={handleCancelEdit} className="btn-secondary btn-sm">
              <X size={16} /> Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`shopping-item ${item.isCompleted ? 'completed' : ''}`}>
      <div className="item-main">
        <button
          onClick={() => onToggle(item.id)}
          className={`item-checkbox ${item.isCompleted ? 'checked' : ''}`}
          aria-label={item.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {item.isCompleted && <Check size={16} />}
        </button>
        
        <div className="item-details">
          <div className="item-header">
            <h4 className="item-name">{item.name}</h4>
            <div 
              className={`item-priority priority-${item.priority}`}
              title={`${item.priority} priority`}
            />
          </div>
          
          <div className="item-meta">
            <span className="item-quantity">
              {item.quantity} {item.unit}
            </span>
            <span className="item-category">{item.category}</span>
            {item.price > 0 && (
              <span className="item-price">
                {formatCurrency(item.price * item.quantity)}
              </span>
            )}
          </div>
          
          {item.notes && (
            <p className="item-notes">{item.notes}</p>
          )}
        </div>
      </div>
      
      <div className="item-actions">
        <button
          onClick={() => setIsEditing(true)}
          className="action-btn edit-btn"
          aria-label="Edit item"
        >
          <Edit2 size={16} />
        </button>
        
        <button
          onClick={() => onDelete(item.id)}
          className="action-btn delete-btn"
          aria-label="Delete item"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default ShoppingItemComponent;
