import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdClose, MdAddCall } from "react-icons/md";
import { FaUserEdit } from "react-icons/fa";
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";
import { Button, CallIcon, Printer, Spinner, UserIcon, WhatsAppIcon } from "../../../../components";
import handleError from "../../../../utils/errorHandler";

import CallingModel from "./CallingModel";
import { allocateCall, callingHistory, editOwnLead } from "../../../../apis";
import CallStatus from "./CallStatus";
import formatDate from "../../../../utils/formatDate";
import extractExecNames from "../../../../utils/extractExecNames";
import Select from "react-select";

const turnoverOptions = [
    { value: 0, label: "(No Change)" },
    { value: 1, label: "Rs. 0 to 40 lakhs" },
    { value: 2, label: "Rs. 40 lakhs to 1.5 Cr." },
    { value: 3, label: "Rs. 1.5 Cr. to 5 Cr." },
    { value: 4, label: "Rs. 5 Cr. to 25 Cr." },
    { value: 5, label: "Rs. 25 Cr. to 100 Cr." },
    { value: 6, label: "Rs. 100 Cr. to 500 Cr." },
    { value: 7, label: "More than Rs. 500 Cr." },
];

const entityOptions = [
    { value: 0, label: "(No Change)" },
    { value: 1, label: "Proprietorship" },
    { value: 2, label: "Private Limited Company" },
    { value: 3, label: "Public Limited Company" },
    { value: 4, label: "Partnership" },
    { value: 5, label: "Limited Liability Partnership" },
    //{ value: 6, label: "Other" },
];

const LeadDetails = ({ data = {}, onClose, onEdit, sourceFlag = 0 }) => {
    const [whatsappModel, setWhatsappModel] = useState(false);
    const [callingModel, setCallingModel] = useState({ top: false, bottom: false, child: "" });
    const [callData, setCallData] = useState([]);
    const [leadData, setLeadData] = useState(data);

    const [page, setPage] = useState({ page: 1, fetching: false, allocateCall: false });

    const [turnover, setTurnover] = useState(null);
    const [entityType, setEntityType] = useState(null);

    const [isEditing, setIsEditing] = useState(false);

    const [editedData, setEditedData] = useState({
        cname: leadData.cname || "",
        executive_name: extractExecNames(leadData.executive_name) || "",
        mobile_number: leadData.mobile_number || "",
        email_address: leadData.email_address || "",
        address: leadData.address || "",
        GST_NUMBER: leadData.GST_NUMBER || "",
        entity_type: leadData.entity_type || "",
        nature_of_business: leadData.nature_of_business || "",
        web_link: leadData.web_link || "",
        Turnover: findTurnoverValue(),
    });

    const handleInputChange = (field, value) => {
        setEditedData({ ...editedData, [field]: value });
    };

    const handleTurnoverChange = (option) => {
        setTurnover(option);
        setEditedData({ ...editedData, Turnover: option.value });
    };

    const handleEntityTypeChange = (option) => {
        setEntityType(option);
        setEditedData({ ...editedData, entity_type: option.label });
    };

    const fetchCallingHistory = async (params, headers) => {
        setPage({ ...page, fetching: true });
        try {
            const body = {};
            if (data.record_uid) body.record_uid = data.record_uid;

            const { data: res } = await callingHistory(body, params, headers);
            if (res.status !== "success") throw new Error(res.data?.toString());

            setCallData(res?.data?.callHistory);
        } catch (err) {
            console.log(err.message);
        } finally {
            setPage({ ...page, fetching: false });
        }
    };

    useEffect(() => {
        setLeadData(data);
    }, [data]);

    useEffect(() => {
        setEditedData({
            cname: leadData.cname || "",
            executive_name: extractExecNames(leadData.executive_name) || "",
            mobile_number: leadData.mobile_number || "",
            email_address: leadData.email_address || "",
            address: leadData.address || "",
            GST_NUMBER: leadData.GST_NUMBER || "",
            entity_type: leadData.entity_type || "",
            nature_of_business: leadData.nature_of_business || "",
            web_link: leadData.web_link || "",
            Turnover: findTurnoverValue(),
        });
    }, [leadData]);

    useEffect(() => {
        fetchCallingHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClickToggleModel = (e) => {
        if (!onClose) return;
        onClose(e);
    };

    const handleClickToggleWhatsAppModel = (e) => {
        setWhatsappModel((prev) => !prev);
    };

    const handleClickToggleCallingModel = async (e, name) => {
        setCallingModel({ ...callingModel, [name]: !callingModel[name] });
    };

    const handleClickAddToCallList = async (e) => {
        const tId = toast.loading("Adding to call list...");
        setPage({ ...page, allocateCall: true });
        try {
            const apiData = {
                parent_user_uid: data?.leadAdditionalDetails?.self_account_details?.parent_user_uid,
                user_uid: callingModel.child || data?.leadAdditionalDetails?.self_account_details?.parent_user_uid,
                record_uid: [data.record_uid],
            };

            const { data: res } = await allocateCall(apiData);
            if (res.status !== "success") throw new Error(res.data);

            setPage({ ...page, allocateCall: false });
            setCallingModel({ ...callingModel, top: false, child: "" });

            toast.success("Added to call List", { id: tId });
        } catch (err) {
            setPage({ ...page, allocateCall: false });

            console.log(err);

            handleError(err, tId);
        }
    };

    const handleClickEdit = (e) => {
        setIsEditing(true);
    };

    const handleClickConfirm = async () => {
        const tId = toast.loading("Editing in progress...");
        let body = {
            parent_user_uid: data?.leadAdditionalDetails?.self_account_details?.parent_user_uid,
            record_uid: data.record_uid,
            ...(sourceFlag && { source_flag: sourceFlag }),
        };
        try {
            body = { ...body, ...editedData };
            if (!turnover || turnover.value === 0) delete body.Turnover;
            if (!entityType || entityType.value === 0) delete body.entity_type;

            const { data: res } = await editOwnLead(body);

            if (res.status !== "success") {
                console.log(res.data);
                throw new Error("Editing failed! Please try again.");
            } else {
                toast.dismiss(tId);
                toast.success("Lead edited successfully!");
                onEdit();

                if (Number.isInteger(body.Turnover)) body.Turnover = findTurnoverLabel(body.Turnover);
                const { parent_user_uid, record_uid, source_flag, ...newData } = body;
                setLeadData({ ...leadData, ...newData });
                setIsEditing(false);
            }
        } catch (err) {
            toast.dismiss(tId);
            toast.error(err.message);
            setIsEditing(false);
        }
    };

    const handleClickCancel = () => {
        setIsEditing(false);
    };

    function findTurnoverValue() {
        if (!leadData.Turnover) return null;

        const matchingOption = turnoverOptions.find((option) => leadData.Turnover.includes(option.label));
        return matchingOption ? matchingOption.value : null;
    }

    function findTurnoverLabel(value) {
        const option = turnoverOptions.find((option) => option.value === value);
        return option ? option.label : null;
    }

    return (
        <div className="lead_detail bg-white px-6 py-4 shadow-app1 max-w-lg w-full h-full overflow-auto overscroll-contain">
            <div className="title flex items-center justify-between mb-5">
                <h5 className="text-lg font-medium">{isEditing ? "Editing Lead" : "Lead Details"}</h5>

                {!isEditing && (
                    <span
                        className="h-8 w-8 f-center bg-gray rounded-full cursor-pointer"
                        onClick={(e) => handleClickToggleModel(e)}
                    >
                        <MdClose className="text-lg" />
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between mb-5">
                <div className="name flex items-center gap-3 mb max-w-[435px] w-full">
                    <UserIcon />
                    {!isEditing && <span>{leadData.cname}</span>}
                    {isEditing && (
                        <input
                            type="text"
                            value={editedData.cname}
                            onChange={(e) => handleInputChange("cname", e.target.value)}
                            className="w-full text-m px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                            placeholder="Not Available"
                        />
                    )}
                </div>
            </div>

            {/*!isEditing && (
                <div className="action_buttons relative flex items-center gap-3 mb-5">
                    <Button
                        className="!text-white !text-[15px] !gap-4"
                        variant="contained"
                        color="green"
                        size="lg"
                        onClick={handleClickToggleWhatsAppModel}
                    >
                        <WhatsAppIcon width={20} height={21} color="#FFFFFF" />
                        Send Whatsapp
                    </Button>

                    <Button
                        className="!text-[15px] !gap-4"
                        variant="contained"
                        color="blue"
                        size="lg"
                        onClick={(e) => handleClickToggleCallingModel(e, "top")}
                    >
                        <CallIcon width={20} height={21} color="#FFFFFF" />
                        Add to Calling List
                    </Button>

                    <Button
                        className="h-12 w-12 rounded-full !font-bold !p-0"
                        variant="contained"
                        color="primary"
                        size="sm"
                        onClick={handleClickEdit}
                        title="Edit Lead"
                    >
                        <FaUserEdit size={28} />
                    </Button>

                    {whatsappModel && (
                        <div className="absolute top-full left-0 mt-2 max-w-sm w-full p-4 rounded-md bg-white border border-gray-300 shadow-md">
                            <div className="flex items-center justify-between mb-1">
                                <h6 className="font-semibold">Select Number</h6>

                                <span
                                    className="h-8 w-8 f-center bg-gray rounded-full cursor-pointer"
                                    onClick={(e) => handleClickToggleWhatsAppModel(e)}
                                >
                                    <MdClose className="text-lg" />
                                </span>
                            </div>
                            {leadData.mobile_number?.split(",")?.map((ele) => (
                                <a
                                    key={ele}
                                    href={`https://wa.me/${ele}`}
                                    className="flex items-center justify-between p-2 rounded-sm hover:bg-gray-100 cursor-pointer"
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={handleClickToggleWhatsAppModel}
                                >
                                    {ele}
                                </a>
                            ))}
                        </div>
                    )}

                    {callingModel.top && (
                        <CallingModel
                            name="top"
                            model={callingModel}
                            data={data.leadAdditionalDetails}
                            disabled={page.allocateCall}
                            onSelect={(uid) => setCallingModel({ ...callingModel, child: uid })}
                            onSubmit={handleClickAddToCallList}
                            onClose={(name) => setCallingModel({ ...callingModel, [name]: false, child: "" })}
                        />
                    )}
                </div>
					)*/}

            <div className="details p-3 mb-5">
                <div className="grid grid-cols-8 gap-4 mb-5">
                    <p className="col-span-3 font-medium">Executive Name</p>

                    <span className="col-span-1">:</span>

                    {!isEditing && (
                        <div className="col-span-4 text-gray-600">
                            {/* <p>{data?.executive_name ? JSON.parse(data?.executive_name || "{}") : "-"}</p> */}
                            <p>{extractExecNames(leadData.executive_name) || "-"}</p>
                        </div>
                    )}
                    {isEditing && (
                        <div className="col-span-4">
                            <input
                                type="text"
                                value={editedData.executive_name}
                                onChange={(e) => handleInputChange("executive_name", e.target.value)}
                                className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                placeholder="Not Available"
                            />
                            <p className="text-xs mt-1 text-gray-500">Add commas for multiple names.</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-8 gap-4 mb-5">
                    <p className="col-span-3 font-medium">
                        Mobile Number ({leadData.mobile_number ? leadData.mobile_number.split(",").length : 0})
                    </p>

                    <span className="col-span-1">:</span>

                    {!isEditing && (
                        <div className="col-span-4 text-gray-600">
                            {leadData.mobile_number?.split(",")?.map((ele) => (
                                <p key={ele}>{ele}</p>
                            ))}
                        </div>
                    )}
                    {isEditing && (
                        <div className="col-span-4">
                            <input
                                type="text"
                                value={editedData.mobile_number}
                                onChange={(e) => handleInputChange("mobile_number", e.target.value)}
                                className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                placeholder="Not Available"
                            />
                            <p className="text-xs mt-1 text-gray-500">Add commas for multiple numbers.</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-8 gap-4 mb-5">
                    <p className="col-span-3 font-medium">Email</p>

                    <span className="col-span-1">:</span>

                    {!isEditing && (
                        <div className="col-span-4 text-gray-600">
                            <p className="break-words">{leadData.email_address || "-"}</p>
                        </div>
                    )}
                    {isEditing && (
                        <div className="col-span-4">
                            <input
                                type="text"
                                value={editedData.email_address}
                                onChange={(e) => handleInputChange("email_address", e.target.value)}
                                className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                placeholder="Not Available"
                            />
                            <p className="text-xs mt-1 text-gray-500">Add commas for multiple emails.</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-8 gap-4 mb-5">
                    <p className="col-span-3 font-medium">Address</p>

                    <span className="col-span-1">:</span>

                    {!isEditing && (
                        <div className="col-span-4 text-gray-600">
                            <p>{leadData.address || "-"}</p>
                        </div>
                    )}
                    {isEditing && (
                        <div className="col-span-4">
                            <textarea
                                type="text"
                                value={editedData.address}
                                onChange={(e) => handleInputChange("address", e.target.value)}
                                className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                placeholder="Not Available"
                                rows={4}
                            ></textarea>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-8 gap-4 mb-5">
                    <p className="col-span-3 font-medium">GST Number</p>

                    <span className="col-span-1">:</span>

                    {!isEditing && (
                        <div className="col-span-4 text-gray-600">
                            <p>
                                <Printer value={leadData.GST_NUMBER} />
                            </p>
                        </div>
                    )}
                    {isEditing && (
                        <div className="col-span-4">
                            <input
                                type="text"
                                value={editedData.GST_NUMBER}
                                onChange={(e) => handleInputChange("GST_NUMBER", e.target.value)}
                                className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                placeholder="Not Available"
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-8 gap-4 mb-5">
                    <p className="col-span-3 font-medium">Turnover</p>

                    <span className="col-span-1">:</span>

                    {!isEditing && (
                        <div className="col-span-4 text-gray-600">
                            <p>{leadData.Turnover || "-"}</p>
                        </div>
                    )}
                    {isEditing && (
                        <div className="col-span-4">
                            <Select
                                name="turnover"
                                id="turnover"
                                value={turnover}
                                options={turnoverOptions}
                                onChange={handleTurnoverChange}
                                placeholder={"Select..."}
                                getOptionLabel={(option) => {
                                    return <span className="flex items-center justify-start">{option.label}</span>;
                                }}
                                styles={{
                                    // To make the select wider
                                    control: (provided) => ({
                                        ...provided,
                                        maxWidth: "360px", // Adjust the width as needed
                                    }),
                                }}
                                className="text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1 font-semibold">{`Current Value: ${
                                leadData.Turnover || "Not Available"
                            }`}</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-8 gap-4 mb-5">
                    <p className="col-span-3 font-medium">Entity Type</p>

                    <span className="col-span-1">:</span>

                    {!isEditing && (
                        <div className="col-span-4 text-gray-600">
                            <p>{leadData.entity_type || "-"}</p>
                        </div>
                    )}
                    {isEditing && (
                        <div className="col-span-4">
                            <Select
                                name="entityType"
                                id="entityType"
                                value={entityType}
                                options={entityOptions}
                                onChange={handleEntityTypeChange}
                                placeholder={"Select..."}
                                getOptionLabel={(option) => {
                                    return <span className="flex items-center justify-start">{option.label}</span>;
                                }}
                                styles={{
                                    // To make the select wider
                                    control: (provided) => ({
                                        ...provided,
                                        maxWidth: "360px", // Adjust the width as needed
                                    }),
                                }}
                                className="text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1 font-semibold">{`Current Value: ${
                                leadData.entity_type || "Not Available"
                            }`}</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-8 gap-4 mb-5">
                    <p className="col-span-3 font-medium">Category/Nature of Business</p>

                    <span className="col-span-1">:</span>

                    {!isEditing && (
                        <div className="col-span-4 text-gray-600">
                            <p>{leadData.nature_of_business || "-"}</p>
                        </div>
                    )}
                    {isEditing && (
                        <div className="col-span-4">
                            <input
                                type="text"
                                value={editedData.nature_of_business}
                                onChange={(e) => handleInputChange("nature_of_business", e.target.value)}
                                className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                placeholder="Not Available"
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-8 gap-4">
                    <p className="col-span-3 font-medium">Website Link</p>

                    <span className="col-span-1">:</span>

                    {!isEditing && (
                        <div className="col-span-4 text-gray-600 break-words">
                            <a
                                className="text-blue-500 hover:"
                                href={leadData.web_link}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {leadData.web_link || "-"}
                            </a>
                        </div>
                    )}
                    {isEditing && (
                        <div className="col-span-4">
                            <input
                                type="text"
                                value={editedData.web_link}
                                onChange={(e) => handleInputChange("web_link", e.target.value)}
                                className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                placeholder="Not Available"
                            />
                        </div>
                    )}
                </div>
            </div>

            {isEditing && (
                <div className="flex items-center justify-center gap-4">
                    <Button
                        className="h-12 w-12 rounded-full !font-bold !p-0"
                        variant="contained"
                        color="green"
                        size="sm"
                        onClick={handleClickConfirm}
                        title="Confirm Changes"
                    >
                        <IoCheckmarkSharp size={30} color={"white"} />
                    </Button>

                    <Button
                        className="h-12 w-12 rounded-full !font-bold !p-0"
                        variant="contained"
                        color="red"
                        size="sm"
                        onClick={handleClickCancel}
                        title="Cancel Changes"
                    >
                        <IoCloseSharp size={30} color={"white"} />
                    </Button>
                </div>
            )}

            {!isEditing && (
                <div className="connect_history mb-20">
                    <div className="flex items-center justify-start gap-4">
                        <h5 className="text-lg font-medium">Connect History</h5>
                        {/*<Button
                            className="h-8 w-8 rounded-full !font-bold !p-0"
                            variant="contained"
                            color="blue"
                            size="sm"
                            onClick={handleClickEdit}
                            title="Add Call Log"
                        >
                            <MdAddCall size={22} />
			</Button>*/}
                    </div>
                    <div className="mt-3 text-sm">
                        {callData.length === 0 && "No connect history found."}
                        {callData.map((call, i) => (
                            <div key={i} className="p-3 rounded-md mb-3 shadow-app1">
                                <div className="mb-3">
                                    <div className="grid grid-cols-8 gap-1 mb-2">
                                        <p className="col-span-3">Date</p>

                                        <span className="col-span-1">:</span>

                                        <p className="col-span-4">
                                            {formatDate(call.date_of_record, "yyyy-mm-dd hh:mm:ss")}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-8 gap-1 mb-2">
                                        <p className="col-span-3">Mobile Number</p>

                                        <span className="col-span-1">:</span>

                                        <p className="col-span-4">{call?.lead_call_number}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-3">
                                    <CallStatus
                                        className="!text-white !py-2"
                                        indicator={0}
                                        connectStatus={call.connect_status}
                                    />
                                    <CallStatus
                                        className="!text-white !py-2"
                                        indicator={0}
                                        leadStatus={call.lead_status}
                                    />
                                </div>

                                <div className="w-full px-2.5 py-1 text-sm bg-gray-300 rounded-full text-center">
                                    {call.remarks || "No Remarks"}
                                </div>
                            </div>
                        ))}

                        {page.fetching && (
                            <div className="mt-5">
                                <Spinner />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadDetails;
