import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import NotificationsDropdown from './NotificationsDropdown';

const Navbar = ({ toggleSidebar }) => {
  const { isAuthenticated, logout, invitations, fetchInvitations, user } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (user && user.name) {
        return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return '';
  };

  useEffect(() => {
    function handleClickOutside(event) {
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
            setShowProfileMenu(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuRef]);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {isAuthenticated && (
            <button onClick={toggleSidebar} className="sidebar-toggle-btn">☰</button>
        )}
        <h1><Link to="/">TaskHive</Link></h1>
      </div>
      <div className="navbar-right">
        {isAuthenticated ? (
          <ul>
            <li className="notifications-icon" onClick={() => setShowNotifications(!showNotifications)}>
                🔔
                {invitations && invitations.length > 0 && (
                  <span className="notification-badge">{invitations.length}</span>
                )}
                {showNotifications && <NotificationsDropdown invitations={invitations} onAction={fetchInvitations} />}
            </li>
            <li className="profile-menu-container" ref={profileMenuRef}>
                <div className="profile-avatar" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                    {user && user.avatar ? (
                        <img src={user.avatar} alt="User Avatar" className="navbar-avatar-img" />
                    ) : (
                        <span>{getUserInitials()}</span>
                    )}
                </div>
                {showProfileMenu && (
                    <div className="profile-dropdown">
                        <Link to="/profile" onClick={() => setShowProfileMenu(false)}>Profile</Link>
                        <a href="#!" onClick={onLogout}>Logout</a>
                    </div>
                )}
            </li>
          </ul>
        ) : (
            <ul>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/login">Login</Link></li>
            </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;