import { useEffect } from "react";

const ModelBase = ({ children, className = "" }) => {
    useEffect(() => {
        document.body.classList.add("overflow-hidden");
        return () => document.body.classList.remove("overflow-hidden");
    }, []);

    return (
        <div
            className={`fixed top-0 left-0 right-0 bottom-0 backdrop-blur-sm bg-[#00000045] p-3 f-center z-10 ${className}`}
        >
            {children}
        </div>
    );
};

export default ModelBase;
