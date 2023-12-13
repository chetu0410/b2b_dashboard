const config = {
    API_URL: process.env.REACT_APP_API_URL,
    G_CLIENT_ID: process.env.REACT_APP_GOOGLE_LOGIN_CLIENT_ID,
    AUTH_ENDPOINT: "https://accounts.google.com/o/oauth2/auth",
    TOKEN_ENDPOINT: "https://www.googleapis.com/oauth2/v4/token",
    INFO_ENDPOINT: "https://oauth2.googleapis.com/tokeninfo",
    SCOPE: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
    REDIRECT_URI: process.env.REACT_APP_DOMAIN || "http://localhost:3000",
    CHROME_EXTENSION_URL:
        "https://chrome.google.com/webstore/detail/yog-b2b-generate-business/fmjhiebpgmabjblophfkehpciiiacgpa",
};

export default config;
