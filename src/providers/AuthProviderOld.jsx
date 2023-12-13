import { useEffect } from "react";
import axios from "axios";

import config from "../config/config";
import AuthContext from "../context/AuthContext";
import { useState } from "react";
import cookieHelper from "../utils/cookieHelper";
import QueryParams from "../utils/queryParams";

// let inti = false;
// let timer;
const AuthProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState({ loading: true, auth: null, code: null, id_token: null, jwt: null });

    /**
     * If JWt exists then set auth to true else set jwt to false and procces to generate access token
     */
    useEffect(() => {
        const authkey = QueryParams.get("authkey");
        if (authkey) {
            localStorage.setItem("access_token", authkey);
            return setAuthUser({ ...authUser, loading: false, auth: true });
        }

        let info = localStorage.getItem("g_info");
        if (info) {
            try {
                info = JSON.parse(info);
            } catch (err) {
                info = {};
                console.warn(err);
            }
        }

        if (!info) info = {};

        const jwt = cookieHelper.getCookie("jwt");

        if (jwt) setAuthUser({ ...authUser, loading: false, auth: true, jwt, ...info });
        else setAuthUser({ ...authUser, jwt: false, ...info });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getUserInfoUsingIdToken = async (id_token, jwt) => {
        try {
            const { data } = await axios.get(config.INFO_ENDPOINT, {
                params: { id_token },
            });

            setAuthUser({ ...authUser, loading: false, auth: true, jwt, ...data });

            localStorage.removeItem("id_token");
            localStorage.setItem("g_info", JSON.stringify(data));
        } catch (err) {
            console.log(err);
        }
    };

    // To get aceess_token and id_token from google auth using server auth code
    const handleTokenExchange = async (code) => {
        try {
            const response = await axios.post(config.TOKEN_ENDPOINT, {
                code,
                client_id: config.G_CLIENT_ID,
                client_secret: config.G_CLIENT_SECRET,
                redirect_uri: config.REDIRECT_URI,
                grant_type: "authorization_code",
            });

            console.log("handleTokenExchange");
            console.log(response.data);

            localStorage.setItem("access_token", response.data.access_token);
            localStorage.setItem("id_token", response.data.id_token);

            getUserInfoUsingIdToken(response.data.id_token);

            setAuthUser({ ...authUser, code: null, id_token: response.data.id_token });
        } catch (error) {
            setAuthUser({ ...authUser, loading: false, auth: false });
            console.error("Error exchanging authorization code for access token:", error);
        }
    };

    useEffect(() => {
        // let info = localStorage.getItem("g_info");
        // if (info) {
        //     try {
        //         info = JSON.parse(info);
        //     } catch (err) {
        //         info = {};
        //         console.warn(err);
        //     }
        // }

        // if (!info) info = {};

        // const jwt = cookieHelper.getCookie("jwt");

        // if (jwt) return setAuthUser({ ...authUser, loading: false, auth: true, jwt, ...info });

        // if (!timer) {
        //     timer = setTimeout(() => {
        //         setAuthUser({ ...authUser, loading: false, auth: false, ...info });
        //     }, 3000);
        // }

        if (authUser.code === null) return;
        if (authUser.jwt !== false) return;
        // if (authUser.code === "") return setAuthUser({ ...authUser, code: "", id_token: "", jwt });

        // clearTimeout(timer);

        // if (inti) return;
        // inti = true;

        handleTokenExchange(authUser.code);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser.code, authUser.jwt]);

    /**
     * Runs every time authUser state updates
     * authUser.code and authUser.id_token are empty means user is not redirected from google login
     * authUser.jwt is empty means either user login session has expired or he has never logged in
     */
    useEffect(() => {
        if (authUser.loading === false && authUser.auth === false) return;

        if (authUser.code === null && authUser.id_token === null && authUser.jwt === null) {
            setAuthUser({ ...authUser, loading: false, auth: false });
        }
    }, [authUser]);

    return <AuthContext.Provider value={{ authUser, setAuthUser }}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
