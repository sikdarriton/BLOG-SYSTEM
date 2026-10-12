import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import {
    registerUser,
    loginUser,
    logoutUser
} from "../services/authService";


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
        <div>
            <h2>{mode === "register" ? "Register" : "Login"}</h2>

            <form onSubmit={handleSubmit}>
                {mode === "register" && (
                    <input
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                )}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password (minimum 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    maxLength={72}
                    required
                />

                <button type="submit">
                    {mode === "register" ? "Register" : "Login"}
                </button>
            </form>

            <button
                type="button"
                onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setMessage("");
                }}
            >
                {mode === "login"
                    ? "Create an account"
                    : "Already have an account? Login"}
            </button>

            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setMessage("Google login failed")}
            />

            <p role="status">{message}</p>
        </div>
    );
}