import toast from "react-hot-toast";

const handleError = (err, toastId) => {
    if (toastId) toast.remove(toastId);

    if (err.name === "Error")
        return toast.error(err.message, {
            style: {
                maxWidth: 500,
            },
        });
    if (err.name === "AxiosError" && err.code === "ERR_NETWORK")
        return toast.error(err.message, {
            style: {
                maxWidth: 500,
            },
        });

    if (err.response) {
        // The client was given an error response (5xx, 4xx)
        return toast.error(err.response.data.message, {
            style: {
                maxWidth: 500,
            },
        });
    } else if (err.request) {
        // The client never received a response, and the request was never left
        return toast.error(err.message, {
            style: {
                maxWidth: 500,
            },
        });
    } else {
        // Anything else
        return toast.error(err.message || "Unknown error occurred. Please try again.", {
            style: {
                maxWidth: 500,
            },
        });
    }
};

export default handleError;
