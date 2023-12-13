import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import toast from "react-hot-toast";

async function firebaseReAuth(retry, toastId, callback) {
    if (retry > 3) return;

    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        const result = await firebase.auth().signInWithPopup(provider);
        console.log("Result:", result);

        const accessToken = result?.credential?.accessToken;
        console.log("accessToken", accessToken);

        if (accessToken) {
            localStorage.setItem("access_token", accessToken);
        }

        if (result?.additionalUserInfo?.profile) {
            localStorage.setItem("g_info", JSON.stringify(result.additionalUserInfo.profile));
        }

        toast.success("Re-Authentication Success", { id: toastId });

        if (callback) callback(true, result);
    } catch (err) {
        if (callback) callback(false, null);
        console.error("Google Sign-In Error:", err);
    }
}

export default firebaseReAuth;
