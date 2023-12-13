import React from "react";
import { FaRobot } from "react-icons/fa";

const LeadbotToggle = ({ name, checked, onChange, disabled = false }) => {
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
                className={`w-9 h-9 bg-${
                    checked ? "green" : "red"
                }-500 rounded-full flex items-center justify-center transition-all duration-500 ease-in-out ${
                    checked ? "" : "animate-pulse"
                }`}
                title="Leadbot AutoResponder"
            >
                <div className="flex flex-col items-center">
                    <FaRobot className={`text-white text-l`} />
                    <p className={`text-white text-xs `}>{checked ? "ON" : "OFF"}</p>
                </div>
            </div>
        </label>
    );
};

export default LeadbotToggle;
