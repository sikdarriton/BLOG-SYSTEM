import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api/admin/posts";

function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function deletePost(id) {
    if (!window.confirm("Delete this post?")) return;

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


      fetchPosts();

    } catch (err) {
      setError(err.message);
    }
  }

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        API, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      );

      const data = await response.json();
      console.log("Fetched posts:", data);

      
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

                setPosts(data.posts || []);

                /* REFRESH TOKEN LOGIC */


            } else {
                setPosts(data.posts || []);
            }


    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

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

  useEffect(() => {
    fetchCurrentUser();
  }, []);




  return (
    <div>
      <h3>Posts Management</h3>

      {error && <p role="alert">{error}</p>}

      <table align="center" border="1" cellPadding="10">
        <thead>
          {currentUser?.role === "admin" && (
            <tr>
              <th colspan="5">
                <Link to="/admin/posts/create">
                  Create Post
                </Link>
              </th>
            </tr>
          )}
          <tr>
            <th>Title</th>
            <th>Content</th>
            <th>Author</th>
            <th>Author Role</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {posts.map((post) => (
            <tr key={post._id}>
              <td>
                <Link to={`/posts/${post.slug}`}>
                  {post.title}
                </Link>
              </td>
              <td>{post.content}</td>
              <td>{post.author?.email || "Unknown"}</td>
              <td>{post.author?.role || "Unknown"}</td>
              <td>

                {(
                  currentUser?.role === "admin" ||
                  post.author?._id === currentUser?._id ||
                  post.author === currentUser?._id
                ) && (
                    <Link to={`/admin/posts/${post._id}/edit`}>
                      Edit
                    </Link>
                  )}
                &nbsp;
                {(
                  currentUser?.role === "admin" ||
                  post.author?._id === currentUser?._id ||
                  post.author === currentUser?._id
                ) && (
                    post?.isDeleted ? (
                      <span>Deleted</span>
                    ) : (
                      <button type="button" onClick={() => deletePost(post._id)}>
                        Delete
                      </button>
                    )


                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/dashboard">Back</Link>
    </div>
  );
}

export default AdminPosts;