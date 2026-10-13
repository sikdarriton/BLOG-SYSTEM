
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "react-bootstrap/Pagination";

const API = "http://localhost:5000/api/users";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

    const totalPages = Math.ceil(users.length / usersPerPage);

    const startIndex = (currentPage - 1) * usersPerPage;

    const currentUsers = users.slice(
        startIndex,
        startIndex + usersPerPage
    );

    async function fetchUsers() {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(API, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            console.log("Fetched users:", data);

            if (!response.ok) {
                //throw new Error(data.message || "Unable to load users");
            }

            if (data.message === 'jwt expired' || data.message === 'jwt malformed' || data.message === 'invalid token') {

                console.log("Token expired, attempting to refresh...");

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
                const token = refreshData.accessToken;
                localStorage.setItem("token", token);

                const response = await fetch(
                    API,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );

                console.log("Fetched users after refresh:", response);

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to fetch users");
                }

                setUsers(data.users || []);

                /* REFRESH TOKEN LOGIC */


            } else {
                setUsers(data.users || []);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function deleteUser(id) {
        if (!window.confirm("Delete this user?")) return;

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${API}/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();
            console.log("Delete response:", data);

            if (!response.ok) {
                throw new Error(data.message || "Delete failed");
            }


            fetchUsers();

        } catch (err) {
            setError(err.message);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    "http://localhost:5000/api/auth/me",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch logged-in user");
                }

                const data = await response.json();
                setCurrentUser(data.user);
            } catch (error) {
                console.error(error.message);
            }
        };

        fetchCurrentUser();
    }, []);

    if (loading) return <p>Loading users...</p>;

    return (
        <div style={{ padding: "24px" }}>
            <h2>User Management</h2>


            {error && <p role="alert">{error}</p>}

            <table align="center" border="1"
                cellPadding="10"

            >
                <thead>
                    <tr>
                        <th align="center">Name</th>
                        <th align="center">Email</th>
                        <th align="center">Role</th>
                        <th align="center">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {currentUsers.map(user => (
                        <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                {currentUser?.role === "admin" && (
                                    <Link to={`/users/${user._id}/edit`}>
                                        Edit
                                    </Link>
                                )}
                                &nbsp;
                                {currentUser?.role === "admin" && (
                                    user?.isDeleted ? (
                                        <span>Deleted</span>
                                    ) : (
                                        <button type="button" onClick={() => deleteUser(user._id)}>
                                            Delete
                                        </button>
                                    )
                                )}

                                {currentUser?.role === "user" && (
                                    user?.isDeleted ? (
                                        <span>Deleted</span>
                                    ) : (
                                        <button type="button" disabled>
                                            Delete
                                        </button>
                                    )
                                )}

                            </td>
                        </tr>
                    ))}

                    {users.length === 0 && (
                        <tr>
                            <td colSpan="4">No users found.</td>
                        </tr>
                    )}
                </tbody>
            </table>


            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                        <Pagination.Prev
                            disabled={currentPage === 1}
                            onClick={() =>
                                setCurrentPage((page) => page - 1)
                            }
                        />

                        {Array.from(
                            { length: totalPages },
                            (_, index) => index + 1
                        ).map((page) => (
                            <Pagination.Item
                                key={page}
                                active={page === currentPage}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </Pagination.Item>
                        ))}

                        <Pagination.Next
                            disabled={currentPage === totalPages}
                            onClick={() =>
                                setCurrentPage((page) => page + 1)
                            }
                        />
                    </Pagination>
                </div>
            )}

            <Link to="/dashboard">Back</Link>
        </div>
    );
}