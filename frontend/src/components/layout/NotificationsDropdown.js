import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const NotificationsDropdown = () => {
    const navigate = useNavigate();
    const { invitations, acceptInvitation } = useContext(AuthContext);

    const handleAccept = async (id) => {
        await acceptInvitation(id);
        navigate('/shared-boards');
    };

    return (
        <div className="notifications-dropdown">
            {invitations.length === 0 ? (
                <div className="notification-item">No new notifications</div>
            ) : (
                invitations.map(inv => (
                    <div key={inv._id} className="notification-item">
                        <p><b>{inv.inviter.name}</b> invited you to the board <b>{inv.board.title}</b></p>
                        <div className="notification-actions">
                            <button onClick={() => handleAccept(inv._id)} className="accept-btn">Accept</button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default NotificationsDropdown;