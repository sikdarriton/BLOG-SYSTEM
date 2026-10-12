import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    logoutUser
} from "../services/authService";

import "./Dashboard.css";

const API = "http://localhost:5000/api/auth/me";

const APISTATS = "http://localhost:5000/api/dashboard/stats";

function Dashboard() {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPosts: 0
    });

    const [user, setUser] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const getLoggedInUser = async () => {
            try {
                const token = localStorage.getItem("token");
                console.log("Token from localStorage:", token);
                const response = await fetch(
                    API,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();
                console.log("Logged in user data:", data);
                if (data.message === 'jwt expired' || data.message === 'jwt malformed' || data.message === 'invalid token') {

                    /* REFRESH TOKEN LOGIC */

                    const refreshResponse = await fetch(
                        "http://localhost:5000/api/auth/refresh",
                        {
                            method: "POST",
                            credentials: "include",
                        }
                    );

                    console.log("Refresh response:", refreshResponse);

                    if (!refreshResponse.ok) {
                        localStorage.removeItem("token");
                        // Redirect to your login page
                        navigate("/", { replace: true });
                        return;
                    }

                    const refreshData = await refreshResponse.json();
                    const refreshDataToken = refreshData.accessToken;
                    localStorage.setItem("token", refreshDataToken);

                    const responseAfterRefresh = await fetch(
                        API,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            }
                        }
                    );

                    console.log("Fetched users after refresh:", responseAfterRefresh);

                    const dataFinal = await responseAfterRefresh.json();

                    if (!responseAfterRefresh.ok) {
                        throw new Error(data.message || "Failed to fetch users");
                    }

                    setUser(dataFinal.user || []);

                    /* REFRESH TOKEN LOGIC */
                } else {
                    setUser(data.user || []);
                }


            } catch (error) {
                console.error("Error fetching user:", error);

            }
        };

        getLoggedInUser();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                APISTATS,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load dashboard"
                );
            }

            setStats({
                totalUsers: data.totalUsers,
                totalPosts: data.totalPosts
            });
        } catch (error) {
            setError(error.message);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);


    async function handleLogout() {
        try {
            await logoutUser();
            setUser(null);
            setMessage("Logged out successfully");
            navigate("/", { replace: true });
        } catch (error) {
            setMessage(error.message);
        }
    }

    return (
        <div className="dashboard">
            {/* Sidebar */}
            <aside className="sidebar">
                <h2>Dashoard Panel</h2>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">

                <div>
                    <h2>Welcome, {user?.name}</h2>
                    <p>{user?.email}</p>
                    <p>Role: {user?.role}</p>
                    <button onClick={handleLogout}>Logout</button>
                    <p>{message}</p>

                    <Link to="/admin/posts">Posts</Link>

                    <br />
                    <Link to="/users">Users</Link>

                    <br />
                    <Link to="/settings">Settings</Link>
                    <br />
                </div>
                <br />

                <div className="dashboard-cards">
                    <div className="dashboard-card users-card">
                        <div className="card-icon">👥</div>
                        <div>
                            <p>Total Users</p>
                            <h3>{stats.totalUsers}</h3>
                        </div>
                    </div>

                    <div className="dashboard-card posts-card">
                        <div className="card-icon">📝</div>
                        <div>
                            <p>Total Posts</p>
                            <h3>{stats.totalPosts}</h3>
                        </div>
                    </div>
                </div>



            </main>
        </div>
    );
}

export default Dashboard;