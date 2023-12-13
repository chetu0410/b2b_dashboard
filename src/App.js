import * as React from "react";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";

import AuthProvider from "./providers/AuthProvider";
import { ParentChildProvider } from "./providers/ParentChildProvider";
import router from "./router";

function App() {
    return (
        <AuthProvider>
            <ParentChildProvider>
                <Toaster />
                <RouterProvider router={router} />
            </ParentChildProvider>
        </AuthProvider>
    );
}

export default App;
