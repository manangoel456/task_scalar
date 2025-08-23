import React, { useState } from 'react';
import api from '../../api';

const MoveBoardModal = ({ board, workspaces, onClose, onMoveSuccess }) => {
    const [targetWorkspaceId, setTargetWorkspaceId] = useState('');
    const [error, setError] = useState('');

    const handleMove = async () => {
        if (!targetWorkspaceId) {
            setError('Please select a workspace.');
            return;
        }
        try {
            await api.put(`/boards/${board._id}/move`, { newWorkspaceId: targetWorkspaceId });
            onMoveSuccess();
        } catch (err) {
            setError('Failed to move board. You must be the owner.');
            console.error(err);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h2>Move "{board.title}"</h2>
                <p>Select a destination workspace:</p>
                <select 
                    value={targetWorkspaceId} 
                    onChange={(e) => setTargetWorkspaceId(e.target.value)}
                >
                    <option value="" disabled>Choose a workspace</option>
                    {workspaces.map(ws => (
                        <option key={ws._id} value={ws._id}>{ws.name}</option>
                    ))}
                </select>
                {error && <p className="error-text">{error}</p>}
                <div className="modal-actions">
                    <button onClick={handleMove}>Move</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default MoveBoardModal;