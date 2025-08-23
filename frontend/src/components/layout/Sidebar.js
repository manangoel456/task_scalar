import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../../api';

const Sidebar = () => {
    const [workspaces, setWorkspaces] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [isWorkspacesOpen, setIsWorkspacesOpen] = useState(true); // State for collapsibility

    const fetchWorkspaces = async () => {
        try {
            const res = await api.get('/workspaces');
            setWorkspaces(res.data);
        } catch (err) {
            console.error("Failed to fetch workspaces", err);
        }
    };

    useEffect(() => { fetchWorkspaces(); }, []);

    const handleCreateWorkspace = async (e) => {
        e.preventDefault();
        if (!newWorkspaceName.trim()) return;
        try {
            await api.post('/workspaces', { name: newWorkspaceName });
            setNewWorkspaceName('');
            setIsCreating(false);
            await fetchWorkspaces();
        } catch (err) {
            console.error("Failed to create workspace", err);
        }
    };

    return (
        <aside className="sidebar">
            <nav>
                <NavLink to="/shared-boards" className="sidebar-link">Shared with me</NavLink>
                <NavLink to="/templates" className="sidebar-link">Templates</NavLink>
            </nav>
            <div className="sidebar-workspaces">
                <div className="workspaces-header" onClick={() => setIsWorkspacesOpen(!isWorkspacesOpen)}>
                    <p className="workspaces-title">Workspaces</p>
                    <div className="workspaces-controls">
                       <button onClick={(e) => {e.stopPropagation(); setIsCreating(true)}} className="add-workspace-btn">+</button>
                       <span className={`chevron ${isWorkspacesOpen ? 'open' : ''}`}>▼</span>
                    </div>
                </div>

                {isWorkspacesOpen && (
                    <div className="workspaces-content">
                        {isCreating && (
                            <form onSubmit={handleCreateWorkspace} className="create-ws-form-sidebar">
                                <input type="text" value={newWorkspaceName} onChange={(e) => setNewWorkspaceName(e.target.value)} placeholder="New workspace name..." autoFocus/>
                                <div className="form-actions-sidebar">
                                    <button type="submit">Create</button>
                                    <button type="button" onClick={(e) => {e.stopPropagation(); setIsCreating(false)}}>✕</button>
                                </div>
                            </form>
                        )}
                        {workspaces.map(ws => (
                            <NavLink key={ws._id} to={`/workspaces/${ws._id}`} className="workspace-item">
                                <div className="workspace-icon">{ws.name.charAt(0)}</div>
                                <span>{ws.name}</span>
                            </NavLink>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;