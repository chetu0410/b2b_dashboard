import classNames from "classnames";
import { forwardRef } from "react";

const Button = forwardRef(
    (
        { children, className, type, variant = "default", color = "primary", size = "md", onClick, disabled, ...props },
        ref
    ) => {
        if (!variant) throw new Error("variant is required");
        if (!color) throw new Error("color is required");
        if (!size) throw new Error("size is required");

        if (disabled) color = "disabled";

        const buttonColorVariants = {
            default: {
                primary: "hover:bg-primary-light",
                blue: "hover:bg-blue-100",
                green: "hover:bg-green-50",
                red: "hover:bg-red-100",
                yellow: "hover:bg-yellow-100", // Added yellow variant
                gray: "hover:bg-gray-50",
                disabled: "bg-gray-200 text-gray-600 grayscale",
            },
            contained: {
                primary: "bg-primary",
                blue: "bg-blue-600 text-white",
                green: "bg-green-600 text-white",
                red: "bg-red-600 text-white",
                yellow: "bg-yellow-500 text-white", // Added yellow variant
                gray: "bg-gray-200",
                disabled: "bg-gray-200 text-gray-600 grayscale",
            },
            outlined: {
                primary: "border border-primary bg-white",
                blue: "border border-blue-600 bg-white",
                green: "border border-green-600 bg-white",
                red: "border border-red-600 bg-white",
                yellow: "border border-yellow-500 bg-white", // Added yellow variant
                gray: "border border-gray-600 bg-white",
                disabled: "bg-gray-200 text-gray-600 grayscale",
            },
            filled: {
                primary: "bg-primary-light text-primary",
                blue: "bg-blue-50 text-blue-600",
                green: "bg-green-50 text-green-600",
                red: "bg-red-50 text-red-600",
                yellow: "bg-yellow-100 text-yellow-600", // Added yellow variant
                gray: "bg-gray-50 text-gray-600",
                disabled: "bg-gray-200 text-gray-600 grayscale",
            },
        };

        if (!buttonColorVariants[variant][color]) throw new Error("No variant for this color");

        const buttonSizeVariants = {
            xs: "px-1 py-0.5 text-xs",
            sm: "px-2.5 py-1 text-sm",
            base: "px-3 py-1.5 text-base",
            md: "px-3 py-2 text-base",
            lg: "px-4 py-2.5 text-lg",
            xl: "px-5 py-3 text-xl",
        };

        if (!buttonSizeVariants[size]) throw new Error("No variant for this size");

        return (
            <button
                className={classNames(
                    "f-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all",
                    buttonColorVariants[variant][color],
                    buttonSizeVariants[size],
                    className
                )}
                ref={ref}
                type={type || "button"}
                disabled={disabled}
                onClick={onClick}
                {...props}
            >
                {children}
            </button>
        );
    }
);

export default Button;
