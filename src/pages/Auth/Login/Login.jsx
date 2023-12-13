import { useContext } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import toast from "react-hot-toast";

import "../../../assets/css/login.css";
import glogo from "../../../assets/images/google-logo.png";
import logo from "../../../assets/images/logo.png";
import AuthContext from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const { authUser, setAuthUser } = useContext(AuthContext);

    // const handleLogin = () => {
    //     const authUrl = `${config.AUTH_ENDPOINT}?client_id=${config.G_CLIENT_ID}&redirect_uri=${config.REDIRECT_URI}&scope=${config.SCOPE}&response_type=code`;
    //     console.log(authUrl);
    //     window.location.href = authUrl;
    // };

    const handleGoogleLogin = async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            const result = await firebase.auth().signInWithPopup(provider);
            console.log("Result:", result);

            const accessToken = result.credential.accessToken;
            console.log(accessToken);

            localStorage.setItem("access_token", accessToken);
            localStorage.setItem("g_info", JSON.stringify(result.additionalUserInfo.profile));

            setAuthUser({ ...authUser, loading: false, auth: true, ...result.additionalUserInfo.profile });

            // const refreshToken = result.user.refreshToken;
            // localStorage.setItem("refresh_token", refreshToken);

            toast.success("Login to YogLeads successfully");
            navigate("/dev/admin/search-history");
        } catch (err) {
            toast.error(err.message);
            console.error("Google Sign-In Error:", err);
        }
    };

    return (
        <div className="login_page page min-h-screen w-full f-center">
            <div className="f-center flex-col max-w-md w-full !text-black">
                <div className="logo mb-3">
                    <img src={logo} alt="logo" width="180px" />
                </div>

                <div className="goole_login f-center">
                    <div
                        className="flex items-center gap-2 bg-blue-500 p-2 rounded-md cursor-pointer"
                        onClick={handleGoogleLogin}
                    >
                        <div className="bg-white p-1 rounded-md">
                            <img src={glogo} alt="google" width="20px" />
                        </div>
                        <span className="text-white text-lg">Sign in with Google</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
