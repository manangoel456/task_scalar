import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BoardProvider } from './context/BoardContext';
import PrivateRoute from './routing/PrivateRoute';
import ProfilePage from './pages/ProfilePage'; // Import the new page

import Navbar from './components/layout/NavBar';
import Sidebar from './components/layout/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BoardsHome from './pages/BoardsHome';
import BoardView from './pages/BoardView';
import Home from './pages/Home'; // Import new Home component
import SharedBoards from './pages/SharedBoards'; // Import new SharedBoards component

import './App.css';

const DashboardLayout = ({ isSidebarOpen }) => (
    <div className={`dashboard-layout ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
        <Sidebar />
        <main className="main-content">
            <Outlet />
        </main>
    </div>
);

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <AuthProvider>
      <Router>
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route 
              path="/" 
              element={<PrivateRoute component={() => <DashboardLayout isSidebarOpen={isSidebarOpen} />} />}
            >
              <Route index element={<Home />} /> {/* Default route */}
              <Route path="boards" element={<BoardsHome />} />
                <Route path="profile" element={<ProfilePage />} /> {/* Add this new route */}

              <Route path="workspaces/:workspaceId" element={<BoardsHome />} /> 
              <Route path="shared-boards" element={<SharedBoards />} /> {/* New route */}
              <Route 
                path="board/:boardId" 
                element={<BoardProvider><BoardView /></BoardProvider>} 
              />
              <Route path="templates" element={<div className="main-content">Templates Page Coming Soon</div>} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;