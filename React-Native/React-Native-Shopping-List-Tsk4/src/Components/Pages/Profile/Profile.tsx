import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Save, 
  ArrowLeft,
  Edit3,
  Check,
  X
} from 'lucide-react';
import './profile.css';

interface UserProfile {
  id: string;
  name: string;
  surname: string;
  email: string;
  cellNumber: string;
  avatar: string;
  joinDate?: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserProfile | null>(null);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const avatarOptions = [
    { id: 'boy', name: 'Boy Avatar', path: '/Image/Boy-avator.png' },
    { id: 'girl', name: 'Girl Avatar', path: '/Image/Girl-avator.png' },
    { id: 'grandpa', name: 'Grandpa Avatar', path: '/Image/Grandpa-avatar.png' },
    { id: 'granny', name: 'Granny Avatar', path: '/Image/Granny-avator.png' }
  ];

  // Load user data on component mount
  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      const userWithDefaults = {
        ...parsedUser,
        avatar: parsedUser.avatar || '/Image/Boy-avator.png',
        joinDate: parsedUser.loginTime || new Date().toISOString()
      };
      setUser(userWithDefaults);
      setEditedUser(userWithDefaults);
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...user! });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({ ...user! });
    setShowAvatarSelector(false);
    setMessage({ type: '', text: '' });
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        [field]: value
      });
    }
  };

  const handleAvatarSelect = (avatarPath: string) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        avatar: avatarPath
      });
    }
    setShowAvatarSelector(false);
  };

  const handleSave = async () => {
    if (!editedUser) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate required fields
      if (!editedUser.name || !editedUser.surname || !editedUser.email || !editedUser.cellNumber) {
        setMessage({ type: 'error', text: 'Please fill in all required fields.' });
        setLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editedUser.email)) {
        setMessage({ type: 'error', text: 'Please enter a valid email address.' });
        setLoading(false);
        return;
      }

      // Update user in JSON server
      const response = await fetch(`http://localhost:3001/users/${editedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedUser),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // Update localStorage
      const updatedUserInfo = {
        ...editedUser,
        loginTime: user?.joinDate || new Date().toISOString()
      };
      localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

      // Update state
      setUser(editedUser);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
        <button className="back-btn" onClick={handleGoBack} aria-label="Go back">
          <ArrowLeft size={20} />
          Back
        </button>
        <h1>My Profile</h1>
        {!isEditing ? (
          <button className="edit-btn" onClick={handleEdit} aria-label="Edit profile">
            <Edit3 size={20} />
            Edit
          </button>
        ) : (
          <div className="edit-actions">
            <button className="cancel-btn" onClick={handleCancel} aria-label="Cancel editing">
              <X size={18} />
              Cancel
            </button>
            <button 
              className="save-btn" 
              onClick={handleSave} 
              disabled={loading}
              aria-label="Save changes"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </header>

      {/* Message Display */}
      {message.text && (
        <div className={`profile-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Profile Content */}
      <div className="profile-content">
        {/* Avatar Section */}
        <div className="avatar-section">
          <div className="avatar-container">
            <img 
              src={isEditing ? editedUser?.avatar : user.avatar} 
              alt="User Avatar" 
              className="user-avatar"
            />
            {isEditing && (
              <button 
                className="avatar-edit-btn" 
                onClick={() => setShowAvatarSelector(true)}
                aria-label="Change avatar"
              >
                <Camera size={16} />
              </button>
            )}
          </div>
          <div className="user-basic-info">
            <h2 className="user-name">
              {isEditing ? `${editedUser?.name} ${editedUser?.surname}` : `${user.name} ${user.surname}`}
            </h2>
            <p className="user-email">
              {isEditing ? editedUser?.email : user.email}
            </p>
            <p className="join-date">
              Member since {formatJoinDate(user.joinDate || new Date().toISOString())}
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="profile-form">
          <div className="form-section">
            <h3>Personal Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">
                  <User size={18} />
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={isEditing ? editedUser?.name || '' : user.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">
                  <User size={18} />
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={isEditing ? editedUser?.surname || '' : user.surname}
                  onChange={(e) => handleInputChange('surname', e.target.value)}
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <Mail size={18} />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={isEditing ? editedUser?.email || '' : user.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                <Phone size={18} />
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={isEditing ? editedUser?.cellNumber || '' : user.cellNumber}
                onChange={(e) => handleInputChange('cellNumber', e.target.value)}
                disabled={!isEditing}
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <div className="avatar-modal-overlay" onClick={() => setShowAvatarSelector(false)}>
          <div className="avatar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="avatar-modal-header">
              <h3>Choose Your Avatar</h3>
              <button 
                className="close-modal-btn" 
                onClick={() => setShowAvatarSelector(false)}
                aria-label="Close avatar selector"
              >
                <X size={20} />
              </button>
            </div>
            <div className="avatar-options">
              {avatarOptions.map((avatar) => (
                <div 
                  key={avatar.id} 
                  className={`avatar-option ${editedUser?.avatar === avatar.path ? 'selected' : ''}`}
                  onClick={() => handleAvatarSelect(avatar.path)}
                >
                  <img src={avatar.path} alt={avatar.name} />
                  <span>{avatar.name}</span>
                  {editedUser?.avatar === avatar.path && (
                    <div className="avatar-selected-indicator">
                      <Check size={16} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
