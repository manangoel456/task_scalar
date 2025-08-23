import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import AuthContext from '../context/AuthContext';

const ProfilePage = () => {
    const { user: contextUser } = useContext(AuthContext);
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/users/me');
                setUser(res.data);
                setName(res.data.name);
                setAvatar(res.data.avatar || '');
            } catch (err) {
                console.error(err);
            }
        };
        fetchUser();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put('/users/me', { name, avatar });
            // Update local state after successful save to reflect changes instantly
            setUser(res.data); 
            setMessage('Profile updated successfully!');
        } catch (err) {
            setMessage('Failed to update profile.');
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }
        try {
            await api.put('/users/me', { password });
            setMessage('Password updated successfully!');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setMessage('Failed to update password.');
        }
    };

    if (!user) {
        return <div>Loading profile...</div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <img src={avatar || `https://i.pravatar.cc/150?u=${user._id}`} alt="User Avatar" className="profile-page-avatar" />
                <h2>{user.name}'s Profile</h2>
                {/* This line was added to show the email */}
                <p className="profile-email">{user.email}</p> 
            </div>
            {message && <p className="profile-message">{message}</p>}
            
            <form onSubmit={handleUpdateProfile} className="profile-form">
                <h3>Update Profile</h3>
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="avatar">Avatar URL</label>
                    <input type="text" id="avatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="http://example.com/image.png" />
                </div>
                <button type="submit">Save Profile</button>
            </form>

            <form onSubmit={handleUpdatePassword} className="profile-form">
                <h3>Change Password</h3>
                <div className="form-group">
                    <label htmlFor="password">New Password</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6+ characters" />
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                <button type="submit">Change Password</button>
            </form>
        </div>
    );
};

export default ProfilePage;