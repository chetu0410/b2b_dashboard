import { useEffect, useMemo, useState } from "react";
import { BsCheckLg } from "react-icons/bs";
import { MdClose } from "react-icons/md";

import Button from "../Button/Button";
import FilterHead from "./components/FilterHead";
import FilterToggleButton from "./components/FilterToggleButton";
import Select from "../Select/Select";
import { leadVariant as _leadVariant, connectVariant as _connectVariant } from "../../constants/callStatusConstants";

const StatusFilter = ({ onSave, stat, onShow }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        connect_status: 0,
        lead_status: 0,
        // custom_status: 0,
        include_connect_status: -1,
        include_lead_status: -1,
        // include_custom_flag: -1,
    });

    const leadVariant = useMemo(() => _leadVariant.list(), []);
    const connectVariant = useMemo(() => _connectVariant.list(), []);
    const customTagData = localStorage.getItem("ctm_data") ? JSON.parse(localStorage.getItem("ctm_data")) : {};
    const handleClickToggleFilter = () => {
        setShowFilters((prev) => {
            onShow(!prev);
            return !prev;
        });
    };

    useEffect(() => {
        if (!stat) setShowFilters(false);
    }, [stat]);

    const handleChangeFilter = (e, value = null) => {
        let val = e.target.checked ? 1 : 0;

        const name = e.target.name;


        if (
            name === "connect_status" &&
            filters.connect_status === 1 &&
            filters.lead_status === 1 &&
            filters.include_connect_status !== 2
        ) { 
            setFilters({ ...filters, lead_status: 0, include_lead_status: -1 });
            return;
        }
        

        // if (
        //     name === "custom_status" &&
        //     filters.custom_status === 1
        // ) {  
        //     setFilters({ ...filters, custom_status: 0, include_custom_flag: -1 });
        //     return;
        // }

        if (name === "lead_status" && filters.connect_status === 1 && filters.include_connect_status !== 2) return;

        if (name === "include_connect_status" && value !== 2 && filters.lead_status === 1) {
            setFilters({ ...filters, lead_status: 0, include_lead_status: -1, [name]: value || val });
            return;
        }

        setFilters({ ...filters, [name]: value || val });
    };

    const handleClickSave = (e) => {
        setShowFilters(false);

        if (!onSave) return;

        const data = {};
        if (filters.connect_status === 1 && filters.include_connect_status !== -1)
            data.include_connect_status = filters.include_connect_status;
        else data.include_connect_status = -1;

        if (filters.lead_status === 1 && filters.include_lead_status !== -1)
            data.include_lead_status = filters.include_lead_status;
        else data.include_lead_status = -1;

        onSave(e, data);
    };

    return (
        <div className="search_filters relative overflow-visible">
            <FilterHead
                heading="Status"
                filters={{
                    connect_status: filters.connect_status,
                    lead_status: filters.lead_status,
                    // custom_status: filters.custom_status,
                }}
                onClick={(e) => handleClickToggleFilter(true)}
            />
           
            {showFilters && (
                
                <div className="filter_list w-72 absolute top-full left-0 p-4 mt-5 bg-white rounded-xl border border-primary z-10 shadow-app1">
                    <div className="flex items-center justify-between mb-5">
                        <h5 className="font-medium">Status Filters</h5>

                        <span
                            className="h-8 w-8 f-center bg-gray rounded-full cursor-pointer"
                            onClick={(e) => handleClickToggleFilter(false)}
                        >
                            <MdClose className="text-lg" />
                        </span>
                    </div>



                    {/* <FilterToggleButton
                        label="Custom Tag"
                        name=" custom_status"
                        checked={filters.custom_status === 1 ? true : false}
                        onChange={handleChangeFilter}
                    />

                    {filters.custom_status === 1 && (
                        <Select
                            className="mb-5 !rounded"
                            value={filters.include_custom_flag}
                            name="include_custom_flag"
                            onChange={(e) => handleChangeFilter(e, Number(e.target.value))}
                        >
                            <option value="-1">Select</option>
                            {customTagData.map((connect) => (
                                <option key={connect.value} value={connect.custom_tag}>
                                    {connect.custom_tag}
                                </option>
                            ))}
                        </Select>
                    )} */}

                    <FilterToggleButton
                        label="Connect Status"
                        name="connect_status"
                        checked={filters.connect_status === 1 ? true : false}
                        onChange={handleChangeFilter}
                    />

                    {filters.connect_status === 1 && (
                        <Select
                            className="mb-5 !rounded"
                            value={filters.include_connect_status}
                            name="include_connect_status"
                            onChange={(e) => handleChangeFilter(e, Number(e.target.value))}
                        >
                            <option value="-1">Select</option>
                            {connectVariant.map((connect) => (
                                <option key={connect.value} value={connect.value}>
                                    {connect.text}
                                </option>
                            ))}
                        </Select>
                    )}

                    {filters.connect_status === 1 && filters.include_connect_status === 2 && (
                        <>
                            <FilterToggleButton
                                label="Lead Status"
                                name="lead_status"
                                checked={filters.lead_status === 1 ? true : false}
                                onChange={handleChangeFilter}
                            />

                            {filters.lead_status === 1 && (
                                <Select
                                    className="mb-5 !rounded"
                                    value={filters.include_lead_status}
                                    name="include_lead_status"
                                    onChange={(e) => handleChangeFilter(e, Number(e.target.value))}
                                >
                                    <option value="-1">Select</option>
                                    {leadVariant.map((lead) => (
                                        <option key={lead.value} value={lead.value}>
                                            {lead.text}
                                        </option>
                                    ))}
                                </Select>
                            )}
                        </>
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

export default StatusFilter;
