import React from "react";
import Spinner from "../Spinner/Spinner";

const PageLoading = () => {
    return (
        <div className="page_loading_component min-h-screen min-w-full f-center">
            <Spinner />
        </div>
    );
};

export default PageLoading;
