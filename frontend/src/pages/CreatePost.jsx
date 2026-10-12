
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreatePost.css";

function CreatePost() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        content: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/admin/posts",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(form),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to create post");
            }

            alert("Post created successfully!");
            navigate("/admin/posts");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (

        <div className="create-post">
            <div className="create-post-header">
                <h2>Create Post</h2>
                <p>Write and publish a new blog post.</p>
            </div>

            {error && <p className="create-post-error">{error}</p>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Post Title</label>
                    <input
                        id="title"
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Enter post title"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="content">Content</label>
                    <textarea
                        id="content"
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        placeholder="Write your post..."
                        rows="8"
                        required
                    />
                </div>

                <div className="create-post-actions">
                    <button
                        type="submit"
                        className="btn-create"
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Post"}
                    </button>

                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={() => navigate("/admin/posts")}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>

    );
}

export default CreatePost;

