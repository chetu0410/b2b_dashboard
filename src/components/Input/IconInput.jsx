import classNames from "classnames";
import React from "react";

const IconInput = ({
    children,
    className,
    place,
    type,
    placeholder,
    name,
    value,
    defaultValue,
    size = "md",
    required,
    onChange,
    ...props
}) => {
    if (!size) throw new Error("Input size is required");

    const sizeVariants = {
        xs: "px-1.5 py-1 text-xs",
        sm: "px-2 py-1.5 text-sm",
        base: "p-2 text-sm",
        md: "p-2.5 text-base",
        lg: "p-4 text-md",
        xl: "p-6 text-lg",
    };

    if (!sizeVariants[size]) throw new Error("No Input variant for this size");

    return (
        <div
            className={classNames(
                "items-center flex rounded-full bg-white border border-gray-300 px-1 py-0 w-full",
                className
            )}
        >
            {place === "start" && children}

            <input
                className="py-1.5 px-3 w-full rounded-full outline-none ring-0 focus:outline-none focus:ring-0"
                type={type}
                placeholder={placeholder}
                name={name}
                value={value}
                defaultValue={defaultValue}
                required={required}
                onChange={onChange}
                {...props}
            />

            {place === "end" && children}
        </div>
    );
};

export default IconInput;
