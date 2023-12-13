import { useState, useEffect } from "react";
import { BsCheckLg } from "react-icons/bs";
import { MdClose } from "react-icons/md";

import Button from "../Button/Button";
// import CheckBox from "../CheckBox/CheckBox";
//import MultiSelect from "../Select/MultiSelect";
import FilterHead from "./components/FilterHead";
import FilterToggleButton from "./components/FilterToggleButton";

// 0 - In Process Filters
// 1 - Saved Filters
// const savedFilter = [[], []];

const IndiamartFilters = ({ onSave, stat, onShow }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        //GST_NUMBER: 0,
        //Turnover: 0,
        include_email: 0,
        include_mobile: 0,
        //include_turnover_ranges: [],
    });
    // const [activeFilters, setActiveFilters] = useState([]);
    //const [turnover, setTurnover] = useState([]);

    const handleClickToggleFilter = () => {
        setShowFilters((prev) => {
            onShow(!prev);
            return !prev;
        });
    };

    useEffect(() => {
        if (!stat) setShowFilters(false);
    }, [stat]);

    const handleChangeFilter = (e) => {
        let val = e.target.checked ? 1 : 0;

        // if (!activeFilters.includes(e.target.name)) return;

        // if (val === 0 && activeFilters.includes(e.target.name)) val = -1;

        // if (e.target.name === "Turnover" && val < 1) {
        //     setTurnover([]);
        //     return setFilters({ ...filters, [e.target.name]: val, include_turnover_ranges: [] });
        // }

        // savedFilter[0] = Object.values(filters).filter((ele) => ele === 1);

        setFilters({ ...filters, [e.target.name]: val });
    };

    // const handleCheckFilter = (e) => {
    //     const i = activeFilters.indexOf(e.target.name);

    //     if (i > -1) {
    //         if (e.target.name === "Turnover")
    //             setFilters({ ...filters, [e.target.name]: 0, include_turnover_ranges: [] });
    //         else setFilters({ ...filters, [e.target.name]: 0 });

    //         activeFilters.splice(i, 1);
    //         return setActiveFilters([...activeFilters]);
    //     }

    //     setActiveFilters([...activeFilters, e.target.name]);

    //     if (filters[e.target.name] === 0) setFilters({ ...filters, [e.target.name]: -1 });
    // };

    /*const handleChangeTurnover = (vals = []) => {
        setTurnover(vals);

        filters.include_turnover_ranges = vals.map((ele) => ele.value);
        setFilters({ ...filters });
    };*/

    const handleClickSave = (e) => {
        setShowFilters(false);

        // savedFilter[1] = savedFilter[0];
        if (!onSave) return;
        onSave(e, filters);
    };

    return (
        <div className="search_filters relative overflow-visible">
            <FilterHead filters={filters} onClick={(e) => handleClickToggleFilter()} />

            {showFilters && (
                <div className="filter_list w-72 absolute top-full left-0 p-4 mt-5 bg-white rounded-xl border border-primary z-10 shadow-app1">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-medium">Data Filters</h5>

                        <span
                            className="h-8 w-8 f-center bg-gray rounded-full cursor-pointer"
                            onClick={(e) => handleClickToggleFilter(false)}
                        >
                            <MdClose className="text-lg" />
                        </span>
                    </div>

                    {/*<FilterToggleButton
                        label="GST"
                        name="GST_NUMBER"
                        checked={filters.GST_NUMBER === 1 ? true : false}
                        // checkedBox={activeFilters.includes("GST_NUMBER")}
                        onChange={handleChangeFilter}
                        // onCheck={handleCheckFilter}
			/>*/}

                    <FilterToggleButton
                        label="Email"
                        name="include_email"
                        checked={filters.include_email === 1 ? true : false}
                        // checkedBox={activeFilters.includes("include_email")}
                        onChange={handleChangeFilter}
                        // onCheck={handleCheckFilter}
                    />

                    <FilterToggleButton
                        label="Mobile"
                        name="include_mobile"
                        checked={filters.include_mobile === 1 ? true : false}
                        // checkedBox={activeFilters.includes("include_mobile_number")}
                        onChange={handleChangeFilter}
                        // onCheck={handleCheckFilter}
                    />

                    {/*<FilterToggleButton
                        label="Turnover"
                        name="Turnover"
                        checked={filters.Turnover === 1 ? true : false}
                        // checkedBox={activeFilters.includes("Turnover")}
                        onChange={handleChangeFilter}
                        // onCheck={handleCheckFilter}
                    />

                    {filters.Turnover === 1 && (
                        <div className="category mb-5">
                            <label className="text-sm text-gray-500 mb-1 block">Turnover Range</label>

                            <MultiSelect
                                name="include_turnover_ranges"
                                value={turnover}
                                options={[
                                    { value: 1, label: "Rs. 0 to 40 lakhs" },
                                    { value: 2, label: "Rs. 40 lakhs to 1.5 Cr." },
                                    { value: 3, label: "Rs. 1.5 Cr. to 5 Cr." },
                                    { value: 4, label: "Rs. 5 Cr. to 25 Cr." },
                                    { value: 5, label: "Rs. 25 Cr. to 100 Cr." },
                                    { value: 6, label: "Rs. 100 Cr. to 500 Cr." },
                                ]}
                                onChange={handleChangeTurnover}
                            />
                        </div>
							)*/}

                    <Button className="w-full text-white" variant="contained" color="blue" onClick={handleClickSave}>
                        <BsCheckLg className="text-white font-bold" />
                        Save
                    </Button>
                </div>
            )}
        </div>
    );
};

export default IndiamartFilters;
