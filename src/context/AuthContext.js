import { createContext } from "react";

const AuthContext = createContext({ loading: true, auth: null });

export default AuthContext;
