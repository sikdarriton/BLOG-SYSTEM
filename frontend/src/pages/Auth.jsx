import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import {
    registerUser,
    loginUser,
    logoutUser
} from "../services/authService";

import "./Auth.css";


export default function Auth() {
    const [mode, setMode] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/dashboard", { replace: true });
        }
    }, [user, navigate]);

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage("");

        try {
            const result =
                mode === "register"
                    ? await registerUser({ name, email, password })
                    : await loginUser({ email, password });

            setUser(result.user);
            setMessage(result.message || "Success");
            setPassword("");
        } catch (error) {
            setMessage(error.message);
        }
    }

    // async function handleLogout() {
    //     try {
    //         await logoutUser();
    //         setUser(null);
    //         setMessage("Logged out successfully");
    //     } catch (error) {
    //         setMessage(error.message);
    //     }
    // }

    async function handleGoogleSuccess(googleResponse) {
        try {

            const response = await fetch(
                "http://localhost:5000/api/auth/google",
                {
                    method: "POST",
                    headers: {

                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        credential: googleResponse.credential,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Google login failed");
            }

            localStorage.setItem("token", data.token);

            navigate("/dashboard", { replace: true });
        } catch (error) {
            setMessage(error.message);
        }
    }


    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>
                        {mode === "register" ? "Create Account" : "Welcome Back"}
                    </h2>
                    <p>
                        {mode === "register"
                            ? "Register to get started."
                            : "Login to access your account."}
                    </p>
                </div>

                {message && (
                    <p className="auth-message" role="status">
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    {mode === "register" && (
                        <div className="auth-form-group">
                            <label htmlFor="name">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="auth-form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Minimum 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={8}
                            maxLength={72}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-submit-btn">
                        {mode === "register" ? "Create Account" : "Login"}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>OR</span>
                </div>

                <div className="google-login">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setMessage("Google login failed")}
                    />
                </div>

                <div className="auth-footer">
                    {mode === "login"
                        ? "Don't have an account?"
                        : "Already have an account?"}

                    <button
                        type="button"
                        className="auth-toggle-btn"
                        onClick={() => {
                            setMode(mode === "login" ? "register" : "login");
                            setMessage("");
                        }}
                    >
                        {mode === "login" ? "Register" : "Login"}
                    </button>
                </div>
            </div>
        </div>
    );
}