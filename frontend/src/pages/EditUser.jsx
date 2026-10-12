
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAccessToken } from "../services/authService";
function EditUser() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        role: "User",
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    // GET: Fetch the selected user by ID
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/api/users/${id}`,
                    {
                        method: "GET",

                        headers: {
                            Authorization: `Bearer ${getAccessToken()}`,
                            "Content-Type": "application/json",
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to fetch user");
                }

                const user = data.user;

                setForm({
                    name: user.name || "",
                    email: user.email || "",
                    role: user.role || "User",
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // PUT: Update the post
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const response = await fetch(
                `http://localhost:5000/api/users/${id}`,
                {
                    method: "PUT",

                    headers: {
                        Authorization: `Bearer ${getAccessToken()}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(form)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update user");
            }

            alert("User updated successfully!");
            navigate("/users");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p>Loading user...</p>;

    return (
        <div style={{ maxWidth: "700px", margin: "30px auto" }}>
            <h2>Edit Blog User</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        style={{ display: "block", width: "100%", padding: "10px" }}
                    />
                </div>

                <br />

                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        rows="8"
                        style={{ display: "block", width: "100%", padding: "10px" }}
                    />
                </div>

                <br />

                <div>
                    <label>Role</label>
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <br />

                <button type="submit" disabled={saving}>
                    {saving ? "Updating..." : "Update User"}
                </button>

                <button
                    type="button"
                    onClick={() => navigate("/users")}
                    style={{ marginLeft: "10px" }}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default EditUser;