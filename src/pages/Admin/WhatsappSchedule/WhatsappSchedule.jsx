import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import { MdUpcoming } from "react-icons/md";
import { RiChatHistoryFill } from "react-icons/ri";
import { IoSyncCircleOutline } from "react-icons/io5";

import { Button } from "../../../components";
import UpcomingTab from "./UpcomingTab";
import HistoryTab from "./HistoryTab";

const scheduleAPI = axios.create({
    baseURL: "https://wa-mktg.trending-trends.com",
});

const WhatsappSchedule = () => {
    const [activeTab, setActiveTab] = useState("upcoming");
    const [scheduleData, setScheduleData] = useState([]);

    const [page, setPage] = useState({
        page: 1,
        total: 0,
        totalPage: 1,
        perPage: 20,
        fetching: false,
    });

    const parent = useMemo(() => {
        try {
            return localStorage.getItem("self") ? JSON.parse(localStorage.getItem("self")) : {};
        } catch (err) {
            return {};
        }
    }, []);

    const [filter, setFilter] = useState({
        parent_user_uid: parent.parent_user_uid,
        // include_yesterday: 0,
        // include_last_week: 0,
        // include_last_month: 0,
        // from_date: "",
        // to_date: formatDate(new Date()),
    });

    const fetchUpcomingSchedule = async (filter) => {
        setScheduleData([]);
        setPage({ ...page, fetching: true });
        try {
            const body = { user_uid: filter.parent_user_uid };

            const { data } = await scheduleAPI.post("/get_scheduled_messages", body);
            if (data.status !== "success") throw new Error(data?.data?.toString());

            setScheduleData(data.data);
            setPage({ ...page, fetching: false });
        } catch (err) {
            setPage({ ...page, fetching: false });
            console.error(err);
        }
    };

    const fetchScheduleHistory = async (filter) => {
        setScheduleData([]);
        setPage({ ...page, fetching: true });
        try {
            const body = { user_uid: filter.parent_user_uid };

            const { data } = await scheduleAPI.post("/get_history_messages", body);
            if (data.status !== "success") throw new Error(data?.data?.toString());

            setScheduleData(data.data);
            setPage({ ...page, fetching: false });
        } catch (err) {
            setPage({ ...page, fetching: false });
            console.error(err);
        }
    };

    useEffect(() => {
        if (activeTab === "upcoming") fetchUpcomingSchedule(filter);
        if (activeTab === "history") fetchScheduleHistory(filter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter]);

    const handleClickRefresh = (e) => {
        if (activeTab === "upcoming") fetchUpcomingSchedule(filter);
        if (activeTab === "history") fetchScheduleHistory(filter);
    };

    const handleClickUpcoming = () => {
        setActiveTab("upcoming");
        fetchUpcomingSchedule(filter);
    };

    const handleClickHistory = () => {
        setActiveTab("history");
        fetchScheduleHistory(filter);
    };

    return (
        <div className="dashboard_page page">
            <section className="page_header f-center mb-4 pb-4 border-b border-b-gray-200">
                <div className="flex items-center gap-4">
                    <Button
                        className="!text-[15px] !gap-2"
                        variant={activeTab === "upcoming" ? "contained" : "outlined"}
                        color="green"
                        size="lg"
                        onClick={handleClickUpcoming}
                    >
                        <MdUpcoming
                            size={24}
                            color={activeTab === "upcoming" ? "#ffffff" : "#09D261"}
                        />
                        <span>Upcoming Schedules</span>
                    </Button>

                    {
                        <Button
                            className="!text-[15px] !gap-2"
                            variant={activeTab === "history" ? "contained" : "outlined"}
                            color="green"
                            size="lg"
                            onClick={handleClickHistory}
                        >
                            <RiChatHistoryFill
                                size={24}
                                color={activeTab === "history" ? "#ffffff" : "#09D261"}
                            />
                            <span>7-Day Schedule History</span>
                        </Button>
                    }
                </div>
            </section>

            <section className="mb-4">
                <div className="flex items-center justify-end">
                    {/*<div className="flex items-center justify-start gap-2">
                            <p className="text-gray-600 text-sm font-medium">
                                Showing {pendingData.length !== 0 ? (page.page - 1) * page.perPage + 1 : 0}-
                                {pendingData.length < page.perPage ? page.total : page.page * pendingData.length} of{" "}
                                {page.total}
                            </p>

                            <span className="hidden sm:block">|</span>

                            <div className="flex items-center">
                                <label htmlFor="formselect" className="block font-bold text-md text-gray-600 mr-2">
                                    Select Integration to see Pending Leads:
                                </label>
                                <Select
                                    id="formselect"
                                    name="form"
                                    value={selectedIntegration}
                                    options={integrationOptions}
                                    onChange={handleSelectIntegration}
                                    placeholder={"Select..."}
                                    styles={{
                                        // To make the select wider
                                        control: (provided) => ({
                                            ...provided,
                                            width: "250px", // Adjust the width as needed
                                            borderColor: provided.isFocused ? "#000000" : "#CCCCCC", // Change the border color here
                                        }),
                                    }}
                                    //className="mr-4" // Add margin-right to the Select component
                                />
                            </div>
                        </div>*/}
                    <IoSyncCircleOutline
                        size={36}
                        color="gray"
                        onClick={handleClickRefresh}
                        className={`cursor-pointer ${page.fetching ? "animate-spin" : ""}`}
                        title="Synchronize"
                    />
                </div>
            </section>

            {activeTab === "upcoming" && <UpcomingTab fetching={page.fetching} data={scheduleData} />}

            {activeTab === "history" && <HistoryTab fetching={page.fetching} data={scheduleData} />}
        </div>
    );
};

export default WhatsappSchedule;
