
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Row,
    Col,
    Card,
    Alert,
    Form,
    Button
} from "react-bootstrap";
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

        <Container className="create-post-container py-5">
            <Row className="justify-content-center">
                <Col lg={8} md={10}>
                    <Card className="create-post-card shadow-sm border-0">

                        <Card.Header className="create-post-header text-white p-4">
                            <h3 className="mb-1">Create Post</h3>
                            <p className="mb-0">
                                Write and publish a new blog post.
                            </p>
                        </Card.Header>

                        <Card.Body className="p-4 p-md-5">

                            {error && (
                                <Alert variant="danger">
                                    {error}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-4">
                                    <Form.Label>Post Title</Form.Label>

                                    <Form.Control
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Enter post title"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Content</Form.Label>

                                    <Form.Control
                                        as="textarea"
                                        id="content"
                                        name="content"
                                        value={form.content}
                                        onChange={handleChange}
                                        placeholder="Write your post..."
                                        rows={8}
                                        required
                                    />
                                </Form.Group>

                                <div className="create-post-actions">
                                    <Button
                                        type="submit"
                                        className="btn-create"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Creating..."
                                            : "Create Post"}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="btn-cancel"
                                        onClick={() =>
                                            navigate("/admin/posts")
                                        }
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </Form>

                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>

    );
}

export default CreatePost;

