import classNames from "classnames";

const Select = ({
    children,
    className,
    variant = "outlined",
    color = "gray",
    defaultValue,
    value,
    name,
    multiple,
    onChange,
    ...props
}) => {
    if (!variant) throw new Error("variant is required");
    if (!color) throw new Error("color is required");

    const selectVarianrts = {
        contained: {
            gray: "bg-gray-200 text-gray-700",
            green: "bg-green-200 text-green-500",
            red: "bg-red-200 text-red-500",
        },
        outlined: {
            gray: "border border-gray-300 bg-gray-50 text-gray-700",
            green: "border border-green-700 bg-green-50 text-green-700",
            red: "border border-red-500 bg-green-50 text-red-500",
        },
    };

    if (!selectVarianrts[variant][color]) throw new Error("No variant for this color");

    return (
        <select
            className={classNames(
                "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-blue-500 focus:border-blue-500 block w-full p-1",
                selectVarianrts[variant][color],
                className
            )}
            defaultValue={defaultValue}
            value={value}
            name={name}
            onChange={onChange}
            multiple={multiple}
            {...props}
        >
            {children}
        </select>
    );
};

export default Select;
