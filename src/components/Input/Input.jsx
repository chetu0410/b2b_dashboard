import classNames from "classnames";

const Input = ({ type, placeholder, name, value, defaultValue, size = "md", required, onChange, ...props }) => {
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
        <input
            type={type}
            className={classNames(
                "bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full",
                sizeVariants[size]
            )}
            placeholder={placeholder}
            name={name}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            required={required}
            {...props}
        />
    );
};

export default Input;
