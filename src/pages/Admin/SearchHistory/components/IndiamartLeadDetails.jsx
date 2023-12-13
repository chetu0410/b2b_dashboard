import { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import Select from "react-select";

import { MdClose, MdAddCall } from "react-icons/md";
import { FaUserEdit } from "react-icons/fa";
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";
import { BsCalendarFill } from "react-icons/bs";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import { Button, CallIcon, Spinner, UserIcon, WhatsAppIcon } from "../../../../components";
import { allocateCall, callingHistory, editIndiamartLead, callingUpdate, leadStatusUpdate } from "../../../../apis";

import handleError from "../../../../utils/errorHandler";
import CallingModel from "./CallingModel";
import CallStatus from "./CallStatus";
import formatDate from "../../../../utils/formatDate";

const connectStatusOptions = [
    { value: 0, label: "Wrong Number" },
    { value: 1, label: "Not Connected" },
    { value: 2, label: "Connected" },
];

const leadStatusOptions = [
    { value: 0, label: "Interested" },
    { value: 1, label: "Not Interested" },
    { value: 2, label: "Call Tomorrow" },
    { value: 3, label: "Call Day After" },
    { value: 4, label: "Call Next Week" },
    { value: 5, label: "Call On Specific Date" },
];

const IndiamartLeadDetails = ({ data = {}, onClose, onEdit, handleMustFinalise }) => {
    const [whatsappModel, setWhatsappModel] = useState(false);
    const [callingModel, setCallingModel] = useState({ top: false, bottom: false, child: "" });
    const [callData, setCallData] = useState([]);
    const [leadData, setLeadData] = useState(data);
    const [page, setPage] = useState({ page: 1, fetching: false, allocateCall: false });

    const [isEditing, setIsEditing] = useState(false);

    const [editedData, setEditedData] = useState({
        query_mcat_name: leadData.query_mcat_name || "",
        query_message: leadData.query_message || "",
        query_product_name: leadData.query_product_name || "",
        full_address: leadData.full_address || "",
        email: leadData.email || "",
        mobile: leadData.mobile || "",
        sender_name: leadData.sender_name || "",
        sender_company: leadData.sender_company || "",
        subject: leadData.subject || "",
    });

    // LOGGING FUNCTIONALITY

    const [mobileNumber, setMobileNumber] = useState(null);
    const [contactPerson, setContactPerson] = useState("");
    const [remark, setRemark] = useState("");
    const [connectStatus, setConnectStatus] = useState(null);
    const [leadStatus, setLeadStatus] = useState(null);

    const [dateValue, setDateValue] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(false);
    const [dateModel, setDateModel] = useState(false);

    const [mobileList, setMobileList] = useState(() => {
        return leadData.mobile
            ? leadData.mobile
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

    const handleToggleDateModel = () => {
        setDateModel((prev) => !prev);
    };

    const handleDateChange = (val, e) => {
        if (formatDate(val) === formatDate(new Date())) setSelectedDate(false);
        else setSelectedDate(true);
        setDateValue(val);
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
                ...(leadStatus && leadStatus.value === 5 && { call_back_date: formatDate(dateValue) }),
                action: 1,
            };

            const { data: res } = await callingUpdate(body);

            if (res.status !== "success") {
                console.log(res.data);
                throw new Error("Failed to update call record! Please try again.");
            } else {
                toast.dismiss(tId);
                toast.success("Call log updated! Update more or click 'Finish' to finalise.", {
                    style: {
                        maxWidth: 500,
                    },
                });
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
                        if (leadStatus.value === 5)
                            newList[loggingIndex] = `Call On\n${formatDate(dateValue, "dd-mm-yyyy")}`;
                        else newList[loggingIndex] = leadStatus.label;
                        return newList;
                    });
                }
                setPrimaryCallRecord(res.data?.call_record_uid);

                setMobileNumber(null);
                setContactPerson("");
                setConnectStatus(null);
                setLeadStatus(null);
                setDateValue(new Date());
                setSelectedDate(false);
                setDateModel(false);
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
            setDateValue(new Date());
            setSelectedDate(false);
            setDateModel(false);
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
                integration_flag: 1,
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
            setDateValue(new Date());
            setSelectedDate(false);
            setDateModel(false);
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

    // LOGGING FUNCTIONALITY

    useEffect(() => {
        setEditedData({
            query_mcat_name: leadData.query_mcat_name || "",
            query_message: leadData.query_message || "",
            query_product_name: leadData.query_product_name || "",
            full_address: leadData.full_address || "",
            email: leadData.email || "",
            mobile: leadData.mobile || "",
            sender_name: leadData.sender_name || "",
            sender_company: leadData.sender_company || "",
            subject: leadData.subject || "",
        });

        setMobileNumber(null);
        setContactPerson("");
        setConnectStatus(null);
        setLeadStatus(null);
        setRemark("");

        setDateValue(new Date());
        setSelectedDate(false);
        setDateModel(false);

        setIsLogging(false);
        setIsUpdating(false);
        setMustFinalise(false);
        handleMustFinalise(false);
        setIsFinalising(false);

        setPrimaryCallRecord("-1");
        setLoggingIndex(null);

        setMobileList(() => {
            return leadData.mobile
                ? leadData.mobile
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
        return (
            !connectStatus ||
            (connectStatus.value === 2 && !leadStatus) ||
            (leadStatus && leadStatus.value === 5 && !selectedDate) ||
            !mobileNumber
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leadStatus, connectStatus, mobileNumber, selectedDate]);

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
                integration_flag: 1,
            };

            const { data: res } = await allocateCall(apiData);
            if (res.status !== "success") throw new Error(res.data);

            setPage({ ...page, allocateCall: false });
            setCallingModel({ ...callingModel, top: false, child: "" });
            onEdit();

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

            const { data: res } = await editIndiamartLead(body);

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

        //FOR LOGGING

        setMobileNumber(null);
        setContactPerson("");
        setConnectStatus(null);
        setLeadStatus(null);
        setDateValue(new Date());
        setSelectedDate(false);
        setDateModel(false);
        setRemark("");
        setIsLogging(false);
    };

    return (
        <div className="lead_detail bg-white px-6 py-4 shadow-app1 max-w-xl w-full h-full overflow-auto overscroll-contain">
            <div className="title flex items-center justify-between mb-5">
                {!isEditing && !isLogging && <h5 className="text-lg font-medium">{"Lead Details"}</h5>}
                {isEditing && !isLogging && <h5 className="text-lg font-medium">{"Editing Lead"}</h5>}
                {!isEditing && isLogging && <h5 className="text-lg font-medium">{"Updating Call Log"}</h5>}

                {!isEditing && !isLogging && !mustFinalise && (
                    <span
                        className="h-8 w-8 f-center bg-gray rounded-full cursor-pointer"
                        onClick={(e) => handleClickToggleModel(e)}
                    >
                        <MdClose className="text-lg" />
                    </span>
                )}
                {!isLogging && mustFinalise && (
                    <Button variant="contained" color="green" size="md" onClick={finaliseUpdate}>
                        Finish
                    </Button>
                )}
            </div>

            <div className="flex items-center justify-between mb-5">
                <div className="name flex items-center gap-3 mr-3 max-w-full w-full">
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

            {!isEditing && !isLogging && !mustFinalise && (
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
                        className="!text-[15px] !gap-2"
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
                            {leadData.mobile?.split(",")?.map((ele) => (
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

            {isLogging && (
                <div className="details p-3">
                    <div className="grid grid-cols-8 items-center gap-4 mb-5">
                        <p className="col-span-3 font-medium">
                            Mobile Number <span className="text-red-500">*</span>
                        </p>

                        <span className="col-span-1">:</span>

                        <div className="col-span-4">
                            <input
                                type="text"
                                value={mobileNumber}
                                className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                placeholder="Not Available"
                                disabled={true}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-8 items-center gap-4 mb-5">
                        <p className="col-span-3 font-medium">
                            Connect Status <span className="text-red-500">*</span>
                        </p>

                        <span className="col-span-1">:</span>

                        <div className="col-span-4">
                            <Select
                                name="connectStatus"
                                id="connectStatus"
                                value={connectStatus}
                                options={connectStatusOptions}
                                onChange={handleSelectConnectStatus}
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
                                disabled={inputDisabled}
                            />
                        </div>
                    </div>

                    {connectStatus && connectStatus.value === 2 && (
                        <div className="relative">
                            <div className="grid grid-cols-8 items-center gap-4 mb-5">
                                <p className="col-span-3 font-medium">
                                    Lead Status <span className="text-red-500">*</span>
                                </p>

                                <span className="col-span-1">:</span>

                                <div className="col-span-4">
                                    <Select
                                        name="leadStatus"
                                        id="leadStatus"
                                        value={leadStatus}
                                        options={leadStatusOptions}
                                        onChange={handleSelectLeadStatus}
                                        placeholder={"Select..."}
                                        getOptionLabel={(option) => {
                                            return (
                                                <span className="flex items-center justify-start">{option.label}</span>
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
                                        disabled={inputDisabled}
                                    />
                                </div>
                            </div>

                            {leadStatus && leadStatus.value === 5 && (
                                <div className="flex items-center justify-end mb-5">
                                    <Button
                                        className="font-semibold"
                                        variant="outlined"
                                        color="gray"
                                        size="sm"
                                        onClick={handleToggleDateModel}
                                    >
                                        <span>
                                            {selectedDate && formatDate(new Date()) !== formatDate(dateValue)
                                                ? formatDate(dateValue)
                                                : "Select Date"}
                                        </span>
                                        <BsCalendarFill className="text-gray-600 text-base" />
                                    </Button>
                                </div>
                            )}

                            {dateModel && (
                                <div className="absolute -left-2 -top-24 w-3/4 bg-white p-2 rounded-md shadow-md border border-gray-300 z-10">
                                    <div className="flex items-center justify-end mb-1">
                                        <Button
                                            variant="contained"
                                            color="gray"
                                            size="sm"
                                            onClick={handleToggleDateModel}
                                        >
                                            Close
                                        </Button>
                                    </div>
                                    <Calendar
                                        value={dateValue}
                                        onChange={handleDateChange}
                                        minDate={new Date()}
                                        //className="w-1/2"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-8 items-center gap-4 mb-5">
                                <p className="col-span-3 font-medium">Contact Person</p>

                                <span className="col-span-1">:</span>

                                <div className="col-span-4">
                                    <input
                                        type="text"
                                        value={contactPerson}
                                        onChange={handleChangeContactPerson}
                                        className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                        disabled={inputDisabled}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-8 gap-4 mb-5">
                                <p className="col-span-3 font-medium mt-1.5">Remarks</p>

                                <span className="col-span-1 mt-1.5">:</span>

                                <div className="col-span-4">
                                    <textarea
                                        type="text"
                                        value={remark}
                                        onChange={handleChangeRemark}
                                        className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                        rows={4}
                                        disabled={inputDisabled}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {isLogging && !isEditing && (
                <div className="flex items-center justify-center gap-4">
                    <Button
                        className="!text-[15px] !gap-0.5"
                        variant="contained"
                        color="green"
                        size="sm"
                        onClick={updateCall}
                        disabled={updateButtonDisabled}
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

            {!isLogging && (
                <div className="details p-3">
                    <div className="flex flex-row items-center w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Sender Company:</p>

                        {!isEditing && (
                            <div className="basis-2/3 text-gray-600">
                                <p>{leadData.sender_company || "-"}</p>
                            </div>
                        )}

                        {isEditing && (
                            <div className="basis-2/3">
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

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium mt-1.5">Mobile Number ({mobileList.length}):</p>

                        {!isEditing && (
                            <div className="basis-2/3">
                                {mobileList.length === 0 && <span className="text-gray-600 mt-1.5">-</span>}
                                {mobileList.map((num, index) => (
                                    <div key={index} className="flex flex-row items-center w-full mt-1 mb-2">
                                        <p className="basis-1/3 text-gray-600 font-medium">{num}</p>
                                        {callRecordUidList[index] === "" ? (
                                            <div className="basis-2/3 ml-3">
                                                <Button
                                                    variant="contained"
                                                    color="blue"
                                                    size="sm"
                                                    onClick={() => handleClickLogCall(index)}
                                                    title={`Add Call Log for ${num}`}
                                                >
                                                    <MdAddCall size={20} />
                                                    Update Call
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="basis-2/3 flex items-center">
                                                <label
                                                    htmlFor={`primary_${index}`}
                                                    className={`basis-1/2 text-center whitespace-pre text-xs font-semibold ${
                                                        callResponseList[index] === "Wrong Number" ||
                                                        callResponseList[index] === "Not Connected" ||
                                                        callResponseList[index] === "Not Interested"
                                                            ? "text-red-500"
                                                            : "text-green-500"
                                                    }`}
                                                >
                                                    {callResponseList[index]}
                                                </label>
                                                <div className="basis-1/2 flex items-center justify-center gap-0.5">
                                                    <input
                                                        type="radio"
                                                        id={`primary_${index}`}
                                                        value={num}
                                                        checked={callRecordUidList[index] === primaryCallRecord}
                                                        onChange={() => handlePrimaryChange(index)}
                                                    />
                                                    <label
                                                        htmlFor={`primary_${index}`}
                                                        className="text-xs font-semibold"
                                                    >
                                                        Set as Primary
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {isEditing && (
                            <div className="basis-2/3">
                                <input
                                    type="text"
                                    value={editedData.mobile}
                                    onChange={(e) => handleInputChange("mobile", e.target.value)}
                                    className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                    placeholder="Not Available"
                                />
                                <p className="text-xs mt-1 text-gray-500">Add commas for multiple numbers.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium mt-1.5">Email:</p>

                        {!isEditing && (
                            <div className="basis-2/3 mt-1.5 text-gray-600">
                                <p className="break-words">{leadData.email || "-"}</p>
                            </div>
                        )}

                        {isEditing && (
                            <div className="basis-2/3">
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

                    <div className="flex flex-row items-center w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Query Product:</p>

                        {!isEditing && (
                            <div className="basis-2/3 text-gray-600">
                                <p>{leadData.query_product_name || "-"}</p>
                            </div>
                        )}

                        {isEditing && (
                            <div className="basis-2/3">
                                <input
                                    type="text"
                                    value={editedData.query_product_name}
                                    onChange={(e) => handleInputChange("query_product_name", e.target.value)}
                                    className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                    placeholder="Not Available"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-row items-center w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Query Category:</p>

                        {!isEditing && (
                            <div className="basis-2/3 text-gray-600">
                                <p>{leadData.query_mcat_name || "-"}</p>
                            </div>
                        )}

                        {isEditing && (
                            <div className="basis-2/3">
                                <input
                                    type="text"
                                    value={editedData.query_mcat_name}
                                    onChange={(e) => handleInputChange("query_mcat_name", e.target.value)}
                                    className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                    placeholder="Not Available"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-row items-center w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Subject:</p>

                        {!isEditing && (
                            <div className="basis-2/3 text-gray-600">
                                <p>{leadData.subject || "-"}</p>
                            </div>
                        )}

                        {isEditing && (
                            <div className="basis-2/3">
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

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium mt-1.5">Query Message:</p>

                        {!isEditing && (
                            <div className="basis-2/3 mt-1.5 text-gray-600">
                                {leadData.query_message ? (
                                    <p dangerouslySetInnerHTML={{ __html: leadData.query_message }} />
                                ) : (
                                    "-"
                                )}
                            </div>
                        )}

                        {isEditing && (
                            <div className="basis-2/3">
                                <textarea
                                    type="text"
                                    value={editedData.query_message.replace(/<br>/g, "\n")}
                                    //onChange={(e) => handleInputChange("query_message", e.target.value)}
                                    className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                    placeholder="Not Available"
                                    rows={4}
                                    disabled={true}
                                ></textarea>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-row items-center w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Query Time:</p>

                        {!isEditing && (
                            <div className="basis-2/3 text-gray-600">
                                <p>{leadData.query_time || "-"}</p>
                            </div>
                        )}

                        {isEditing && (
                            <div className="basis-2/3">
                                <input
                                    type="text"
                                    value={leadData.query_time}
                                    //onChange={(e) => handleInputChange("query_time", e.target.value)}
                                    className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                    placeholder="Not Available"
                                    disabled={true}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium mt-1.5">Address:</p>

                        {!isEditing && (
                            <div className="basis-2/3 mt-1.5 text-gray-600">
                                <p>{leadData.full_address || "-"}</p>
                            </div>
                        )}

                        {isEditing && (
                            <div className="basis-2/3">
                                <textarea
                                    type="text"
                                    value={editedData.full_address}
                                    onChange={(e) => handleInputChange("full_address", e.target.value)}
                                    className="w-full max-w-[360px] text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                    placeholder="Not Available"
                                    rows={4}
                                ></textarea>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isEditing && !isLogging && (
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

            {!isEditing && !isLogging && (
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

export default IndiamartLeadDetails;
