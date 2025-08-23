import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useBoard } from '../../context/BoardContext';

const CardDetailsModal = ({ card, onClose, onDataRefresh }) => {
  const { members } = useBoard();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  // TODO: add state for labels, assignees, dueDate if needed

  // Comments state
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.get(`/comments/card/${card._id}`);
        setComments(res.data);
      } catch (err) {
        console.error("Failed to fetch comments", err);
      }
    };
    fetchComments();
  }, [card._id]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    try {
      const res = await api.post('/comments', { text: newCommentText, cardId: card._id });
      setComments([...comments, res.data]);
      setNewCommentText('');
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  };

  // ✅ Save handler
  const handleSave = async () => {
    try {
      await api.put(`/cards/${card._id}`, {
        title,
        description,
        // include labels, assignees, dueDate if you track them in state
      });
      onDataRefresh();
      onClose();
    } catch (err) {
      console.error("Failed to save card", err);
    }
  };

  // ✅ Delete handler
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this card?")) return;
    try {
      await api.delete(`/cards/${card._id}`);
      onDataRefresh();
      onClose();
    } catch (err) {
      console.error("Failed to delete card", err);
    }
  };

  // Example toggle (assignees, if needed later)
  const handleAssigneeToggle = (memberId) => {
    // TODO: implement assignee toggle logic if required
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal card-details-modal" onClick={e => e.stopPropagation()}>
        <input
          className="card-details-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <div className="card-meta">
          <p>In list: {card.list ? card.list.title : '...'}</p>
          <p>Task created on: {new Date(card.date).toLocaleString()}</p>
        </div>

        <div className="details-section">
          <p>Description</p>
          <textarea
            className="card-details-description"
            placeholder="Add a description..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {/* Comments Section */}
        <div className="details-section">
          <p>Comments</p>
          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment._id} className="comment">
                <div className="comment-author-avatar">
                  {comment.user.avatar
                    ? <img src={comment.user.avatar} alt={comment.user.name} />
                    : comment.user.name.charAt(0)}
                </div>
                <div className="comment-content">
                  <b>{comment.user.name}</b>
                  <p>{comment.text}</p>
                  <span className="comment-date">
                    {new Date(comment.date).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handlePostComment} className="comment-form">
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Write a comment..."
            />
            <button type="submit">Post</button>
          </form>
        </div>

        <div className="modal-actions">
          <button onClick={handleSave} className="save-btn">Save</button>
        </div>
        <button onClick={handleDelete} className="delete-btn">Delete Card</button>
      </div>
    </div>
  );
};

export default CardDetailsModal;
