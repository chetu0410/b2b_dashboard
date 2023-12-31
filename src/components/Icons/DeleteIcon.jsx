import React from "react";

const DeleteIcon = ({ height, width }) => {
    return (
        <svg
            width={width || "21"}
            height={height || "22"}
            viewBox="0 0 21 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M14.0032 5V4.2C14.0032 3.0799 14.0032 2.51984 13.7852 2.09202C13.5934 1.71569 13.2875 1.40973 12.9112 1.21799C12.4833 1 11.9233 1 10.8032 1H9.20317C8.08307 1 7.52302 1 7.09519 1.21799C6.71887 1.40973 6.41291 1.71569 6.22116 2.09202C6.00317 2.51984 6.00317 3.0799 6.00317 4.2V5M8.00317 10.5V15.5M12.0032 10.5V15.5M1.00317 5H19.0032M17.0032 5V16.2C17.0032 17.8802 17.0032 18.7202 16.6762 19.362C16.3886 19.9265 15.9296 20.3854 15.3651 20.673C14.7234 21 13.8833 21 12.2032 21H7.80317C6.12302 21 5.28294 21 4.6412 20.673C4.07672 20.3854 3.61777 19.9265 3.33015 19.362C3.00317 18.7202 3.00317 17.8802 3.00317 16.2V5"
                stroke="#7D7F81"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default DeleteIcon;
