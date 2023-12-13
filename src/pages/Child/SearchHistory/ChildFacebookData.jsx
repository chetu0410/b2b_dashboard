import { useEffect, useState, useMemo, useContext } from "react";
import { BsCheckLg, BsCalendarFill, BsChevronDown } from "react-icons/bs";
import { FaFileExport } from "react-icons/fa";
import { IoSyncCircleOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

import {
    Button,
    CallIcon,
    CheckBox,
    //Chip,
    //IndiamartFilters,
    Pagination,
    Printer,
    ReportCalendar,
    Spinner,
    //StatusFilter,
    WhatsAppIcon,
    SendMessageComponent,
} from "../../../components";
import { allocateCall, showFacebookData } from "../../../apis";
import FacebookLeadDetails from "./components/FacebookLeadDetails";
import ParentChildContext from "../../../context/ParentChildContext";
import handleError from "../../../utils/errorHandler";
//import WhatsappStatus from "./components/WhatsappStatus";
import Select from "react-select";
import formatDate from "../../../utils/formatDate";
import formatFBAddress from "../../../utils/formatFBAddress";
import formatFBTimestamp from "../../../utils/formatFBTimestamp";

import CallingModel from "./components/CallingModel";
import CallStatus from "./components/CallStatus";

const ChildFacebookData = () => {
    //const { authUser, setAuthUser } = useContext(AuthContext);
    const { selectedUser, setSelectedUser } = useContext(ParentChildContext);

    const navigate = useNavigate();

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

    const child = useMemo(() => {
        try {
            return localStorage.getItem("child") ? JSON.parse(localStorage.getItem("child")) : [];
        } catch (err) {
            return [];
        }
    }, []);

    const fb_forms = useMemo(() => {
        try {
            if (localStorage.getItem("child_fb_forms")) {
                let forms = JSON.parse(localStorage.getItem("child_fb_forms"));
                return forms.form_id.map((value, index) => ({
                    value,
                    label: forms.form_name[index],
                }));
            } else {
                return [];
            }
        } catch (err) {
            return [];
        }
    }, []);

    const [selectedForm, setSelectedForm] = useState(fb_forms.length !== 0 ? fb_forms[0] : null);

    const handleSelectForm = (option) => {
        setSelectedForm(option);
        setPage({ ...page, page: 1 });
        setFilters({ ...filters, form_id: option.value });
    };

    const [leadAdditionalDetails, setLeadAdditionalDetails] = useState({
        child_account_details: child,
        self_account_details: parent,
    });

    const [page, setPage] = useState({
        page: 1,
        total: 0,
        totalPage: 1,
        perPage: 50,
        fetching: false,
        //allocateCall: false,
    });

    const [filters, setFilters] = useState({
        b2b_user_uid: selectedUser.user_uid,
        start_date: null,
        end_date: null,
        ...(selectedForm && { form_id: selectedForm.value }),
    });

    const [callingModel, setCallingModel] = useState({ top: false, bottom: false, child: "" });
    const [sendMessageModel, setSendMessageModel] = useState({ open: false });
    const [dateModel, setDateModel] = useState(false);

    const fetchFacebookData = async (data) => {
        setPage({ ...page, fetching: true });
        try {
            const apiData = { ...data };

            apiData.page_number = page.page;

            const { data: res } = await showFacebookData(apiData);
            if (res.status !== "success") throw new Error(res.data);

            if (res?.data?.results) {
                setLeadData(res?.data?.results);
            } else {
                setLeadData([]);
            }

            setPage({
                ...page,
                total: res?.data?.total_result_count || 0,
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
        if (selectedForm) fetchFacebookData(filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, page.page]);

    const handleClickToggleLeadDetails = (e, open, data = {}) => {
        if (e.target.closest(".discart_model")) return;
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

    const handleSaveRangeDate = (date) => {
        setFilters({
            ...filters,
            start_date: formatDate(date.startDate),
            end_date: formatDate(date.endDate),
        });

        setDateModel(false);
    };

    const handleToggleDateModel = () => {
        setDateModel((prev) => !prev);
    };

    const handleClearRangeDate = () => {
        setFilters({ ...filters, start_date: null, end_date: null });
        setDateModel((prev) => !prev);
    };

    function checkAddressesAvailable() {
        return leadData.some((lead) => {
            return lead.street_address || lead.city || lead.state || lead.zip_code;
        });
    }

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
                integration_flag: 2,
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
            delete ele.b2b_user_uid;
            delete ele.first_name;
            delete ele.last_name;
            delete ele.process_flag;
            delete ele.record_date;
            ele.created_time = formatFBTimestamp(ele.created_time);

            return ele;
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        //let buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        //XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
        XLSX.writeFile(workbook, `Yogleads_Facebook_${selectedForm.label}_Sheet_${Date.now()}.xlsx`);
    };

    const handleClickRefresh = (e) => {
        fetchFacebookData(filters);
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
            if (selectedLeads.length === 0) throw new Error("Select some leads to send message to them");

            setPage({ ...page });
            setSendMessageModel({ ...sendMessageModel, open: !sendMessageModel.open });
        } catch (err) {
            setPage({ ...page });

            console.log(err);

            handleError(err, tId);
        }
    };

    return (
        <div className="facebook_data_page page">
            {/* <section className="intro mb-5">
                <h3 className="text-2xl text-gray-900 font-semibold text-center mb-3">
                    Search High Quality Leads and Send them a
                    <br />
                    Direct Whatsapp message now
                </h3>

                <p className="text-sm text-gray-600 text-center">100K+ Leads are Available in YogLeads</p>
            </section> */}

            <section className="filters mb-5">
                <div className="flex items-center justify-end w-full mb-5 relative">
                    {/*<div className="flex items-center gap-4">
                        <IndiamartFilters onSave={handleSaveFilter} />
                        <StatusFilter onSave={handleSaveFilter} />
                    </div>*/}

                    {/* <SearchInput
                        className="border-2 border-primary"
                        placeholder="Restaurant in Chennai"
                        onChange={handleChangeSearchQuery}
                    /> */}

                    <div className="flex gap-4 items-center justify-right">
                        <Button
                            className="font-semibold"
                            variant="outlined"
                            color="blue"
                            size="sm"
                            onClick={handleToggleDateModel}
                        >
                            <BsCalendarFill className="text-blue-500 text-base" />
                            <span>
                                {filters.start_date ? `${filters.start_date} / ${filters.end_date}` : "Filter by Date"}
                            </span>
                            <BsChevronDown />
                        </Button>

                        {/*<Button variant="outlined" color="green" size="sm" onClick={handleClickSendMessage}>
                            <WhatsAppIcon />
                            <span>Send Message</span>
                        </Button>
                        <Button
                            variant="outlined"
                            color="blue"
                            size="sm"
                            onClick={(e) => handleClickToggleModel(e, "top")}
                        >
                            <CallIcon />
                            <span>Add to Calling List</span>
                        </Button>*/}
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
                    {dateModel && (
                        <div className="z-10">
                            <ReportCalendar
                                startDate={filters.start_date}
                                endDate={filters.end_date ? filters.end_date : formatDate(new Date())}
                                onSave={handleSaveRangeDate}
                                onClose={handleToggleDateModel}
                                onClear={handleClearRangeDate}
                            />
                        </div>
                    )}

                    {/*callingModel.top && (
                        <CallingModel
                            name="top"
                            model={callingModel}
                            data={leadAdditionalDetails}
                            disabled={page.allocateCall}
                            onSelect={(uid) => setCallingModel({ ...callingModel, child: uid })}
                            onSubmit={handleClickAddToCallList}
                            onClose={(name) => setCallingModel({ ...callingModel, [name]: false, child: "" })}
                        />
					)*/}
                </div>

                <div className="flex flex-wrap items-center justify-start gap-2">
                    <p className="text-gray-600 text-sm font-medium">
                        Showing {leadData.length !== 0 ? (page.page - 1) * page.perPage + 1 : 0}-
                        {leadData.length !== page.perPage ? page.total : page.page * leadData.length} of {page.total}
                    </p>

                    <span className="hidden sm:block">|</span>

                    {fb_forms.length === 0 && (
                        <p className="text-md font-bold text-red-500">No linked Facebook Forms found.</p>
                    )}

                    {fb_forms.length !== 0 && (
                        <div className="flex items-center">
                            <label htmlFor="formselect" className="block font-bold text-md text-gray-600 mr-2">
                                Select form to display leads:
                            </label>
                            <Select
                                id="formselect"
                                name="form"
                                value={selectedForm}
                                options={fb_forms}
                                onChange={handleSelectForm}
                                placeholder={"Select Form..."}
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
                    )}
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
                                    <div className="flex items-center">mobile number</div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">email</div>
                                </th>
                                {/*<th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">status</div>
							</th>*/}
                                <th scope="col" className="px-6 py-3">
                                    <div className="flex items-center">created time</div>
                                </th>
                                {checkAddressesAvailable() && (
                                    <th scope="col" className="px-6 py-3">
                                        <div className="flex items-center">full address</div>
                                    </th>
                                )}
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
                                    onClick={(e) => handleClickToggleLeadDetails(e, true, details)}
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
                                            <span className="block text-ellipsis overflow-hidden max-w-[260px]">
                                                {details.full_name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-2 text-ellipsis overflow-hidden max-w-[280px]">
                                        <Printer value={details.phone_number} />
                                    </td>
                                    <td className="px-6 py-2 text-ellipsis overflow-hidden max-w-[280px]">
                                        <Printer value={details.email} />
                                    </td>
                                    {/*<td className="px-6 py-2 text-ellipsis overflow-hidden max-w-[240px]">
                                        <CallStatus
                                            className="!text-white"
                                            leadStatus={details?.call_status?.at(0)}
                                            connectStatus={details?.call_status?.at(1)}
                                        />
								</td>*/}
                                    <td className="px-6 py-2 text-ellipsis overflow-hidden max-w-[240px]">
                                        <Printer value={formatFBTimestamp(details.created_time)} />
                                    </td>
                                    {checkAddressesAvailable() && (
                                        <td className="px-6 py-2 text-ellipsis overflow-hidden max-w-[350px]">
                                            <Printer
                                                value={formatFBAddress(
                                                    details.street_address,
                                                    details.city,
                                                    details.state,
                                                    details.zip_code
                                                )}
                                            />
                                        </td>
                                    )}
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
                                {selectedLeads.length} Select
                            </span>
                        </div>
                        {/*<Button variant="outlined" color="green" size="sm" onClick={handleClickSendMessage}>
                            <WhatsAppIcon />
                            <span>Send Message</span>
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
						)*/}
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
                <div className="lead_details fixed top-20 right-0 bottom-0 max-h-lg max-w-lg w-full">
                    <FacebookLeadDetails
                        key={leadModelDetails.id}
                        data={leadModelDetails}
                        onClose={(e) => handleClickToggleLeadDetails(e, false)}
                        onEdit={handleClickRefresh}
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
                        integrationFlag={2}
                        onClose={(e) => handleClickToggleSendMessage(false)}
                    />
                </section>
            )}
        </div>
    );
};

export default ChildFacebookData;
