import { useEffect } from "react";

import AuthContext from "../context/AuthContext";
import { useState } from "react";
import cookieHelper from "../utils/cookieHelper";
import QueryParams from "../utils/queryParams";

const AuthProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState({ loading: true, auth: null, jwt: null });

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
        } else {
            info = {};
        }

        const jwt = cookieHelper.getCookie("jwt");
        console.log(jwt);

        if (jwt) setAuthUser({ ...authUser, loading: false, auth: true, jwt, ...info });
        else setAuthUser({ ...authUser, loading: false, auth: false, jwt: false, ...info });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <AuthContext.Provider value={{ authUser, setAuthUser }}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
