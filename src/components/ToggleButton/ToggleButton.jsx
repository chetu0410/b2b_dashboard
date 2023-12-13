import classNames from "classnames";
import React from "react";

const ToggleButton = ({ name, checked, onChange, disabled = false }) => {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                value=""
                className="sr-only peer"
                name={name}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
            />
            <div
                className={classNames(
                    "w-14 h-8 text-sm font-bold bg-gray-200 peer-focus:outline-none rounded-full after:content-[''] peer peer-checked:after:translate-x-full peer-checked:after:border-white after:f-center after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-blue-600 peer-checked:after:left-[-2px]"
                    // `${checked ? "after:content-['Yes']" : "after:content-['No']"}`
                )}
            ></div>
        </label>
    );
};

export default ToggleButton;
