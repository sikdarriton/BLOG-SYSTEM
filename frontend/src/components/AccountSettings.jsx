import LinkGoogleAccount from "./LinkGoogleAccount";
import { Link } from "react-router-dom";
function AccountSettings() {
    return (
        <div>
            <h2>Account Settings</h2>
            <p>Connect your Google account to your existing account.</p>

            <LinkGoogleAccount />
            <Link to="/dashboard">Back</Link>
        </div>
    );
}

export default AccountSettings;