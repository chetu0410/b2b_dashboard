import React from "react";
import WhatsAppIcon from "../Icons/WhatsAppIcon";

const WhatsappButton = ({ name, checked, onChange, disabled = false }) => {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                value=""
                className="sr-only peer"
                name={name}
                checked={checked ? true : false}
                onChange={onChange}
                disabled={disabled}
            />
            <div
                className={`w-9 h-9 ${
                    checked === null ? "bg-yellow-400" : checked ? "bg-green-500" : "bg-red-500"
                } rounded-full flex items-center justify-center transition-all duration-500 ease-in-out ${
                    checked === null ? "" : checked ? "" : "animate-pulse"
                }`}
                title="Marketing WhatsApp"
            >
                <div className="flex flex-col items-center justify-center">
                    <WhatsAppIcon height={15} width={14} color="#FFFFFF" />
                    {checked === null && (
                        <svg
                            version="1.1"
                            id="L9"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            x="0px"
                            y="0px"
                            viewBox="0 0 100 100"
                            enableBackground="new 0 0 0 0"
                            width={15}
                            height={15}
                        >
                            <path
                                fill="#FFFFFF"
                                d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50"
                            >
                                <animateTransform
                                    attributeName="transform"
                                    attributeType="XML"
                                    type="rotate"
                                    dur="1s"
                                    from="0 50 50"
                                    to="360 50 50"
                                    repeatCount="indefinite"
                                ></animateTransform>
                            </path>
                        </svg>
                    )}
                    {checked !== null && <p className={`text-white text-xs `}>{checked ? "ON" : "OFF"}</p>}
                </div>
            </div>
        </label>
    );
};

export default WhatsappButton;
