import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { MdClose, MdAddCall } from "react-icons/md";
import { FaUserEdit } from "react-icons/fa";
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";

import { Button, CallIcon, Spinner, UserIcon, WhatsAppIcon } from "../../../../components";
import handleError from "../../../../utils/errorHandler";
import CallingModel from "./CallingModel";
import { allocateCall, callingHistory, editFacebookLead, callingUpdate, leadStatusUpdate } from "../../../../apis";
import CallStatus from "./CallStatus";
import formatDate from "../../../../utils/formatDate";
import formatFBTimestamp from "../../../../utils/formatFBTimestamp";
import formatFBAddress from "../../../../utils/formatFBAddress";

const FacebookLeadDetails = ({ data = {}, onClose, onEdit, handleMustFinalise }) => {
    const [whatsappModel, setWhatsappModel] = useState(false);
    const [callingModel, setCallingModel] = useState({ top: false, bottom: false, child: "" });
    const [callData, setCallData] = useState([]);
    const [leadData, setLeadData] = useState(data);
    const [page, setPage] = useState({ page: 1, fetching: false, allocateCall: false });

    const [isEditing, setIsEditing] = useState(false);

    const [editedData, setEditedData] = useState({
        full_name: leadData.full_name || "",
        email: leadData.email || "",
        phone_number: leadData.phone_number || "",
        street_address: leadData.street_address || "",
        city: leadData.city || "",
        state: leadData.state || "",
        zip_code: leadData.zip_code || "",
    });

    // LOGGING FUNCTIONALITY

    const [mobileNumber, setMobileNumber] = useState(null);
    const [contactPerson, setContactPerson] = useState("");
    const [remark, setRemark] = useState("");
    const [connectStatus, setConnectStatus] = useState(null);
    const [leadStatus, setLeadStatus] = useState(null);

    const [mobileList, setMobileList] = useState(() => {
        return leadData.phone_number
            ? leadData.phone_number
                  .trim()
                  .split(",")
                  .map((x) => x.trim())
                  .filter((x) => x)
            : [];
    });
    const [callRecordUidList, setCallRecordUidList] = useState([]);
    const [callResponseList, setCallResponseList] = useState([]);
    const [primaryCallRecord, setPrimaryCallRecord] = useState("-1");
    const [loggingIndex, setLoggingIndex] = useState(null);

    const [isLogging, setIsLogging] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isFinalising, setIsFinalising] = useState(false);
    const [mustFinalise, setMustFinalise] = useState(false);

    const handleChangeContactPerson = (e) => {
        setContactPerson(e.target.value);
    };

    const handleChangeRemark = (e) => {
        setRemark(e.target.value);
    };

    const handleSelectLeadStatus = (option) => {
        setLeadStatus(option);
    };

    const handleSelectConnectStatus = (option) => {
        setConnectStatus(option);
    };

    const updateCall = async () => {
        setIsUpdating(true);
        const tId = toast.loading("Updating call record...");
        try {
            const body = {
                user_uid: data?.leadAdditionalDetails?.self_account_details?.parent_user_uid,
                lead_call_number: mobileNumber,
                connect_status: connectStatus ? connectStatus.value : -1,
                lead_status: leadStatus ? leadStatus.value : -1,
                record_uid: data.mongodb_record_id,
                ...(remark && { remarks: remark }),
                ...(contactPerson && { contact_person: contactPerson }),
                action: 1,
            };

            const { data: res } = await callingUpdate(body);

            if (res.status !== "success") {
                console.log(res.data);
                throw new Error("Failed to update call record! Please try again.");
            } else {
                toast.dismiss(tId);
                toast.success("Call log updated!\nUpdate more or click 'Finish' to finalise.");
                setIsUpdating(false);
                setMustFinalise(true);
                handleMustFinalise(true);

                setCallRecordUidList((prevList) => {
                    const newList = [...prevList];
                    newList[loggingIndex] = res.data?.call_record_uid;
                    return newList;
                });
                if (connectStatus && !leadStatus) {
                    setCallResponseList((prevList) => {
                        const newList = [...prevList];
                        newList[loggingIndex] = connectStatus.label;
                        return newList;
                    });
                } else {
                    setCallResponseList((prevList) => {
                        const newList = [...prevList];
                        newList[loggingIndex] = leadStatus.label;
                        return newList;
                    });
                }
                setPrimaryCallRecord(res.data?.call_record_uid);

                setMobileNumber(null);
                setContactPerson("");
                setConnectStatus(null);
                setLeadStatus(null);
                setRemark("");

                setIsLogging(false);
                fetchCallingHistory();
            }
        } catch (err) {
            toast.dismiss(tId);
            toast.error(err.message);
            setIsUpdating(false);
            setIsLogging(false);

            setMobileNumber(null);
            setContactPerson("");
            setConnectStatus(null);
            setLeadStatus(null);
            setRemark("");
        }
    };

    const finaliseUpdate = async () => {
        setIsFinalising(true);
        const tId = toast.loading("Finalising updated record...");
        try {
            const body = {
                user_uid: data?.leadAdditionalDetails?.self_account_details?.parent_user_uid,
                call_record_uid: primaryCallRecord,
                integration_flag: 2,
                record_uid: data.mongodb_record_id,
            };

            const { data: res } = await leadStatusUpdate(body);

            if (res.status !== "success") {
                console.log(res.data);
                throw new Error("Failed to finalise lead status! Please try again.");
            } else {
                toast.dismiss(tId);
                toast.success("Lead status updated succesfully!");
                setMustFinalise(false);
                handleMustFinalise(false);
                onEdit();
                handleClickToggleModel();
            }
        } catch (err) {
            toast.dismiss(tId);
            toast.error(err.message);
            setIsFinalising(false);
            setMustFinalise(false);
            handleMustFinalise(false);

            setMobileNumber(null);
            setContactPerson("");
            setConnectStatus(null);
            setLeadStatus(null);
            setRemark("");
        }
    };

    // END LOGGING FUNCTIONALITY

    const handleClickToggleModel = (e) => {
        if (!onClose) return;
        onClose(e);
    };

    const handleInputChange = (field, value) => {
        setEditedData({ ...editedData, [field]: value });
    };

    const fetchCallingHistory = async (params, headers) => {
        setCallData([]);
        setPage({ ...page, fetching: true });
        try {
            const body = {};
            body.record_uid = data.mongodb_record_id;

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
            full_name: leadData.full_name || "",
            email: leadData.email || "",
            phone_number: leadData.phone_number || "",
            street_address: leadData.street_address || "",
            city: leadData.city || "",
            state: leadData.state || "",
            zip_code: leadData.zip_code || "",
        });

        setMobileNumber(null);
        setContactPerson("");
        setConnectStatus(null);
        setLeadStatus(null);
        setRemark("");

        setIsLogging(false);
        setIsUpdating(false);
        setMustFinalise(false);
        handleMustFinalise(false);
        setIsFinalising(false);

        setPrimaryCallRecord("-1");
        setLoggingIndex(null);

        setMobileList(() => {
            return leadData.phone_number
                ? leadData.phone_number
                      .trim()
                      .split(",")
                      .map((x) => x.trim())
                      .filter((x) => x)
                : [];
        });
        setCallRecordUidList([]);
        setCallResponseList([]);

        setCallData([]);
        setPage({ page: 1, fetching: false, allocateCall: false });
        fetchCallingHistory();
    }, [leadData]);

    useEffect(() => {
        setCallRecordUidList(new Array(mobileList.length).fill(""));
        setCallResponseList(new Array(mobileList.length).fill(""));
    }, [mobileList]);

    /*useEffect(() => {
        if (!isLogging) fetchCallingHistory();
    }, [isLogging]);*/

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (mustFinalise) {
                const message = "Please finish the lead updation otherwise changes will be lost. Refresh anyway?";
                event.returnValue = message; // Standard for most browsers
                return message; // For some older browsers
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [mustFinalise]);

    const handleClickLogCall = (index) => {
        setMobileNumber(mobileList[index]);
        setLoggingIndex(index);
        setIsLogging(true);
    };

    const handlePrimaryChange = (index) => {
        setPrimaryCallRecord(callRecordUidList[index]);
    };

    const updateButtonDisabled = useMemo(() => {
        return !connectStatus || (connectStatus.value === 2 && !leadStatus) || !mobileNumber;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leadStatus, connectStatus, mobileNumber]);

    const inputDisabled = useMemo(() => {
        return isUpdating || isFinalising;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isUpdating, isFinalising]);

    //END LOGGING FUNCTIONALITY

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
                record_uid: [data.mongodb_record_id],
                integration_flag: 2,
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
            mongodb_record_id: data.mongodb_record_id,
        };
        try {
            body = { ...body, ...editedData };

            const { data: res } = await editFacebookLead(body);

            if (res.status !== "success") {
                console.log(res.data);
                throw new Error("Editing failed! Please try again.");
            } else {
                toast.dismiss(tId);
                toast.success("Lead edited successfully!");
                onEdit();

                const { parent_user_uid, mongodb_record_id, ...newData } = body;
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
        <div className="lead_detail bg-white px-6 py-4 shadow-app1 max-w-xl w-full h-full overflow-auto overscroll-contain">
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
                <div className="name flex items-center gap-3 mr-3 max-w-full w-full">
                    <UserIcon />
                    {!isEditing && <span>{leadData.full_name}</span>}
                    {isEditing && (
                        <input
                            type="text"
                            value={editedData.full_name}
                            onChange={(e) => handleInputChange("full_name", e.target.value)}
                            className="w-full text-m px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                            placeholder="Not Available"
                        />
                    )}
                </div>
            </div>

            {!isEditing && (
                <div className="action_buttons relative flex items-center gap-3 mb-5">
                    <Button
                        className="!text-white !text-[15px] !gap-2"
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
                        className="!text-[15px] !gap-2"
                        variant="contained"
                        color="primary"
                        size="lg"
                        onClick={handleClickEdit}
                    >
                        <FaUserEdit size={28} />
                        Edit Lead
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
                            {leadData.phone_number?.split(",")?.map((ele) => (
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
            )}

            <div className="details p-3">
                <div className="grid grid-cols-8 gap-4 mb-5">
                    <p className="col-span-3 font-medium">
                        Mobile Number ({leadData.phone_number ? leadData.phone_number.split(",").length : 0})
                    </p>

                    <span className="col-span-1">:</span>

                    {!isEditing && (
                        <div className="col-span-4 text-gray-600">
                            {leadData.phone_number?.split(",")?.map((ele) => (
                                <p key={ele}>{ele}</p>
                            ))}
                        </div>
                    )}
                    {isEditing && (
                        <div className="col-span-4">
                            <input
                                type="text"
                                value={editedData.phone_number}
                                onChange={(e) => handleInputChange("phone_number", e.target.value)}
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
                            <p className="break-words">{leadData.email || "-"}</p>
                        </div>
                    )}
                    {isEditing && (
                        <div className="col-span-4">
                            <input
                                type="text"
                                value={editedData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                placeholder="Not Available"
                            />
                            <p className="text-xs mt-1 text-gray-500">Add commas for multiple emails.</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-8 gap-4 mb-5">
                    <p className="col-span-3 font-medium">Created Time</p>

                    <span className="col-span-1">:</span>

                    {!isEditing && (
                        <div className="col-span-4 text-gray-600">
                            <p>{formatFBTimestamp(leadData.created_time) || "-"}</p>
                        </div>
                    )}
                    {isEditing && (
                        <div className="col-span-4">
                            <input
                                type="text"
                                value={formatFBTimestamp(leadData.created_time)}
                                className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                placeholder="Not Available"
                                disabled={true}
                            />
                        </div>
                    )}
                </div>

                {!isEditing && (
                    <div className="grid grid-cols-8 gap-4 mb-5">
                        <p className="col-span-3 font-medium">Full Address</p>

                        <span className="col-span-1">:</span>

                        <div className="col-span-4 text-gray-600">
                            <p>
                                {formatFBAddress(
                                    leadData.street_address,
                                    leadData.city,
                                    leadData.state,
                                    leadData.zip_code
                                ) || "-"}
                            </p>
                        </div>
                    </div>
                )}

                {isEditing && (
                    <>
                        <div className="grid grid-cols-8 gap-4 mb-5">
                            <p className="col-span-3 font-medium">Street Address</p>

                            <span className="col-span-1">:</span>

                            <div className="col-span-4">
                                <input
                                    type="text"
                                    value={editedData.street_address}
                                    onChange={(e) => handleInputChange("street_address", e.target.value)}
                                    className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                    placeholder="Not Available"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-8 gap-4 mb-5">
                            <p className="col-span-3 font-medium">City</p>

                            <span className="col-span-1">:</span>

                            <div className="col-span-4">
                                <input
                                    type="text"
                                    value={editedData.city}
                                    onChange={(e) => handleInputChange("city", e.target.value)}
                                    className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                    placeholder="Not Available"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-8 gap-4 mb-5">
                            <p className="col-span-3 font-medium">State</p>

                            <span className="col-span-1">:</span>

                            <div className="col-span-4">
                                <input
                                    type="text"
                                    value={editedData.state}
                                    onChange={(e) => handleInputChange("state", e.target.value)}
                                    className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                    placeholder="Not Available"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-8 gap-4 mb-5">
                            <p className="col-span-3 font-medium">Zip Code</p>

                            <span className="col-span-1">:</span>

                            <div className="col-span-4">
                                <input
                                    type="text"
                                    value={editedData.zip_code}
                                    onChange={(e) => handleInputChange("zip_code", e.target.value)}
                                    className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                    placeholder="Not Available"
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {isEditing && (
                <div className="flex items-center justify-center gap-4">
                    <Button
                        className="!text-[15px] !gap-0.5"
                        variant="contained"
                        color="green"
                        size="sm"
                        onClick={handleClickConfirm}
                    >
                        <IoCheckmarkSharp size={24} />
                        Confirm
                    </Button>

                    <Button
                        className="!text-[15px] !gap-0.5"
                        variant="contained"
                        color="red"
                        size="sm"
                        onClick={handleClickCancel}
                    >
                        <IoCloseSharp size={24} />
                        Cancel
                    </Button>
                </div>
            )}

            {!isEditing && (
                <div className="connect_history mb-20">
                    <div className="flex items-center justify-start gap-4">
                        <h5 className="text-lg font-medium">Connect History</h5>
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
                                    {call.did && (
                                        <div className="grid grid-cols-8 gap-1 mb-2">
                                            <p className="col-span-3">Dialer Number</p>

                                            <span className="col-span-1">:</span>

                                            <p className="col-span-4">{call.did}</p>
                                        </div>
                                    )}

                                    {call.exten && (
                                        <div className="grid grid-cols-8 gap-1 mb-2">
                                            <p className="col-span-3">Extension</p>

                                            <span className="col-span-1">:</span>

                                            <p className="col-span-4">{call.exten}</p>
                                        </div>
                                    )}

                                    {call.call_duration && (
                                        <div className="grid grid-cols-8 gap-1 mb-2">
                                            <p className="col-span-3">Call Duration</p>

                                            <span className="col-span-1">:</span>

                                            <p className="col-span-4">{call.call_duration}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between">
                                    <div className="flex items-center gap-4 mb-3">
                                        <CallStatus
                                            className="!text-white !py-2"
                                            indicator={0}
                                            connectStatus={call.connect_status}
                                        />
                                        <CallStatus
                                            className="!text-white !py-2 !mb-0"
                                            indicator={0}
                                            leadStatus={call.lead_status}
                                            callDate={
                                                call.call_back_date
                                                    ? formatDate(new Date(call.call_back_date), "dd-mm-yyyy")
                                                    : ""
                                            }
                                        />
                                    </div>
                                    {call.rec_file && (
                                        <audio controls className="h-10 pl-3 pb-1">
                                            <source src={call.rec_file} type="audio/wav" />
                                            Audio is not supported or enabled.
                                        </audio>
                                    )}
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

export default FacebookLeadDetails;
