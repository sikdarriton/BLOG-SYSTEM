import { GoogleLogin } from "@react-oauth/google";

function LinkGoogleAccount() {
    const handleGoogleSuccess = async (googleResponse) => {
        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://localhost:5000/api/auth/google/link",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    credential: googleResponse.credential
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Unable to link Google account");
            return;
        }

        alert(data.message);
    };

    return (
        <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.error("Google verification failed")}
        />
    );
}

export default LinkGoogleAccount;