import React, { useState, useEffect, useContext } from 'react';
import api from '../../api';
import AuthContext from '../../context/AuthContext';

const ShareBoardModal = ({ board, onClose }) => {
  const { user } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [message, setMessage] = useState('');

  const isOwner = board.user === user.id;

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/boards/${board._id}/members`);
      setMembers(res.data);
    } catch (err) {
      console.error("Failed to fetch members", err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [board._id]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setMessage('');
    if (query.length > 2) {
      try {
        const res = await api.get(`/users/search?q=${query}`);
        const existingMemberIds = members.map(m => m.user._id);
        const newResults = res.data.filter(user => !existingMemberIds.includes(user._id));
        setSearchResults(newResults);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSendInvitation = async (email) => {
    try {
      await api.post('/invitations', { email, boardId: board._id });
      setMessage(`Invitation sent to ${email}!`);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Failed to send invitation');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
        try {
            await api.delete(`/boards/${board._id}/members/${memberId}`);
            fetchMembers();
        } catch (err) {
            console.error("Failed to remove member", err);
            setMessage("Failed to remove member.");
        }
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal share-modal" onClick={e => e.stopPropagation()}>
        <h2>Share "{board.title}"</h2>

        {isOwner && (
          <div className="invite-section">
            <div className="form-group">
              <label htmlFor="share-input">Invite by email address</label>
              <input id="share-input" type="text" placeholder="Enter email to search..." value={searchQuery} onChange={handleSearch} />
            </div>
            {message && <p className="share-message">{message}</p>}
            {searchResults.length > 0 && (
              <ul className="search-results">
                {searchResults.map(userResult => (
                  <li key={userResult._id}>
                    <span>{userResult.name} ({userResult.email})</span>
                    <button onClick={() => handleSendInvitation(userResult.email)}>Invite</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="members-list">
          <h3>Board Members</h3>
          <ul>
            {members.map(member => (
              <li key={member.user._id}>
                {member.user.name}
                {isOwner && member.user._id !== board.user && (
                  <button onClick={() => handleRemoveMember(member.user._id)} className="remove-member-btn">
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

export default ShareBoardModal;