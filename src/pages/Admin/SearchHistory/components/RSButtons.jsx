import classNames from "classnames";
import { useState } from "react";

const FilterButtons = () => {
    const [activeButton, setActiveButton] = useState("search");

    const handleClick = (activeButton) => {
        setActiveButton(activeButton);
    };

    return (
        <div className="f-center bg-gray p-2 rounded-full">
            <button
                type="button"
                className={classNames(
                    "text-gray-900 focus:outline-none font-medium rounded-full text-sm px-3 py-1.5 text-center",
                    { "bg-white shadow-app1": activeButton === "search" }
                )}
                onClick={(e) => handleClick("search")}
            >
                Search
            </button>

            <button
                type="button"
                className={classNames(
                    "text-gray-900 focus:outline-none font-medium rounded-full text-sm px-3 py-1.5 text-center",
                    { "bg-white shadow-app1": activeButton === "recommendations" }
                )}
                onClick={(e) => handleClick("recommendations")}
            >
                Recommendations
            </button>
        </div>
    );
};

export default FilterButtons;
