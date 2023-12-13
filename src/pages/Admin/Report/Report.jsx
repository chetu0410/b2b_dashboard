import { useState, useMemo, useEffect } from "react";
import { BsCalendarFill, BsChevronDown } from "react-icons/bs";
import { FaRobot } from "react-icons/fa";
import { MdPendingActions } from "react-icons/md";
import { IoSyncCircleOutline } from "react-icons/io5";
import { MdOutlineMailOutline } from "react-icons/md";

import { dashboardReport, pendingLeads, whatsappReport,emailReport, leadbotReport } from "../../../apis";
import { Button, CallIcon, Pagination, ReportCalendar, Spinner, WhatsAppIcon } from "../../../components";
import Select from "react-select";
import formatDate from "../../../utils/formatDate";
import CallReport from "./CallReportTab";
import PendingLeadsTab from "./PendingLeadsTab";
import WhatsAppReportTab from "./WhatsAppReportTab";
import LeadbotReportTab from "./LeadbotReportTab";
import EmailReportTab from "./EmailReportTab";
const integrationOptions = [
    { value: 0, label: "User B2B Leads" },
    { value: 1, label: "IndiaMART Leads" },
    { value: 2, label: "Facebook Leads" },
    { value: 3, label: "TradeIndia Leads" },
];


const Report = () => {
    const [activeTab, setActiveTab] = useState("pending_leads");

    const [callReportData, setCallReportData] = useState([]);
    const [whatsAppReportData, setWhatsAppReportData] = useState([]);
    const [emailReportData, setEmailReportData] = useState([]);
    const [leadbotReportData, setLeadbotReportData] = useState([]);
    const [pendingData, setPendingData] = useState([]);

    const [dateModel, setDateModel] = useState(false);
    const [page, setPage] = useState({
        page: 1,
        total: 0,
        totalPage: 1,
        perPage: 20,
        fetching: false,
        //allocateCall: false,
    });
    const [selectedIntegration, setSelectedIntegration] = useState(integrationOptions[0]);

    const parent = useMemo(() => {
        try {
            return localStorage.getItem("self") ? JSON.parse(localStorage.getItem("self")) : {};
        } catch (err) {
            return {};
        }
    }, []);

    const leadbot_flag = useMemo(() => {
        try {
            return localStorage.getItem("leadbot_integration_flag")
                ? JSON.parse(localStorage.getItem("leadbot_integration_flag"))
                : 0;
        } catch (err) {
            return 0;
        }
    }, []);

    const [filter, setFilter] = useState({
        parent_user_uid: parent.parent_user_uid,
        include_yesterday: 0,
        include_last_week: 0,
        include_last_month: 0,
        from_date: "",
        to_date: formatDate(new Date()),
    });

    const fetchCallReportAnalytics = async (data) => {
        setCallReportData([]);
        setPage({ ...page, fetching: true });
        try {
            const { data: res } = await dashboardReport(data);
            if (res.status !== "success") throw new Error(res.data?.toString());

            setCallReportData(res.data);
            setPage({ ...page, fetching: false });
        } catch (err) {
            setPage({ ...page, fetching: false });
            console.error(err);
        }
    };

    const fetchPendingLeads = async () => {
        setPendingData([]);
        setPage({ ...page, total: 0, totalPage: 1, fetching: true });
        try {
            const body = {
                user_uid: parent.parent_user_uid,
                integration_flag: selectedIntegration.value,
                page: page.page,
            };

            const { data: res } = await pendingLeads(body);
            if (res.status !== "success") throw new Error(res.data?.toString());

            setPendingData(res.data?.allLeads);
            setPage({
                ...page,
                total: res.data?.total_results_count || 0,
                totalPage: res.data?.total_page_count || 1,
                fetching: false,
            });
        } catch (err) {
            setPage({ ...page, fetching: false });
            console.error(err);
        }
    };

    const fetchWhatsappReportAnalytics = async (filter) => {
        setWhatsAppReportData([]);
        setPage({ ...page, fetching: true });
        try {
            const body = { ...filter };
            body.user_uid = filter.parent_user_uid;

            delete body.parent_user_uid;

            const { data } = await whatsappReport(body);
            if (data.status !== "success") throw new Error(data?.data?.toString());

            setWhatsAppReportData(data.data);
            setPage({ ...page, fetching: false });
        } catch (err) {
            setPage({ ...page, fetching: false });
            console.error(err);
        }
    };

    const fetchEmailReportAnalytics = async (filter) => {
        setEmailReportData([]);
        setPage({ ...page, fetching: true });
        try {
            const body = { ...filter };
            body.user_uid = filter.parent_User_uid;
            const { data } = await emailReport(body);
            if (data.status !== "success") throw new Error(data?.data?.toString());

            setEmailReportData(data.data);
            setPage({ ...page, fetching: false });
        } catch (err) {
            setPage({ ...page, fetching: false });
            console.error(err);
        }
    };

    const fetchLeadbotReportAnalytics = async (filter) => {
        setLeadbotReportData([]);
        setPage({ ...page, fetching: true });
        try {
            const body = { ...filter };
            body.user_uid = filter.parent_user_uid;

            delete body.parent_user_uid;

            const { data } = await leadbotReport(body);
            if (data.status !== "success") throw new Error(data?.data?.toString());

            setLeadbotReportData(data.data);
            setPage({ ...page, fetching: false });
        } catch (err) {
            setPage({ ...page, fetching: false });
            console.error(err);
        }
    };

    useEffect(() => {
        if (activeTab === "pending_leads") fetchPendingLeads();
        if (activeTab === "call_report") fetchCallReportAnalytics(filter);
        if (activeTab === "whatsapp_report") fetchWhatsappReportAnalytics(filter);
        if (activeTab === "email_report") fetchEmailReportAnalytics(filter);
        if (activeTab === "leadbot_report") fetchLeadbotReportAnalytics(filter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, page.page, selectedIntegration]);

    const handleClickRefresh = (e) => {
        if (activeTab === "pending_leads") fetchPendingLeads();
        if (activeTab === "call_report") fetchCallReportAnalytics(filter);
        if (activeTab === "whatsapp_report") fetchWhatsappReportAnalytics(filter);
        if (activeTab === "email_report") fetchEmailReportAnalytics(filter);
        if (activeTab === "leadbot_report") fetchLeadbotReportAnalytics(filter);
    };

    const handleChangeStaticDate = (key) => {
        const base = {
            include_yesterday: 0,
            include_last_week: 0,
            include_last_month: 0,
        };

        const val = filter[key] === 1 ? 0 : 1;

        setFilter({ ...filter, ...base, [key]: val });
    };

    const handleSaveRangeDate = (date) => {
        const base = {
            include_yesterday: 0,
            include_last_week: 0,
            include_last_month: 0,
        };

        setFilter({
            ...filter,
            ...base,
            from_date: formatDate(date.startDate),
            to_date: formatDate(date.endDate),
        });

        setDateModel(false);
    };

    const handleToggleDateModel = () => {
        setDateModel((prev) => !prev);
    };

    const handleClearRangeDate = () => {
        setFilter({ ...filter, from_date: "", to_date: formatDate(new Date()) });
        setDateModel((prev) => !prev);
    };

    const handleChangePage = (value) => {
        if (value === page.page) return;
        window.scrollTo({ top: 0 });

        setPage({ ...page, page: value });
    };

    const handleSelectIntegration = (option) => {
        setSelectedIntegration(option);
        setPage({
            page: 1,
            total: 0,
            totalPage: 1,
            perPage: 20,
            fetching: false,
            //allocateCall: false,
        });
    };

    const handleClickPendingLeads = () => {
        setActiveTab("pending_leads");
        fetchPendingLeads();
    };

    const handleClickCallReport = () => {
        setActiveTab("call_report");
        fetchCallReportAnalytics(filter);
    };

    const handleClickWhatsappReport = async () => {
        setActiveTab("whatsapp_report");
        fetchWhatsappReportAnalytics(filter);
    };

    const handleClickEmailReport = async () => {
        setActiveTab("email_report");
        fetchEmailReportAnalytics(filter);
    };
    const handleClickLeadbotReport = () => {
        setActiveTab("leadbot_report");
        fetchLeadbotReportAnalytics(filter);
    };

    return (
        <div className="dashboard_page page">
            <section className="page_header f-center mb-8 pb-4 border-b border-b-gray-200">
                <div className="flex items-center gap-4">
                    <Button
                        className="!text-[15px] !gap-2"
                        variant={activeTab === "pending_leads" ? "contained" : "outlined"}
                        color="blue"
                        size="lg"
                        onClick={handleClickPendingLeads}
                    >
                        <MdPendingActions
                            style={{ fontSize: "24" }}
                            color={activeTab === "pending_leads" ? "#ffffff" : "#2563EB"}
                        />
                        <span>Pending Leads</span>
                    </Button>

                    <Button
                        className="!text-[15px] !gap-2"
                        variant={activeTab === "call_report" ? "contained" : "outlined"}
                        color="blue"
                        size="lg"
                        onClick={handleClickCallReport}
                    >
                        <CallIcon width={20} height={21} color={activeTab === "call_report" ? "#ffffff" : undefined} />
                        <span>Calling Report</span>
                    </Button>

                    <Button
                        className="!text-[15px] !gap-2"
                        variant={activeTab === "whatsapp_report" ? "contained" : "outlined"}
                        color="green"
                        size="lg"
                        onClick={handleClickWhatsappReport}
                    >
                        <WhatsAppIcon
                            width={20}
                            height={21}
                            color={activeTab === "whatsapp_report" ? "#ffffff" : undefined}
                        />
                        <span>WhatsApp Report</span>
                    </Button>
                    
                    <Button
                        className="!text-[15px] !gap-2 "
                        variant={activeTab === "email_report" ? "contained" : "outlined"}
                        color="blue"
                        size="lg"
                        onClick={handleClickEmailReport}
                    >
                        <MdOutlineMailOutline
                            width={20}
                            height={21}
                            color={activeTab === "email_report" ? "#ffffff" : undefined}
                            className="text-xl"
                        />
                        <span>Email Report</span>
                    </Button>
                    {leadbot_flag === 1 && (
                        <Button
                            className="!text-[15px] !gap-2"
                            variant={activeTab === "leadbot_report" ? "contained" : "outlined"}
                            color="green"
                            size="lg"
                            onClick={handleClickLeadbotReport}
                        >
                            <FaRobot
                                style={{ fontSize: "24" }}
                                color={activeTab === "leadbot_report" ? "#ffffff" : "#09D261"}
                            />
                            <span>Leadbot Report</span>
                        </Button>
                    )}
                </div>
            </section>

            <section className="mb-8">
                {activeTab === "pending_leads" && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start gap-2">
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
                        </div>
                        <IoSyncCircleOutline
                            size={36}
                            color="gray"
                            onClick={handleClickRefresh}
                            className={`cursor-pointer ${page.fetching ? "animate-spin" : ""}`}
                            title="Synchronize"
                        />
                    </div>
                )}
                {activeTab !== "pending_leads" && (
                    <div className="flex items-center justify-end gap-3 relative">
                        <Button
                            className="font-semibold"
                            variant="outlined"
                            color="blue"
                            size="sm"
                            onClick={handleToggleDateModel}
                        >
                            <BsCalendarFill className="text-blue-500 text-base" />
                            <span>{filter.from_date ? `${filter.from_date} / ${filter.to_date}` : "Select date"}</span>
                            <BsChevronDown />
                        </Button>

                        <Button
                            className="font-semibold"
                            variant={filter.include_yesterday === 1 ? "filled" : "outlined"}
                            color="blue"
                            size="sm"
                            onClick={(e) => handleChangeStaticDate("include_yesterday")}
                        >
                            Yesterday
                        </Button>

                        <Button
                            className="font-semibold"
                            variant={filter.include_last_week === 1 ? "filled" : "outlined"}
                            color="blue"
                            size="sm"
                            onClick={(e) => handleChangeStaticDate("include_last_week")}
                        >
                            Last 7 Days
                        </Button>

                        <Button
                            className="font-semibold"
                            variant={filter.include_last_month === 1 ? "filled" : "outlined"}
                            color="blue"
                            size="sm"
                            onClick={(e) => handleChangeStaticDate("include_last_month")}
                        >
                            Last 30 Days
                        </Button>

                        <IoSyncCircleOutline
                            size={36}
                            color="gray"
                            onClick={handleClickRefresh}
                            className={`cursor-pointer ${page.fetching ? "animate-spin" : ""}`}
                            title="Synchronize"
                        />

                        {dateModel && (
                            <ReportCalendar
                                startDate={filter.from_date}
                                endDate={filter.to_date}
                                onSave={handleSaveRangeDate}
                                onClose={handleToggleDateModel}
                                onClear={handleClearRangeDate}
                            />
                        )}
                    </div>
                )}
            </section>

            {activeTab === "call_report" && <CallReport fetching={page.fetching} data={callReportData} />}
            {activeTab === "pending_leads" && (
                <PendingLeadsTab
                    fetching={page.fetching}
                    data={pendingData}
                    integrationFlag={selectedIntegration.value}
                    onUpdate={handleClickRefresh}
                />
            )}
            {activeTab === "whatsapp_report" && (
                <WhatsAppReportTab fetching={page.fetching} data={whatsAppReportData} />
            )}
            {activeTab === "email_report" && (
                <EmailReportTab fetching={page.fetching} data={emailReportData} />
            )}
            {activeTab === "leadbot_report" && <LeadbotReportTab fetching={page.fetching} data={leadbotReportData} />}

            {activeTab === "call_report" && !page.fetching && callReportData.length === 0 && (
                <p className="text-center text-xl">No call data found.</p>
            )}

            {activeTab === "pending_leads" && !page.fetching && pendingData.length === 0 && (
                <p className="text-center text-xl">No pending calls found.</p>
            )}

            {activeTab === "whatsapp_report" && !page.fetching && whatsAppReportData.length === 0 && (
                <p className="text-center text-xl">No whatsapp data found.</p>
            )}

            {activeTab === "leadbot_report" && !page.fetching && leadbotReportData.length === 0 && (
                <p className="text-center text-xl">No leadbot data found.</p>
            )}

            {page.fetching && (
                <div className="f-center">
                    <Spinner />
                </div>
            )}

            {activeTab === "pending_leads" && page.totalPage !== 1 && (
                <div className="flex items-center justify-center p-4">
                    <Pagination
                        total={page.totalPage * page.perPage}
                        perPage={page.perPage}
                        page={page.page}
                        onChange={handleChangePage}
                    />
                </div>
            )}
        </div>
    );
};

export default Report;