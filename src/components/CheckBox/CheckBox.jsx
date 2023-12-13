import classNames from "classnames";
import React from "react";

const CheckBox = ({ name, checked, onChange, size = "md", ...props }) => {
    if (!size) throw new Error("Size is required");

    const sizeVarinats = {
        xs: "w-2 h-2",
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5",
        xl: "w-6 h-6",
    };

    if (!sizeVarinats[size]) throw new Error("No size varint found");

    return (
        <input
            type="checkbox"
            className={classNames("text-blue-600 bg-gray-100 border-gray-300 rounded", sizeVarinats[size])}
            name={name}
            checked={checked}
            onChange={onChange}
            {...props}
        />
    );
};

export default CheckBox;
