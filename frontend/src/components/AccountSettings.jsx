import LinkGoogleAccount from "./LinkGoogleAccount";
import { Link } from "react-router-dom";
function AccountSettings() {
    return (
        <div className="account-settings-page">
            <div className="account-settings-card">
                <div className="account-settings-header">
                    <div className="account-settings-icon">
                        ⚙️
                    </div>

                    <h2>Account Settings</h2>
                    <p>
                        Manage your account and connected services.
                    </p>
                </div>

                <div className="account-settings-section">
                    <h3>Connected Accounts</h3>
                    <p>
                        Connect your Google account to your existing
                        account for easier and more convenient login.
                    </p>

                    <div className="google-link-wrapper">
                        <LinkGoogleAccount />
                    </div>
                </div>

                <div className="account-settings-footer">
                    <Link
                        to="/dashboard"
                        className="account-settings-back"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default AccountSettings;