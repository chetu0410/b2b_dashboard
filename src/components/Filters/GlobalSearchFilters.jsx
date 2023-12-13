import { useEffect, useState } from "react";
import { BsCheckLg } from "react-icons/bs";
import { MdClose } from "react-icons/md";

import Button from "../Button/Button";
import MultiSelect from "../Select/MultiSelect";
import FilterHead from "./components/FilterHead";
import FilterToggleButton from "./components/FilterToggleButton";

const businessActivities = [
    { value: 1, label: "Office / Sale Office" },
    { value: 2, label: "Factory / Manufacturing" },
    { value: 3, label: "Service Provision" },
    { value: 4, label: "Bonded Warehouse" },
    { value: 5, label: "Input Service Distributor (ISD)" },
    { value: 6, label: "EOU / STP / EHTP" },
    { value: 7, label: "Retail Business" },
    { value: 8, label: "Wholesale Business" },
    { value: 9, label: "Warehouse / Depot" },
    { value: 10, label: "Recipient of Goods or Services" },
    { value: 11, label: "Works Contract" },
    { value: 12, label: "Export" },
    { value: 13, label: "Leasing Business" },
    { value: 14, label: "SEZ" },
    { value: 15, label: "Import" },
    { value: 16, label: "Supplier of Services" },
];

const turnoverRanges = [
    { value: 1, label: "Rs. 0 to 40 lakhs" },
    { value: 2, label: "Rs. 40 lakhs to 1.5 Cr." },
    { value: 3, label: "Rs. 1.5 Cr. to 5 Cr." },
    { value: 4, label: "Rs. 5 Cr. to 25 Cr." },
    { value: 5, label: "Rs. 25 Cr. to 100 Cr." },
    { value: 6, label: "Rs. 100 Cr. to 500 Cr." },
    { value: 7, label: "More than Rs. 500 Cr." },
];

const GlobalSearchFilters = ({ onSave }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        include_gst_number: 0,
        use_turnover: 0,
        include_turnover_ranges: [],
        use_activities: 0,
        include_business_activities: [],
    });
    const [turnover, setTurnover] = useState([]);
    const [activities, setActivities] = useState([]);

    const handleClickToggleFilter = () => {
        setShowFilters((prev) => !prev);
    };

    const handleChangeFilter = (e) => {
        let val = e.target.checked ? 1 : 0;

        if (e.target.name === "use_turnover" && val === 0) setTurnover([]);
        if (e.target.name === "use_activities" && val === 0) setActivities([]);

        setFilters({ ...filters, [e.target.name]: val });
    };

    const handleChangeTurnover = (vals = []) => {
        setTurnover(vals);
    };

    useEffect(() => {
        filters.include_turnover_ranges = turnover.map((ele) => ele.value);
        setFilters({ ...filters });
    }, [turnover]);

    const handleChangeActivities = (vals = []) => {
        setActivities(vals);
    };

    useEffect(() => {
        filters.include_business_activities = activities.map((ele) => ele.value);
        setFilters({ ...filters });
    }, [activities]);

    const handleClickSave = (e) => {
        setShowFilters(false);

        if (!onSave) return;
        const { use_turnover, use_activities, ...data } = filters;
        onSave(e, data);
    };

    return (
        <div className="search_filters relative overflow-visible">
            <FilterHead filters={filters} onClick={(e) => handleClickToggleFilter()} />

            {showFilters && (
                <div className="filter_list w-72 absolute top-full left-0 p-4 mt-5 bg-white rounded-xl border border-primary z-10 shadow-app1">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-medium">Search Filters</h5>

                        <span
                            className="h-8 w-8 f-center bg-gray rounded-full cursor-pointer"
                            onClick={(e) => handleClickToggleFilter(false)}
                        >
                            <MdClose className="text-lg" />
                        </span>
                    </div>

                    <FilterToggleButton
                        label="GST"
                        name="include_gst_number"
                        checked={filters.include_gst_number === 1 ? true : false}
                        onChange={handleChangeFilter}
                    />

                    <FilterToggleButton
                        label="Turnover"
                        name="use_turnover"
                        checked={filters.use_turnover === 1 ? true : false}
                        onChange={handleChangeFilter}
                    />

                    {filters.use_turnover === 1 && (
                        <div className="category mb-5">
                            <MultiSelect
                                name="include_turnover_ranges"
                                value={turnover}
                                options={turnoverRanges}
                                onChange={handleChangeTurnover}
                            />
                        </div>
                    )}

                    <FilterToggleButton
                        label="Business Activities"
                        name="use_activities"
                        checked={filters.use_activities === 1 ? true : false}
                        onChange={handleChangeFilter}
                    />

                    {filters.use_activities === 1 && (
                        <div className="category mb-5">
                            <MultiSelect
                                name="include_business_activities"
                                value={activities}
                                options={businessActivities}
                                onChange={handleChangeActivities}
                            />
                        </div>
                    )}

                    <Button className="w-full text-white" variant="contained" color="blue" onClick={handleClickSave}>
                        <BsCheckLg className="text-white font-bold" />
                        Save
                    </Button>
                </div>
            )}
        </div>
    );
};

export default GlobalSearchFilters;
