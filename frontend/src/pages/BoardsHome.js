import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';

// ✅ CreateBoardModal (same as before, no changes needed)
const CreateBoardModal = ({ workspaces, onClose, onBoardCreated }) => {
    const [title, setTitle] = useState('');
    const [workspaceId, setWorkspaceId] = useState('');

    useEffect(() => {
        if (workspaces.length > 0) {
            setWorkspaceId(workspaces[0]._id);
        }
    }, [workspaces]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !workspaceId) {
            alert('Please provide a title and select a workspace.');
            return;
        }
        try {
            await api.post('/boards', { title, workspaceId });
            onBoardCreated();
        } catch (err) {
            console.error("Failed to create board", err);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h2>Create new board</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Board title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        autoFocus
                    />
                    <select value={workspaceId} onChange={(e) => setWorkspaceId(e.target.value)} required>
                        <option value="" disabled>Select a workspace</option>
                        {workspaces.map(ws => (
                            <option key={ws._id} value={ws._id}>{ws.name}</option>
                        ))}
                    </select>
                    <div className="modal-actions">
                        <button type="submit">Create</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ✅ BoardsHome with search + filtering
const BoardsHome = () => {
    const { workspaceId } = useParams();
    const [allBoards, setAllBoards] = useState([]); // All boards fetched
    const [filteredBoards, setFilteredBoards] = useState([]); // Boards after search filter
    const [workspaces, setWorkspaces] = useState([]);
    const [currentWorkspaceName, setCurrentWorkspaceName] = useState('Your');
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // For search input

    // Fetch workspaces + boards
    const fetchAllData = async () => {
        setLoading(true);
        try {
            const wsRes = await api.get('/workspaces');
            setWorkspaces(wsRes.data);

            if (workspaceId) {
                // Boards of selected workspace
                const boardRes = await api.get(`/boards/workspace/${workspaceId}`);
                setAllBoards(boardRes.data);
                const currentWs = wsRes.data.find(ws => ws._id === workspaceId);
                if (currentWs) setCurrentWorkspaceName(currentWs.name);
            } else {
                // Boards of all workspaces
                const boardPromises = wsRes.data.map(ws => api.get(`/boards/workspace/${ws._id}`));
                const boardsByWorkspace = await Promise.all(boardPromises);
                setAllBoards(boardsByWorkspace.flatMap(res => res.data));
                setCurrentWorkspaceName('All of Your');
            }
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [workspaceId]);

    // 🔎 Filter boards by search query
    useEffect(() => {
        if (!searchQuery) {
            setFilteredBoards(allBoards);
        } else {
            const filtered = allBoards.filter(board =>
                board.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredBoards(filtered);
        }
    }, [searchQuery, allBoards]);

    const handleBoardCreated = () => {
        setCreateModalOpen(false);
        fetchAllData();
    };

    const handleOpenCreateModal = () => {
        if (workspaces.length === 0) {
            alert("Please create a workspace first using the '+' button in the sidebar.");
        } else {
            setCreateModalOpen(true);
        }
    };

    if (loading) {
        return <div className="main-content">Loading boards...</div>;
    }

    return (
        <div className="boards-page-container">
            <div className="boards-page-header">
                <h2>{currentWorkspaceName} Boards</h2>
                {/* 🔎 Search bar */}
                <div className="search-bar-container">
                    <input
                        type="text"
                        placeholder="Search boards by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="boards-grid">
                {filteredBoards.map(board => (
                    <Link key={board._id} to={`/board/${board._id}`} className="board-tile">
                        {board.title}
                    </Link>
                ))}
                <div className="board-tile create-board-tile" onClick={handleOpenCreateModal}>
                    Create new board
                </div>
            </div>

            {isCreateModalOpen && (
                <CreateBoardModal 
                    workspaces={workspaces}
                    onClose={() => setCreateModalOpen(false)}
                    onBoardCreated={handleBoardCreated}
                />
            )}
        </div>
    );
};

export default BoardsHome;
