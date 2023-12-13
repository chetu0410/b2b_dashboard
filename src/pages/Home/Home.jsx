import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { PageLoading } from "../../components";
import AuthContext from "../../context/AuthContext";

const Home = () => {
    const navigate = useNavigate();

    const { authUser } = useContext(AuthContext);

    useEffect(() => {
        if (authUser.loading) return;
        if (authUser.auth === false) navigate("/dev/auth/login");
        if (authUser.auth === true) navigate("/dev/admin/search-history");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authUser]);

    return (
        <div className="home_page page">
            <PageLoading />
        </div>
    );
};

export default Home;
