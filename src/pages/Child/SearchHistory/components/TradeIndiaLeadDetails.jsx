import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Select from "react-select";
import { MdClose, MdAddCall } from "react-icons/md";
import { FaUserEdit } from "react-icons/fa";
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";

import { Button, CallIcon, Printer, Spinner, UserIcon, WhatsAppIcon } from "../../../../components";
//import handleError from "../../../../utils/errorHandler";
//import CallingModel from "./CallingModel";
import { allocateCall, callingHistory, editTradeIndiaLead } from "../../../../apis";
import CallStatus from "./CallStatus";
import formatDate from "../../../../utils/formatDate";
import formatTINumbers from "../../../../utils/formatTINumbers";
import formatTIAddress from "../../../../utils/formatTIAddress";

const sourceOptions = [
    { value: 0, label: "(No Change)" },
    { value: "PHONE_INQUIRY", label: "Phone Inquiry" },
    { value: "MOBILE_TRACKING", label: "Mobile Tracking" },
    { value: "IVR_AUTO", label: "IVR Auto" },
];

const TradeIndiaLeadDetails = ({ data = {}, onClose, onEdit }) => {
    const [whatsappModel, setWhatsappModel] = useState(false);
    //const [callingModel, setCallingModel] = useState({ top: false, bottom: false, child: "" });
    const [callData, setCallData] = useState([]);
    const [leadData, setLeadData] = useState(data);
    const [page, setPage] = useState({ page: 1, fetching: false, allocateCall: false });

    const [isEditing, setIsEditing] = useState(false);
    const [source, setSource] = useState(null);

    const [editedData, setEditedData] = useState({
        sender_name: leadData.sender_name || "",
        sender_mobile: leadData.sender_mobile || "",
        sender_other_mobiles: leadData.sender_other_mobiles || "",
        product_name: leadData.product_name || "",
        product_source: leadData.product_source || "",
        source: leadData.source || "",
        subject: leadData.subject || "",
        sender_company: leadData.sender_company || "",
        sender_city: leadData.sender_city || "",
        sender_state: leadData.sender_state || "",
        sender_country: leadData.sender_country || "",
        receiver_company: leadData.receiver_company || "",
        receiver_mobile: leadData.receiver_mobile || "",
        receiver_name: leadData.receiver_name || "",
    });

    const handleInputChange = (field, value) => {
        setEditedData({ ...editedData, [field]: value });
    };

    const handleSourceChange = (option) => {
        setSource(option);
        setEditedData({ ...editedData, source: option.value });
    };

    const fetchCallingHistory = async (params, headers) => {
        setPage({ ...page, fetching: true });
        try {
            const body = {};
            if (data.mongodb_record_id) body.record_uid = data.mongodb_record_id;

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
            sender_name: leadData.sender_name || "",
            sender_mobile: leadData.sender_mobile || "",
            sender_other_mobiles: leadData.sender_other_mobiles || "",
            product_name: leadData.product_name || "",
            product_source: leadData.product_source || "",
            source: leadData.source || "",
            subject: leadData.subject || "",
            message: leadData.message || "",
            sender_company: leadData.sender_company || "",
            sender_city: leadData.sender_city || "",
            sender_state: leadData.sender_state || "",
            sender_country: leadData.sender_country || "",
            receiver_company: leadData.receiver_company || "",
            receiver_mobile: leadData.receiver_mobile || "",
            receiver_name: leadData.receiver_name || "",
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

    /*const handleClickToggleCallingModel = async (e, name) => {
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
    };*/

    const handleClickEdit = (e) => {
        setIsEditing(true);
    };

    const handleClickConfirm = async () => {
        const tId = toast.loading("Editing in progress...");
        let body = {
            b2b_user_uid: data?.leadAdditionalDetails?.self_account_details?.parent_user_uid,
            mongodb_record_id: data.mongodb_record_id,
        };
        try {
            body = { ...body, ...editedData };
            if (!source || source.value === 0) body.source = leadData.source;

            const { data: res } = await editTradeIndiaLead(body);

            if (res.status !== "success") {
                console.log(res.data);
                throw new Error("Editing failed! Please try again.");
            } else {
                toast.dismiss(tId);
                toast.success("Lead edited successfully!");
                onEdit();

                const { b2b_user_uid, mongodb_record_id, ...newData } = body;
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
                    {!isEditing && <span>{leadData.sender_name}</span>}
                    {isEditing && (
                        <input
                            type="text"
                            value={editedData.sender_name}
                            onChange={(e) => handleInputChange("sender_name", e.target.value)}
                            className="w-full text-m px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                            placeholder="Not Available"
                        />
                    )}
                </div>
            </div>

            {/*!isEditing && (
                <div className="action_buttons relative flex items-center gap-3 mb-5">
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
                            {leadData.sender_mobile?.split(",")?.map((ele) => (
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
                {!isEditing && (
                    <div className="grid grid-cols-8 gap-4 mb-5">
                        <p className="col-span-3 font-medium">
                            Mobile Numbers (
                            {formatTINumbers(leadData.sender_mobile, leadData.sender_other_mobiles)
                                ? formatTINumbers(leadData.sender_mobile, leadData.sender_other_mobiles).split(",")
                                      .length
                                : 0}
                            )
                        </p>

                        <span className="col-span-1">:</span>

                        <div className="col-span-4 text-gray-600">
                            {formatTINumbers(leadData.sender_mobile, leadData.sender_other_mobiles)
                                ?.split(",")
                                ?.map((ele) => (
                                    <p key={ele}>{ele}</p>
                                ))}
                        </div>
                    </div>
                )}

                {isEditing && (
                    <>
                        <div className="grid grid-cols-8 gap-4 mb-5">
                            <p className="col-span-3 font-medium">Sender Mobile</p>

                            <span className="col-span-1">:</span>

                            <div className="col-span-4">
                                <input
                                    type="text"
                                    value={editedData.sender_mobile}
                                    onChange={(e) => handleInputChange("sender_mobile", e.target.value)}
                                    className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                    placeholder="Not Available"
                                />
                                <p className="text-xs mt-1 text-gray-500">Only use one sender mobile number.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-8 gap-4 mb-5">
                            <p className="col-span-3 font-medium">Other Mobile Numbers</p>

                            <span className="col-span-1">:</span>

                            <div className="col-span-4">
                                <input
                                    type="text"
                                    value={editedData.sender_other_mobiles}
                                    onChange={(e) => handleInputChange("sender_other_mobiles", e.target.value)}
                                    className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                    placeholder="Not Available"
                                />
                                <p className="text-xs mt-1 text-gray-500">Add commas for multiple numbers.</p>
                            </div>
                        </div>
                    </>
                )}

                <div className="grid grid-cols-8 gap-4 mb-5">
                    <p className="col-span-3 font-medium">Product Name</p>

                    <span className="col-span-1">:</span>

                    {!isEditing && <div className="col-span-4 text-gray-600">{leadData.product_name || "-"}</div>}
                    {isEditing && (
                        <div className="col-span-4">
                            <input
                                type="text"
                                value={editedData.product_name}
                                onChange={(e) => handleInputChange("product_name", e.target.value)}
                                className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                placeholder="Not Available"
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-8 gap-4 mb-5">
                    <p className="col-span-3 font-medium">Product Source</p>

                    <span className="col-span-1">:</span>

                    {!isEditing && <div className="col-span-4 text-gray-600">{leadData.product_source || "-"}</div>}
                    {isEditing && (
                        <div className="col-span-4">
                            <input
                                type="text"
                                value={editedData.product_source}
                                onChange={(e) => handleInputChange("product_source", e.target.value)}
                                className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                placeholder="Not Available"
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-8 gap-4 mb-5">
                    <p className="col-span-3 font-medium">Inquiry Source</p>

                    <span className="col-span-1">:</span>

                    {!isEditing && <div className="col-span-4 text-gray-600">{leadData.source || "-"}</div>}
                    {isEditing && (
                        <div className="col-span-4">
                            <Select
                                name="source"
                                id="source"
                                value={source}
                                options={sourceOptions}
                                onChange={handleSourceChange}
                                placeholder={"Select..."}
                                getOptionLabel={(option) => {
                                    return (
                                        <span className="flex items-center justify-start">
                                            {option.value ? option.value : option.label}
                                        </span>
                                    );
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
                                leadData.source || "Not Available"
                            }`}</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-8 gap-4 mb-5">
                    <p className="col-span-3 font-medium">Subject</p>

                    <span className="col-span-1">:</span>

                    {!isEditing && (
                        <div className="col-span-4 text-gray-600">
                            <p>{leadData.subject || "-"}</p>
                        </div>
                    )}
                    {isEditing && (
                        <div className="col-span-4">
                            <input
                                type="text"
                                value={editedData.subject}
                                onChange={(e) => handleInputChange("subject", e.target.value)}
                                className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                placeholder="Not Available"
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-8 gap-4 mb-5">
                    <p className="col-span-3 font-medium">Inquiry Message:</p>

                    <span className="col-span-1">:</span>

                    {!isEditing && (
                        <div className="col-span-4 text-gray-600 whitespace-pre-line break-words">
                            {leadData.message || "-"}
                        </div>
                    )}

                    {isEditing && (
                        <div className="col-span-4">
                            <textarea
                                type="text"
                                value={editedData.message}
                                onChange={(e) => handleInputChange("message", e.target.value)}
                                className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                placeholder="Not Available"
                                rows={4}
                            ></textarea>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-8 gap-4 mb-5">
                    <p className="col-span-3 font-medium">Sender Company</p>

                    <span className="col-span-1">:</span>

                    {!isEditing && <div className="col-span-4 text-gray-600">{leadData.sender_company || "-"}</div>}
                    {isEditing && (
                        <div className="col-span-4">
                            <input
                                type="text"
                                value={editedData.sender_company}
                                onChange={(e) => handleInputChange("sender_company", e.target.value)}
                                className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                placeholder="Not Available"
                            />
                        </div>
                    )}
                </div>

                {!isEditing && (
                    <div className="grid grid-cols-8 gap-4 mb-5">
                        <p className="col-span-3 font-medium">Sender Address</p>

                        <span className="col-span-1">:</span>

                        <div className="col-span-4 text-gray-600">
                            <p>
                                {formatTIAddress(
                                    leadData.sender_city,
                                    leadData.sender_state,
                                    leadData.sender_country
                                ) || "-"}
                            </p>
                        </div>
                    </div>
                )}

                {isEditing && (
                    <>
                        <div className="grid grid-cols-8 gap-4 mb-5">
                            <p className="col-span-3 font-medium">Sender City</p>

                            <span className="col-span-1">:</span>

                            <div className="col-span-4">
                                <input
                                    type="text"
                                    value={editedData.sender_city}
                                    onChange={(e) => handleInputChange("sender_city", e.target.value)}
                                    className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                    placeholder="Not Available"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-8 gap-4 mb-5">
                            <p className="col-span-3 font-medium">Sender State</p>

                            <span className="col-span-1">:</span>

                            <div className="col-span-4">
                                <input
                                    type="text"
                                    value={editedData.sender_state}
                                    onChange={(e) => handleInputChange("sender_state", e.target.value)}
                                    className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                    placeholder="Not Available"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-8 gap-4 mb-5">
                            <p className="col-span-3 font-medium">Sender Country</p>

                            <span className="col-span-1">:</span>

                            <div className="col-span-4">
                                <input
                                    type="text"
                                    value={editedData.sender_country}
                                    onChange={(e) => handleInputChange("sender_country", e.target.value)}
                                    className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                    placeholder="Not Available"
                                />
                            </div>
                        </div>
                    </>
                )}

                <div className="grid grid-cols-8 gap-4 mb-5">
                    <p className="col-span-3 font-medium">Generated Date</p>

                    <span className="col-span-1">:</span>

                    {!isEditing && (
                        <div className="col-span-4 text-gray-600">
                            <p>{leadData.generated_date || "-"}</p>
                        </div>
                    )}
                    {isEditing && (
                        <div className="col-span-4">
                            <input
                                type="text"
                                value={leadData.generated_date}
                                className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                placeholder="Not Available"
                                disabled={true}
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-8 gap-4 mb-5">
                    <p className="col-span-3 font-medium">Generated Time</p>

                    <span className="col-span-1">:</span>

                    {!isEditing && (
                        <div className="col-span-4 text-gray-600">
                            <p>{leadData.generated_time || "-"}</p>
                        </div>
                    )}
                    {isEditing && (
                        <div className="col-span-4">
                            <input
                                type="text"
                                value={leadData.generated_time}
                                className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                placeholder="Not Available"
                                disabled={true}
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

export default TradeIndiaLeadDetails;
