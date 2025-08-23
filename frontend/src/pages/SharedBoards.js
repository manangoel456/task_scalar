import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import AuthContext from '../context/AuthContext';

const SharedBoards = () => {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const { refreshTrigger } = useContext(AuthContext);

    useEffect(() => {
        const fetchSharedBoards = async () => {
            setLoading(true);
            try {
                const res = await api.get('/boards/shared');
                setBoards(res.data);
            } catch (err) {
                console.error("Failed to fetch shared boards", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSharedBoards();
    }, [refreshTrigger]);

    if (loading) {
        return <div className="main-content">Loading shared boards...</div>;
    }

    return (
        <div className="boards-page-container">
            <h2>Shared With Me</h2>
            {boards.length === 0 ? (
                <p>No boards have been shared with you yet.</p>
            ) : (
                <div className="boards-grid">
                    {boards.map(board => (
                        <Link key={board._id} to={`/board/${board._id}`} className="board-tile">
                            {board.title}
                            <span className="board-owner">by {board.user.name}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SharedBoards;