import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="dashboard-container">
            <nav className="navbar">
                <div className="nav-brand">Secure User Authentication</div>
                <button onClick={logout} className="btn btn-danger" style={{ width: 'auto', margin: 0 }}>Logout</button>
            </nav>
            <div className="dashboard-content">
                <h1>Welcome to task 1</h1>
                <p>Hello, {user && user.username}!</p>
                <p>This mini project represents a <b>Secure user Authentication</b> system.</p>
            </div>
        </div>
    );
};

export default Dashboard;
