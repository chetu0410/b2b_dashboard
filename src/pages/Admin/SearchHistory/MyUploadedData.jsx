import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { BsCheckLg } from "react-icons/bs";
import { IoSyncCircleOutline } from "react-icons/io5";
import { RiMailSendFill } from "react-icons/ri";

import {
    Button,
    CallIcon,
    CheckBox,
    Chip,
    Filters,
    Input,
    Pagination,
    Printer,
    Select,
    SendEmailComponent,
    SendMessageComponent,
    Spinner,
    WhatsAppIcon,
} from "../../../components";
import { allocateCall, getUserUploadedCSVData, uploadCSVToDashboard, deleteLeads } from "../../../apis";
import CallStatus from "./components/CallStatus";
import LeadDetails from "./components/LeadDetails";
import CallingModel from "./components/CallingModel";
import DeleteModel from "./components/DeleteModel";
import formatDate from "../../../utils/formatDate";
import handleError from "../../../utils/errorHandler";
import cookieHelper from "../../../utils/cookieHelper";

const MyUploadedData = () => {
    const navigate = useNavigate();

    const [excelFile, setExcelFile] = useState(null);

    const [leadData, setLeadData] = useState([]);
    const [leadAdditionalDetails, setLeadAdditionalDetails] = useState({
        child_account_details: [],
        self_account_details: {},
        recent_data_tags: [],
    });

    const [selectedLeads, setSelectedLeads] = useState([]);

    const [leadModelDetails, setLeadModelDetails] = useState({ open: false });

    const [page, setPage] = useState({
        page: 1,
        total: 0,
        totalPage: 1,
        perPage: 50,
        fetching: false,
        allocateCall: false,
    });

    const [filters, setFilters] = useState({
        jwt_token: cookieHelper.getCookie("jwt"),
        GST_NUMBER: 0,
        Turnover: 0,
        include_email: 0,
        include_mobile_number: 0,
        recent_data_tags: 1,
        search_query: "",
        include_turnover_ranges: [],
    });

    const [callingModel, setCallingModel] = useState({ top: false, bottom: false, child: "" });
    const [sendMessageModel, setSendMessageModel] = useState({ open: false });
    const [sendEmailModel, setSendEmailModel] = useState({ open: false });

    const [deleteModel, setDeleteModel] = useState(false);
    const [mustFinalise, setMustFinalise] = useState(false);

    const fetchUserUploadedCSVData = async (data) => {
        setLeadData([]);
        setPage({ ...page, total: 0, totalPage: 1, fetching: true });
        try {
            const apiData = { ...data };

            if (!data.jwt_token) {
                apiData.google_auth_key = localStorage.getItem("access_token");
                delete apiData.jwt_token;
            }

            apiData.page = page.page;

            const { data: res } = await getUserUploadedCSVData(apiData);
            if (res.status !== "success") throw new Error(res.data);

            if (res?.data?.allLeads) {
                setLeadData(res?.data?.allLeads);
            }

            const addtionalData = {};

            if (res?.data?.self_account_details) {
                addtionalData.self_account_details = res.data.self_account_details;

                localStorage.setItem("self", JSON.stringify(res.data.self_account_details));
            }

            if (res?.data?.child_account_details) {
                addtionalData.child_account_details = res.data.child_account_details;
            }

            if (res?.data?.recent_data_tags) {
                addtionalData.recent_data_tags = res.data.recent_data_tags;
            }

            if (res?.data?.generated_jwt_token) {
                cookieHelper.setCookie("jwt", res.data.generated_jwt_token, 6);
            }

            setLeadAdditionalDetails({ ...leadAdditionalDetails, ...addtionalData });
            setPage({
                ...page,
                total: res?.data?.total_results_count || 0,
                totalPage: res?.data?.total_page_count || 1,
                fetching: false,
            });
        } catch (err) {
            handleError(err);
            console.error(err);
            setPage({ ...page, fetching: false });

            if (err.message.includes("google_auth_key")) {
                // const authUrl = `${config.AUTH_ENDPOINT}?client_id=${config.G_CLIENT_ID}&redirect_uri=${config.REDIRECT_URI}&scope=${config.SCOPE}&response_type=code`;
                // window.location.href = authUrl;

                toast.error("Invalid google_auth_key. Please Login again");
                navigate("/dev/auth/login");
            }
        }
    };

    useEffect(() => {
        fetchUserUploadedCSVData(filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, page.page]);

    const handleClickToggleLeadDetails = (e, open, data = {}) => {
        if (e && e.target.closest(".discart_model")) return;
        setLeadModelDetails({ ...leadModelDetails, open, ...data, leadAdditionalDetails: leadAdditionalDetails });
    };

    const handleChangePage = (value) => {
        if (value === page.page) return;
        window.scrollTo({ top: 0 });

        setPage({ ...page, page: value });
    };

    const handleClickToggleRecentSearch = (e, search) => {
        setPage({ ...page, page: 1 });
        if (filters.search_query === "" || filters.search_query !== search)
            setFilters({ ...filters, search_query: search });
        else setFilters({ ...filters, search_query: "" });
    };

    const handleSaveFilter = (e, filters_) => {
        setFilters({ ...filters, ...filters_ });
    };

    const handleToggleAllCheckboxes = (e) => {
        if (leadData.length === selectedLeads.length) return setSelectedLeads([]);

        setSelectedLeads(leadData.map((ele) => ele.id));
    };

    const handleChangeCheckBox = (e, lead) => {
        const i = selectedLeads.indexOf(lead.id);

        if (i > -1) {
            selectedLeads.splice(i, 1);
            return setSelectedLeads([...selectedLeads]);
        }

        setSelectedLeads([...selectedLeads, lead.id]);
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
                parent_user_uid: leadAdditionalDetails.self_account_details.parent_user_uid,
                user_uid: callingModel.child || leadAdditionalDetails.self_account_details.parent_user_uid,
                record_uid: [],
                integration_flag: 0,
            };

            if (selectedLeads.length === 0) throw new Error("Select some leads to add");

            selectedLeads.forEach((id) => {
                const lead = leadData.find((ele) => ele.id === id);
                if (lead && lead.record_uid) data.record_uid.push(lead.record_uid);
            });

            const { data: res } = await allocateCall(data);
            if (res.status !== "success") throw new Error(res.data);

            const updatedData = leadData.map((ele) => {
                if (selectedLeads.indexOf(ele.id) > -1) {
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

    const handleChangeExcelFile = (e) => {
        if (!e.target.files[0]) return;
        setExcelFile(e.target.files[0]);
    };

    const handleClickUpload = async (e) => {
        try {
            if (!excelFile) throw new Error("Select a file to upload");

            setPage({ ...page, fetching: true });

            const formatData = new FormData();
            formatData.append("user_uid", leadAdditionalDetails?.self_account_details?.parent_user_uid);
            formatData.append("file", excelFile);

            const { data } = await uploadCSVToDashboard(formatData);

            if (data.status !== "success") throw new Error(data.data?.toString());

            toast.success("File uploaded successfully");
            window.location.reload();

            setPage({ ...page, fetching: false });
        } catch (err) {
            setPage({ ...page, fetching: false });
            handleError(err);
        }
    };

    const handleClickRefresh = (e) => {
        fetchUserUploadedCSVData(filters);
        setSelectedLeads([]);
    };

    const handleClickToggleDeleteModel = (e) => {
        setDeleteModel((prev) => !prev);
    };

    const handleClickDelete = async (e) => {
        const tId = toast.loading("Deletion in progress. Please wait...");
        try {
            const body = {
                record_uid: [],
            };

            if (selectedLeads.length === 0) throw new Error("Select some leads to delete.");

            selectedLeads.forEach((id) => {
                const lead = leadData.find((ele) => ele.id === id);
                if (lead && lead.record_uid) body.record_uid.push(lead.record_uid);
            });

            const { data: res } = await deleteLeads(body);

            if (res.status !== "success") {
                throw new Error("Something went wrong. Please try again later.");
            } else {
                toast.dismiss(tId);
                toast.success("Deletion Successful!");
                handleClickToggleDeleteModel();
                if (selectedLeads.length === leadData.length && page.page === page.totalPage && page.totalPage !== 1)
                    setPage({ ...page, page: page.totalPage - 1 });
                handleClickRefresh();
            }
        } catch (err) {
            toast.dismiss(tId);
            toast.error("Deletion Failed! Try again later.");
            handleError(err);
        }
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
            setPage({ ...page, whatsappLogin: false });

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
        <div className="uploaded_data_page page">
            <section className="filters mb-5">
                <div className="flex items-center justify-between w-full mb-5 relative">
                    <Filters onSave={handleSaveFilter} onShow={() => {}} />

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

                <div className="flex flex-wrap items-center gap-2 overflow-auto whitespace-nowrap sm:flex-nowrap">
                    <p className="text-gray-600 text-sm font-medium">
                        Showing {leadData.length !== 0 ? (page.page - 1) * page.perPage + 1 : 0}-
                        {leadData.length !== page.perPage ? page.total : page.page * leadData.length} of {page.total}
                    </p>

                    <span className="hidden sm:block">|</span>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <p>Campaign Names: </p>

                        <div className="flex items-center gap-2 overflow-auto">
                            {leadAdditionalDetails.recent_data_tags.map((search, i) => (
                                <Chip
                                    key={i}
                                    title={search}
                                    color={search === filters.search_query ? "green" : "gray"}
                                    onClick={(e) => handleClickToggleRecentSearch(e, search)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="options flex justify-between mt-4 mb-4">
                    <div className="flex items-center gap-4">
                        <p>Options: </p>

                        <div className="relative">
                            <Button
                                variant="outlined"
                                color={excelFile ? "green" : "gray"}
                                size="sm"
                                disabled={page.fetching}
                            >
                                {excelFile ? excelFile?.name : "Select File (excel/csv)"}
                            </Button>

                            <Input
                                className="opacity-0 absolute top-0 left-0 bottom-0 right-0 cursor-pointer"
                                type="file"
                                size="xs"
                                accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .xlsx, .xls, .csv"
                                onChange={handleChangeExcelFile}
                            />
                        </div>

                        <Button variant="contained" color="primary" size="sm" onClick={handleClickUpload}>
                            Upload
                        </Button>

                        <Button
                            variant="contained"
                            color="red"
                            size="sm"
                            onClick={handleClickToggleDeleteModel}
                            disabled={selectedLeads.length === 0}
                        >
                            Delete
                        </Button>
                    </div>
                    <IoSyncCircleOutline
                        size={36}
                        color="gray"
                        onClick={handleClickRefresh}
                        className={`cursor-pointer ${page.fetching ? "animate-spin" : ""}`}
                        title="Synchronize"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <p className="font-semibold">Excel/CSV Template:</p>
                    <a
                        className="text-blue-500 font-semibold underline"
                        href="https://yogleads-app-apk.s3.ap-south-1.amazonaws.com/csv-upload-format/Sample_Template.csv"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Download
                    </a>
                </div>
            </section>

            <section className="table_details">
                <div className="relative overflow-x-auto min-h-[500px]">
                    <table className="w-full text-sm text-left text-gray-900 font-medium">
                        <thead className="text-base text-gray-700 uppercase bg-gray">
                            <tr>
                                <th scope="col" className="p-4">
                                    <CheckBox
                                        checked={leadData.length > 0 && selectedLeads.length === leadData.length}
                                        onChange={handleToggleAllCheckboxes}
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">name</div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">mobile number</div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">email</div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">status</div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">campaign name</div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">address</div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">turnover</div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">entity Type</div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">gst number</div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">category</div>
                                </th>
                            </tr>
                            <tr className="invisible">
                                <th className="invisible px-6 py-3"></th>
                            </tr>
                        </thead>

                        <tbody className="border border-gray-200">
                            {leadData.map((details, i) => (
                                <tr
                                    key={details.id || i}
                                    className={`${
                                        selectedLeads.includes(details.id) ? "bg-gray-200" : "bg-white hover:bg-gray-50"
                                    }`}
                                    onClick={(e) => {
                                        if (!mustFinalise) handleClickToggleLeadDetails(e, true, details);
                                        else handleClickDisabled();
                                    }}
                                >
                                    <td className="w-4 p-4 discart_model">
                                        <CheckBox
                                            checked={selectedLeads.includes(details.id)}
                                            onChange={(e) => handleChangeCheckBox(e, details)}
                                        />
                                    </td>
                                    <td className="px-6 py-2">
                                        <div className="flex items-center">
                                            <span className="block w-4">
                                                {details.call_allocated === 1 && <CallIcon />}
                                            </span>
                                            <span className="block ml-2 capitalize text-ellipsis overflow-hidden max-w-[260px]">
                                                {details.cname}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-2 text-ellipsis overflow-hidden max-w-[280px]">
                                        <Printer value={details.mobile_number} />
                                    </td>
                                    <td className="px-6 py-2 text-ellipsis overflow-hidden max-w-[240px]">
                                        <Printer value={details.email_address} />
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
                                    <td className="px-6 py-2 text-center text-ellipsis overflow-hidden max-w-[240px]">
                                        <Chip
                                            title={<Printer value={details.search_query} />}
                                            color="gray"
                                            className={"text-xs"}
                                        />
                                    </td>
                                    <td className="px-6 py-2 text-ellipsis overflow-hidden max-w-[280px]">
                                        <Printer value={details.address} />
                                    </td>
                                    <td className="px-6 py-2 text-ellipsis overflow-hidden max-w-[280px]">
                                        <Printer value={details.Turnover} />
                                    </td>
                                    <td className="px-6 py-2 text-ellipsis overflow-hidden max-w-[280px]">
                                        <Printer value={details.entity_type} />
                                    </td>
                                    <td className="px-6 py-2 text-ellipsis overflow-hidden max-w-[280px]">
                                        <Chip title={<Printer value={details.GST_NUMBER} />} variant="outlined" />
                                    </td>
                                    <td className="px-6 py-2 text-ellipsis overflow-hidden max-w-[280px]">
                                        <Printer value={details.nature_of_business} />
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
                <section className="lead_details fixed top-20 right-0 bottom-0 max-h-lg max-w-xl w-full">
                    <LeadDetails
                        key={leadModelDetails.id}
                        data={leadModelDetails}
                        onClose={(e) => handleClickToggleLeadDetails(e, false)}
                        onEdit={handleClickRefresh}
                        sourceFlag={1}
                        handleMustFinalise={handleMustFinalise}
                    />
                </section>
            )}

            {deleteModel && (
                <DeleteModel
                    selectedLeads={selectedLeads}
                    handleClickDelete={handleClickDelete}
                    onClose={handleClickToggleDeleteModel}
                />
            )}

            {sendMessageModel.open && (
                <section className="send_message_details fixed top-0 right-0 bottom-0 h-full max-w-l w-full">
                    <SendMessageComponent
                        user_uid={leadAdditionalDetails.self_account_details.parent_user_uid}
                        email={leadAdditionalDetails.self_account_details.email}
                        leadData={leadData}
                        selectedLeads={selectedLeads}
                        integrationFlag={0}
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
                        integrationFlag={0}
                        onClose={handleClickToggleSendEmail}
                    />
                </section>
            )}
        </div>
    );
};

export default MyUploadedData;
