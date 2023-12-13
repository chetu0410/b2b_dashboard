import { createContext } from "react";

const ParentChildContext = createContext({ isChild: false, user_uid: "", email: "" });

export default ParentChildContext;
