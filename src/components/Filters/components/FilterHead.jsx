import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { PiSlidersHorizontalLight } from "react-icons/pi";

const FilterHead = ({ heading = "Filters", filters = {}, onClick }) => {
    const handleClick = (e) => {
        if (onClick) onClick(e);
    };

    return (
        <div
            className="filter_btn f-center gap-2 px-2 py-1 rounded-full bg-white shadow-app1 cursor-pointer"
            onClick={(e) => handleClick(true)}
        >
            <PiSlidersHorizontalLight className="text-3xl font-bold" />

            <span className="font-medium">{heading}</span>

            {Object.values(filters).filter((ele) => ele === 1).length !== 0 && (
                <span className="w-5 h-5 rounded-full bg-green-500 text-white f-center">
                    {Object.values(filters).filter((ele) => ele === 1).length}
                </span>
            )}

            <MdOutlineKeyboardArrowDown className="text-2xl text-gray-600" />
        </div>
    );
};

export default FilterHead;
