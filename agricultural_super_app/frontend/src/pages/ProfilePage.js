import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile, updateUserProfile } from '../redux/features/userSlice';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(state => state.auth.user);
  const { currentUserProfile, status, error } = useSelector(state => state.users);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login'); // Redirect to login if not authenticated
      return;
    }
    dispatch(fetchUserProfile(currentUser.id)); // Fetch current user's full profile
  }, [dispatch, currentUser, navigate]);

  useEffect(() => {
    if (currentUserProfile) {
      setUsername(currentUserProfile.username || '');
      setEmail(currentUserProfile.email || '');
      setBio(currentUserProfile.bio || '');
    }
  }, [currentUserProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = { username, email, bio };
    const resultAction = await dispatch(updateUserProfile(updatedData));
    if (updateUserProfile.fulfilled.match(resultAction)) {
      alert('Profile updated successfully!');
      // Optionally re-fetch profile or update local auth user state
    } else {
      alert('Failed to update profile.');
    }
  };

  if (!currentUser) {
    return <div className="container">Please log in to view your profile.</div>;
  }

  if (status === 'loading' && !currentUserProfile) {
    return <div className="container">Loading profile...</div>;
  }

  if (error) {
    return <div className="container error-message">Error: {error.message || 'Failed to load profile'}</div>;
  }

  return (
    <div className="container">
      <h1>My Profile</h1>
      {currentUserProfile && (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="bio">Bio:</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows="5"
            ></textarea>
          </div>
          {/* Add profile picture upload later */}
          <button type="submit" disabled={status === 'loading'}>Update Profile</button>
        </form>
      )}
    </div>
  );
}

export default ProfilePage;
