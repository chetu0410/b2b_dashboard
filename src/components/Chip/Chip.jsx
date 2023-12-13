import classNames from "classnames";
import React from "react";

const Chip = ({ className, title, icon = false, variant = "contained", color = "gray", onClick, onCancel }) => {
    if (!variant) throw new Error("variant is required");
    if (!color) throw new Error("color is required");

    const chipVarianrts = {
        contained: {
            gray: "bg-gray-200 text-gray-700",
            green: "bg-green-100 text-green-700",
            red: "bg-red-200 text-red-500",
        },
        outlined: {
            gray: "border border-gray-200 text-gray-700",
            green: "border border-green-200 text-green-500",
            red: "border border-red-200 text-red-500",
        },
    };

    if (!chipVarianrts[variant][color]) throw new Error("No variant for this color");

    return (
        <div
            className={classNames(
                "inline-flex items-center justify-center text-sm rounded-full capitalize cursor-pointer",
                chipVarianrts[variant][color],
                className
            )}
        >
            <span className="pl-3 pr-2 py-1" onClick={onClick}>
                {title || ""}
            </span>
            {icon && (
                <button
                    type="button"
                    className="inline-flex items-center py-1 pl-1 pr-3 text-sm text-gray-400 bg-transparent"
                    onClick={onCancel}
                >
                    <svg
                        className="w-2 h-2 ml-2"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 14"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                        />
                    </svg>
                    <span className="sr-only">Remove badge</span>
                </button>
            )}
        </div>
    );
};

export default Chip;
