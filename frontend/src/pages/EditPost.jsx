
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Card, Form, Button, Alert, Row, Col } from "react-bootstrap";
import { getAccessToken } from "../services/authService";
import "./EditPost.css"

const API = "http://localhost:5000/api/admin/posts";

function EditPost() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        content: ""

    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
     const [success, setSuccess] = useState("");
    const [saving, setSaving] = useState(false);

    // GET: Fetch the selected post by ID
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(
                    `${API}/${id}`,
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
                    throw new Error(data.message || "Failed to fetch post");
                }

                const post = data.post;

                setForm({
                    title: post.title || "",
                    content: post.content || ""

                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
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
                `${API}/${id}`,
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
                throw new Error(data.message || "Failed to update post");
            }

            // alert("Post updated successfully!");
            setSuccess("Post details are ready to update.");
           // navigate("/admin/posts");
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p>Loading post...</p>;

    return (

        <Container className="edit-post-container py-5">
            <Row className="justify-content-center">
                <Col lg={8} md={10}>
                    <Card className="edit-post-card shadow-sm border-0">
                        <Card.Header className="edit-post-header text-white p-4">
                            <h3 className="mb-1">Edit Post</h3>
                            <p className="mb-0">
                                Update your blog post details
                            </p>
                        </Card.Header>

                        <Card.Body className="p-4 p-md-5">

                            

                                {error && (
                                <Alert variant="danger">
                                    {error}
                                </Alert>
                            )}

                            {success && (
                                <Alert variant="success">
                                    {success}
                                </Alert>
                            )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-4">
                                        <Form.Label>Title</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="title"
                                            value={form.title}
                                            onChange={handleChange}
                                            required
                                            style={{ display: "block", width: "100%", padding: "10px" }}
                                        />
                                    </Form.Group>

                                    <br />

                                    <Form.Group className="mb-4">
                                        <Form.Label>Content</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            name="content"
                                            value={form.content}
                                            onChange={handleChange}
                                            required
                                            rows="8"
                                            style={{ display: "block", width: "100%", padding: "10px" }}
                                        />
                                    </Form.Group>

                                    <br />

                                    <br />

                                    <Button type="submit" disabled={saving}>
                                        {saving ? "Updating..." : "Update Post"}
                                    </Button>

                                    <Button 
                                        type="button"
                                        onClick={() => navigate("/admin/posts")}
                                        style={{ marginLeft: "10px" }}
                                    >
                                        Cancel
                                    </Button>
                                </Form>
                            
                        </Card.Body>

                    </Card>
                </Col>
            </Row>
        </Container>

    );
}

export default EditPost;