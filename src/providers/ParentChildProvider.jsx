import { useState, useEffect } from "react";
import ParentChildContext from "../context/ParentChildContext";

export const ParentChildProvider = ({ children }) => {
    const [selectedUser, setSelectedUser] = useState({ isChild: false, user_uid: "", email: "" });

    useEffect(() => {
        let storedUser = localStorage.getItem("child-user");
        if (storedUser) {
            try {
                storedUser = JSON.parse(storedUser);
            } catch (err) {
                storedUser = { isChild: false, user_uid: "", email: "" };
                console.warn(err);
            }
            setSelectedUser(storedUser);
        }
    }, []);

    return (
        <ParentChildContext.Provider value={{ selectedUser, setSelectedUser }}>{children}</ParentChildContext.Provider>
    );
};
