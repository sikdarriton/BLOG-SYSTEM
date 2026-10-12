import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function PostDetails() {
    const { slug } = useParams();

    const [post, setPost] = useState(null);
    const [error, setError] = useState("");

    const fetchPost = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/api/admin/posts/slug/${encodeURIComponent(slug)}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to load post");
                }

                setPost(data.post);
            } catch (error) {
                setError(error.message);
            }
        };

    useEffect(() => {
        fetchPost();
    }, [slug]);

    if (error) return <p>{error}</p>;
    if (!post) return <p>Loading post...</p>;

    return (
        <div>
            <h1>{post.title}</h1>

            <p>
                By: {post.author?.name || "Unknown author"}
            </p>

            <p>{post.content}</p>

            <small>
                Published:{" "}
                {new Date(post.timestamps).toLocaleDateString()}
            </small>
        </div>
    );
}

export default PostDetails;