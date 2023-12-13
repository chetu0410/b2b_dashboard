import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";

import { BsCheckLg } from "react-icons/bs";
import { FaFileExport } from "react-icons/fa";
import { IoSyncCircleOutline } from "react-icons/io5";
import { RiMailSendFill } from "react-icons/ri";

import * as XLSX from "xlsx";

import {
    Button,
    CallIcon,
    CheckBox,
    Chip,
    CombinedFilters,
    IndiamartFilters,
    Pagination,
    Printer,
    Select,
    SendEmailComponent,
    SendMessageComponent,
    Spinner,
    StatusFilter,
    WhatsAppIcon,
} from "../../../components";

import { allocateCall, showIndiamartData } from "../../../apis";
import IndiamartLeadDetails from "./components/IndiamartLeadDetails";
import formatDate from "../../../utils/formatDate";
import handleError from "../../../utils/errorHandler";
import WhatsappStatus from "./components/WhatsappStatus";
import CallingModel from "./components/CallingModel";
import CallStatus from "./components/CallStatus";

const IndiamartData = () => {
    const [leadData, setLeadData] = useState([]);
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [leadModelDetails, setLeadModelDetails] = useState({ open: false });

    const parent = useMemo(() => {
        try {
            return localStorage.getItem("self") ? JSON.parse(localStorage.getItem("self")) : {};
        } catch (err) {
            return {};
        }
    }, []);

    //const parent = { parent_user_uid: "fde83688-e9cd-44bd-bda8-ed7462fc2038" };

    const child = useMemo(() => {
        try {
            return localStorage.getItem("child") ? JSON.parse(localStorage.getItem("child")) : [];
        } catch (err) {
            return [];
        }
    }, []);

    const [leadAdditionalDetails, setLeadAdditionalDetails] = useState({
        child_account_details: child,
        self_account_details: parent,
        top_five_categories: [],
    });

    const [page, setPage] = useState({
        page: 1,
        total: 0,
        totalPage: 1,
        perPage: 50,
        fetching: false,
        allocateCall: false,
    });

    const [filters, setFilters] = useState({
        b2b_user_uid: parent.parent_user_uid,
        include_email: 0,
        include_mobile: 0,
        include_category: "",
    });

    const [callingModel, setCallingModel] = useState({ top: false, bottom: false, child: "" });
    const [sendMessageModel, setSendMessageModel] = useState({ open: false });
    const [sendEmailModel, setSendEmailModel] = useState({ open: false });

    const [mustFinalise, setMustFinalise] = useState(false);

    const fetchIndiamartData = async (data) => {
        setLeadData([]);
        setPage({ ...page, total: 0, totalPage: 1, fetching: true });
        try {
            const apiData = { ...data };

            apiData.page = page.page;

            const { data: res } = await showIndiamartData(apiData);
            if (res.status !== "success") throw new Error(res.data);

            if (res?.data?.allLeads) {
                setLeadData(res?.data?.allLeads);
            }

            const addtionalData = {};

            if (res?.top_five_categories) {
                addtionalData.top_five_categories = res.top_five_categories;
            }

            setLeadAdditionalDetails({ ...leadAdditionalDetails, ...addtionalData });
            setPage({
                ...page,
                total: res?.total_results_count || 0,
                totalPage: res?.total_page_count || 1,
                fetching: false,
            });
        } catch (err) {
            handleError(err);
            console.error(err);
            setPage({ ...page, fetching: false });
        }
    };

    useEffect(() => {
        fetchIndiamartData(filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, page.page]);

    const handleClickToggleCategorySearch = (e, category) => {
        setPage({ ...page, page: 1 });
        if (filters.include_category === "" || filters.include_category !== category)
            setFilters({ ...filters, include_category: category });
        else setFilters({ ...filters, include_category: "" });
    };

    const handleClickToggleLeadDetails = (e, open, data = {}) => {
        if (e && e.target.closest(".discart_model")) return;
        setLeadModelDetails({ ...leadModelDetails, open, ...data, leadAdditionalDetails });
    };

    const handleChangePage = (value) => {
        if (value === page.page) return;
        window.scrollTo({ top: 0 });

        setPage({ ...page, page: value });
    };

    const handleSaveFilter = (e, filters_) => {
        setFilters({ ...filters, ...filters_ });
    };

    const handleToggleAllCheckboxes = (e) => {
        if (leadData.length === selectedLeads.length) return setSelectedLeads([]);

        setSelectedLeads(leadData.map((ele) => ele.mongodb_record_id));
    };

    const handleChangeCheckBox = (e, lead) => {
        const i = selectedLeads.indexOf(lead.mongodb_record_id);

        if (i > -1) {
            selectedLeads.splice(i, 1);
            return setSelectedLeads([...selectedLeads]);
        }

        setSelectedLeads([...selectedLeads, lead.mongodb_record_id]);
    };

    const handleClickDisabled = () => {
        toast.error("You must 'Finish' updating the current lead first!");
    };

    const handleMustFinalise = (e) => {
        setMustFinalise(e);
    };

    const handleClickToggleModel = async (e, name) => {
        setCallingModel({ ...callingModel, [name]: !callingModel[name] });
    };

    const handleClickAddToCallList = async (e, name) => {
        const tId = toast.loading("Adding to call list...");
        setPage({ ...page, allocateCall: true });
        try {
            const data = {
                parent_user_uid: parent.parent_user_uid,
                user_uid: callingModel.child || parent.parent_user_uid,
                record_uid: [],
                integration_flag: 1,
            };

            if (selectedLeads.length === 0) throw new Error("Select some leads to add");

            selectedLeads.forEach((mongodb_record_id) => {
                const lead = leadData.find((ele) => ele.mongodb_record_id === mongodb_record_id);
                if (lead && lead.mongodb_record_id) data.record_uid.push(lead.mongodb_record_id);
            });

            const { data: res } = await allocateCall(data);
            if (res.status !== "success") throw new Error(res.data);

            const updatedData = leadData.map((ele) => {
                if (selectedLeads.indexOf(ele.mongodb_record_id) > -1) {
                    ele.call_allocated = 1;
                }
                return ele;
            });

            setPage({ ...page, allocateCall: false });
            setCallingModel({ ...callingModel, top: false, bottom: false, child: "" });
            setSelectedLeads([]);
            setLeadData(updatedData);

            toast.success("Added to call List", { id: tId });
        } catch (err) {
            setPage({ ...page, allocateCall: false });
            console.log(err);
            handleError(err, tId);
        }
    };

    const handleClickExportToExcel = (e) => {
        const data = JSON.parse(JSON.stringify(leadData)).map((ele) => {
            delete ele.mongodb_record_id;

            return ele;
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        //let buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        //XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
        XLSX.writeFile(workbook, `Yogleads_Indiamart_Sheet_${Date.now()}.xlsx`);
    };

    const handleClickRefresh = (e) => {
        fetchIndiamartData(filters);
        setSelectedLeads([]);
    };

    const handleClickToggleSendMessage = (open) => {
        setSendMessageModel({ ...sendMessageModel, open: !sendMessageModel.open });
        if (open === false) setSelectedLeads([]);
    };

    const handleClickSendMessage = async (e, name) => {
        const tId = toast;
        setPage({ ...page });
        try {
            //if (selectedLeads.length === 0) throw new Error("Select some leads to send message to them");

            setPage({ ...page });
            setSendMessageModel({ ...sendMessageModel, open: !sendMessageModel.open });
        } catch (err) {
            setPage({ ...page });

            console.log(err);

            handleError(err, tId);
        }
    };

    const handleClickToggleSendEmail = () => {
        setSendEmailModel({ ...sendEmailModel, open: !sendEmailModel.open });
        setSelectedLeads([]);
    };

    const handleClickSendEmail = async (e, name) => {
        const tId = toast;
        setPage({ ...page });
        try {
            //if (selectedLeads.length === 0) throw new Error("Select some leads to send email to them!");

            setPage({ ...page });
            setSendEmailModel({ ...sendEmailModel, open: !sendEmailModel.open });
        } catch (err) {
            setPage({ ...page });

            console.log(err);

            handleError(err, tId);
        }
    };

    return (
        <div className="indiamart_data_page page">
            {/* <section className="intro mb-5">
                <h3 className="text-2xl text-gray-900 font-semibold text-center mb-3">
                    Search High Quality Leads and Send them a
                    <br />
                    Direct Whatsapp message now
                </h3>

                <p className="text-sm text-gray-600 text-center">100K+ Leads are Available in YogLeads</p>
            </section> */}

            <section className="filters mb-5">
                <div className="flex items-center justify-between w-full mb-5 relative">
                    <CombinedFilters integrationFlag={1} onSave={handleSaveFilter} />
                    {/* <SearchInput
                        className="border-2 border-primary"
                        placeholder="Restaurant in Chennai"
                        onChange={handleChangeSearchQuery}
                    /> */}
                    <div className="flex gap-4 items-center justify-right">
                        <Button variant="outlined" color="green" size="sm" onClick={handleClickSendMessage}>
                            <WhatsAppIcon />
                            <span>Send Message</span>
                        </Button>

                        <Button variant="outlined" color="yellow" size="sm" onClick={handleClickSendEmail}>
                            <RiMailSendFill size={20} color="#EAB308" />
                            <span>Schedule Email</span>
                        </Button>

                        <Button
                            variant="outlined"
                            color="blue"
                            size="sm"
                            onClick={(e) => handleClickToggleModel(e, "top")}
                        >
                            <CallIcon />
                            <span>Add to Calling List</span>
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            size="sm"
                            onClick={handleClickExportToExcel}
                            disabled={leadData.length === 0 ? true : false}
                        >
                            Export as Excel
                            <FaFileExport />
                        </Button>
                    </div>
                    {callingModel.top && (
                        <CallingModel
                            name="top"
                            model={callingModel}
                            data={leadAdditionalDetails}
                            disabled={page.allocateCall}
                            onSelect={(uid) => setCallingModel({ ...callingModel, child: uid })}
                            onSubmit={handleClickAddToCallList}
                            onClose={(name) => setCallingModel({ ...callingModel, [name]: false, child: "" })}
                        />
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2 overflow-auto whitespace-nowrap pb-2 sm:flex-nowrap">
                    <p className="text-gray-600 text-sm font-medium">
                        Showing {leadData.length !== 0 ? (page.page - 1) * page.perPage + 1 : 0}-
                        {leadData.length !== page.perPage ? page.total : page.page * leadData.length} of {page.total}
                    </p>

                    <span className="hidden sm:block">|</span>

                    <div className="flex items-center gap-2">
                        <p>Top Categories: </p>

                        <div className="f-center gap-2 overflow-auto">
                            {leadAdditionalDetails.top_five_categories.map((category, i) => (
                                <Chip
                                    key={i}
                                    title={category}
                                    color={category === filters.include_category ? "green" : "gray"}
                                    onClick={(e) => handleClickToggleCategorySearch(e, category)}
                                    // onCancel={(e) => setFilters({ ...filters, search_query: "" })}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="options flex justify-end mt-1">
                    <IoSyncCircleOutline
                        size={36}
                        color="gray"
                        onClick={handleClickRefresh}
                        className={`cursor-pointer ${page.fetching ? "animate-spin" : ""}`}
                        title="Synchronize"
                    />
                </div>
            </section>

            <section className="table_details">
                <div className="relative overflow-x-auto min-h-[500px]">
                    <table className="w-full text-sm text-left text-gray-900 font-medium">
                        <thead className="text-base text-gray-700 uppercase bg-gray">
                            <tr>
                                <th scope="col" className="p-4">
                                    <CheckBox
                                        checked={selectedLeads.length === leadData.length}
                                        onChange={handleToggleAllCheckboxes}
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">name</div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">sender company</div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">mobile number</div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">email</div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">autoResponder</div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">status</div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">query product</div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">query category</div>
                                </th>

                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">subject</div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">query time</div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">address</div>
                                </th>
                            </tr>
                            <tr className="invisible">
                                <th className="invisible px-6 py-3"></th>
                            </tr>
                        </thead>

                        <tbody className="border border-gray-200">
                            {leadData.map((details, i) => (
                                <tr
                                    key={details.mongodb_record_id || i}
                                    className={`${
                                        selectedLeads.includes(details.mongodb_record_id)
                                            ? "bg-gray-200"
                                            : "bg-white hover:bg-gray-50"
                                    }`}
                                    onClick={(e) => {
                                        if (!mustFinalise) handleClickToggleLeadDetails(e, true, details);
                                        else handleClickDisabled();
                                    }}
                                >
                                    <td className="w-4 p-4 discart_model">
                                        <CheckBox
                                            checked={selectedLeads.includes(details.mongodb_record_id)}
                                            onChange={(e) => handleChangeCheckBox(e, details)}
                                        />
                                    </td>
                                    <td className="px-6 py-2">
                                        <div className="flex items-center">
                                            <span className="block w-4">
                                                {details.call_allocated === 1 && <CallIcon />}
                                            </span>
                                            <span className="block ml-2 text-ellipsis overflow-hidden max-w-[260px]">
                                                {details.sender_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-2 text-ellipsis overflow-hidden max-w-[260px]">
                                        <Printer value={details.sender_company} />
                                    </td>
                                    <td className="px-6 py-2 text-ellipsis overflow-hidden max-w-[280px]">
                                        <Printer value={details.mobile} />
                                    </td>
                                    <td className="px-6 py-2 text-ellipsis overflow-hidden max-w-[280px]">
                                        <Printer value={details.email} />
                                    </td>
                                    <td className="px-6 py-2 flex items-center justify-center text-ellipsis overflow-hidden max-w-[250px]">
                                        <WhatsappStatus
                                            leadbotMsgSent={details.leadbot_msg_sent}
                                            leadbotMsgSeen={details.leadbot_msg_seen}
                                            leadbotMsgReplied={details.leadbot_msg_replied}
                                            leadbotResponse={details.leadbot_response}
                                        />
                                    </td>
                                    <td className="px-6 py-2 text-ellipsis overflow-hidden max-w-[240px]">
                                        <CallStatus
                                            className="!text-white"
                                            leadStatus={details?.call_status?.at(0)}
                                            connectStatus={details?.call_status?.at(1)}
                                            callDate={
                                                details.call_back_date
                                                    ? formatDate(new Date(details.call_back_date), "dd-mm-yyyy")
                                                    : ""
                                            }
                                        />
                                    </td>
                                    <td
                                        className="px-6 py-2 text-ellipsis overflow-hidden max-w-[280px]"
                                        title={details.query_product_name}
                                    >
                                        <Printer value={details.query_product_name} />
                                    </td>
                                    <td
                                        className="px-6 py-2 text-ellipsis overflow-hidden max-w-[240px]"
                                        title={details.query_mcat_name}
                                    >
                                        <Printer value={details.query_mcat_name} />
                                    </td>
                                    <td
                                        className="px-6 py-2 text-ellipsis overflow-hidden max-w-[280px]"
                                        title={details.query_message.replace(/<br>/g, "\n")}
                                    >
                                        <Printer value={details.subject} />
                                    </td>
                                    <td className="px-6 py-2 text-ellipsis overflow-hidden max-w-[240px]">
                                        <Printer value={details.query_time} />
                                    </td>
                                    <td className="px-6 py-2 text-ellipsis overflow-hidden max-w-[350px]">
                                        <Printer value={details.full_address} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!page.fetching && leadData.length === 0 && (
                        <p className="text-center text-xl">No leads were found</p>
                    )}
                    {page.fetching && (
                        <div className="f-center absolute top-0 bottom-0 left-0 right-0 bg-model">
                            <Spinner />
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4 relative overflow-visible">
                        <div className="flex items-center gap-1">
                            {selectedLeads.length !== 0 && <BsCheckLg className="text-green-600 font-bold" />}

                            <span className={selectedLeads.length === 0 ? "text-gray-600" : "text-green-600"}>
                                {selectedLeads.length} Selected
                            </span>
                        </div>

                        <Button variant="outlined" color="green" size="sm" onClick={handleClickSendMessage}>
                            <WhatsAppIcon />
                            <span>Send Message</span>
                        </Button>

                        <Button variant="outlined" color="yellow" size="sm" onClick={handleClickSendEmail}>
                            <RiMailSendFill size={20} color="#EAB308" />
                            <span>Schedule Email</span>
                        </Button>

                        <Button
                            variant="outlined"
                            color="blue"
                            size="sm"
                            disabled={page.allocateCall}
                            onClick={(e) => handleClickToggleModel(e, "bottom")}
                        >
                            <CallIcon />
                            <span>Add to Calling List</span>
                        </Button>

                        {callingModel.bottom && (
                            <CallingModel
                                name="bottom"
                                model={callingModel}
                                data={leadAdditionalDetails}
                                disabled={page.allocateCall}
                                onSelect={(uid) => setCallingModel({ ...callingModel, child: uid })}
                                onSubmit={handleClickAddToCallList}
                                onClose={(name) => setCallingModel({ ...callingModel, [name]: false, child: "" })}
                            />
                        )}
                    </div>

                    <Pagination
                        total={page.totalPage * page.perPage}
                        perPage={page.perPage}
                        page={page.page}
                        onChange={handleChangePage}
                    />

                    <div className="flex items-center gap-2 invisible">
                        <p className="whitespace-nowrap">List Per Page</p>
                        <Select defaultValue="20" variant="outlined" color="green">
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </Select>
                    </div>
                </div>
            </section>

            {leadModelDetails.open && (
                <div className="lead_details fixed top-20 right-0 bottom-0 max-h-lg max-w-xl w-full">
                    <IndiamartLeadDetails
                        key={leadModelDetails.id}
                        data={leadModelDetails}
                        onClose={(e) => handleClickToggleLeadDetails(e, false)}
                        onEdit={handleClickRefresh}
                        handleMustFinalise={handleMustFinalise}
                    />
                </div>
            )}

            {sendMessageModel.open && (
                <section className="send_message_details fixed top-0 right-0 bottom-0 h-full max-w-l w-full">
                    <SendMessageComponent
                        user_uid={parent.parent_user_uid}
                        email={parent.email}
                        leadData={leadData}
                        selectedLeads={selectedLeads}
                        integrationFlag={1}
                        onClose={(e) => handleClickToggleSendMessage(false)}
                    />
                </section>
            )}

            {sendEmailModel.open && (
                <section className="send_email fixed top-0 right-0 bottom-0 h-full max-w-l w-full">
                    <SendEmailComponent
                        user_uid={leadAdditionalDetails.self_account_details.parent_user_uid}
                        email={leadAdditionalDetails.self_account_details.email}
                        leadData={leadData}
                        selectedLeads={selectedLeads}
                        integrationFlag={1}
                        onClose={handleClickToggleSendEmail}
                    />
                </section>
            )}
        </div>
    );
};

export default IndiamartData;
