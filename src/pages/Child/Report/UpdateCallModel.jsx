import { useMemo, useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";
import { MdClose, MdAddCall } from "react-icons/md";
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";

import { Button, Spinner, UserIcon } from "../../../components";
import { callingHistory, callingUpdate, leadStatusUpdate } from "../../../apis";
import ParentChildContext from "../../../context/ParentChildContext";

import CallStatus from "../SearchHistory/components/CallStatus";
import Select from "react-select";
import formatDate from "../../../utils/formatDate";
import formatFBAddress from "../../../utils/formatFBAddress";
import formatFBTimestamp from "../../../utils/formatFBTimestamp";
import extractExecNames from "../../../utils/extractExecNames";

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
];

const UpdateCallModel = ({ data = {}, integrationFlag, handleMustFinalise, onUpdate, onClose }) => {
    const { selectedUser, setSelectedUser } = useContext(ParentChildContext);

    const [mobileNumber, setMobileNumber] = useState(null);
    const [contactPerson, setContactPerson] = useState("");
    const [remark, setRemark] = useState("");
    const [connectStatus, setConnectStatus] = useState(null);
    const [leadStatus, setLeadStatus] = useState(null);

    const [mobileList, setMobileList] = useState(() => {
        if (integrationFlag === 0)
            return data.mobile_number
                ? data.mobile_number
                      .trim()
                      .split(",")
                      .map((x) => x.trim())
                      .filter((x) => x)
                : [];

        if (integrationFlag === 1)
            return data.sender_mobile
                ? data.sender_mobile
                      .trim()
                      .split(",")
                      .map((x) => x.trim())
                      .filter((x) => x)
                : [];

        if (integrationFlag === 2)
            return data.phone_number
                ? data.phone_number
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

    const [callData, setCallData] = useState([]);
    const [page, setPage] = useState({ page: 1, fetching: false, allocateCall: false });

    const [isLogging, setIsLogging] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isFinalising, setIsFinalising] = useState(false);
    const [mustFinalise, setMustFinalise] = useState(false);

    const parent = useMemo(() => {
        try {
            return localStorage.getItem("self") ? JSON.parse(localStorage.getItem("self")) : {};
        } catch (err) {
            return {};
        }
    }, []);

    const handleClickToggleModel = (e) => {
        if (!onClose) return;
        onClose(e);
    };

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

    const fetchCallingHistory = async (params, headers) => {
        setPage({ ...page, fetching: true });
        try {
            const body = {};
            if (data.record_uid) body.record_uid = data.record_uid;
            else if (data.mongodb_record_id) body.record_uid = data.mongodb_record_id;

            const { data: res } = await callingHistory(body, params, headers);
            if (res.status !== "success") throw new Error(res.data?.toString());

            setCallData(res?.data?.callHistory);
        } catch (err) {
            console.log(err.message);
        } finally {
            setPage({ ...page, fetching: false });
        }
    };

    const updateCall = async () => {
        setIsUpdating(true);
        const tId = toast.loading("Updating call record...");
        try {
            const body = {
                user_uid: selectedUser.user_uid,
                lead_call_number: mobileNumber,
                connect_status: connectStatus ? connectStatus.value : -1,
                lead_status: leadStatus ? leadStatus.value : -1,
                ...(data.hasOwnProperty("record_uid")
                    ? { record_uid: data.record_uid }
                    : { record_uid: data.mongodb_record_id }),
                ...(remark && { remarks: remark }),
                ...(contactPerson && { contact_person: contactPerson }),
            };

            const { data: res } = await callingUpdate(body);

            if (res.status !== "success") {
                console.log(res.data);
                throw new Error("Failed to update call record! Please try again.");
            } else {
                toast.dismiss(tId);
                toast.success("Call log updated!\nUpdate more or click 'Finish' to finalise.");
                setMustFinalise(true);
                handleMustFinalise(true);

                setCallRecordUidList((prevList) => {
                    const newList = [...prevList];
                    newList[loggingIndex] = res.data?.call_record_uid;
                    return newList;
                });
                if (connectStatus && connectStatus.value !== 2) {
                    setCallResponseList((prevList) => {
                        const newList = [...prevList];
                        newList[loggingIndex] = connectStatus.label;
                        return newList;
                    });
                } else if (leadStatus && leadStatus.value === 1) {
                    setCallResponseList((prevList) => {
                        const newList = [...prevList];
                        newList[loggingIndex] = leadStatus.label;
                        return newList;
                    });
                } else {
                    setPrimaryCallRecord(res.data?.call_record_uid);
                }

                setMobileNumber(null);
                setContactPerson("");
                setConnectStatus(null);
                setLeadStatus(null);
                setRemark("");

                setIsLogging(false);
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
                user_uid: selectedUser.user_uid,
                call_record_uid: primaryCallRecord,
                integration_flag: integrationFlag,
                ...(data.hasOwnProperty("record_uid")
                    ? { record_uid: data.record_uid }
                    : { record_uid: data.mongodb_record_id }),
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
                onUpdate();
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

    useEffect(() => {
        fetchCallingHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
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
            if (integrationFlag === 0)
                return data.mobile_number
                    ? data.mobile_number
                          .trim()
                          .split(",")
                          .map((x) => x.trim())
                          .filter((x) => x)
                    : [];

            if (integrationFlag === 1)
                return data.sender_mobile
                    ? data.sender_mobile
                          .trim()
                          .split(",")
                          .map((x) => x.trim())
                          .filter((x) => x)
                    : [];

            if (integrationFlag === 2)
                return data.phone_number
                    ? data.phone_number
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
    }, [data]);

    useEffect(() => {
        setCallRecordUidList(new Array(mobileList.length).fill(""));
        setCallResponseList(new Array(mobileList.length).fill(""));
    }, [mobileList]);

    useEffect(() => {
        if (!isLogging) fetchCallingHistory();
    }, [isLogging]);

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

    const handleClickCancel = () => {
        setMobileNumber(null);
        setContactPerson("");
        setConnectStatus(null);
        setLeadStatus(null);
        setRemark("");
        setIsLogging(false);
    };

    const updateButtonDisabled = useMemo(() => {
        return !connectStatus || (connectStatus.value === 2 && !leadStatus) || !mobileNumber;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leadStatus, connectStatus, mobileNumber]);

    const inputDisabled = useMemo(() => {
        return isUpdating || isFinalising;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isUpdating, isFinalising]);

    return (
        <div className="lead_detail bg-white px-6 py-4 shadow-app1 max-w-lg w-full h-full overflow-auto">
            <div className="title flex items-center justify-between mb-5">
                <h5 className="text-lg font-medium">{isLogging ? "Updating Call Log" : "Pending Lead Details"}</h5>

                {!isLogging && !mustFinalise && (
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
                <div className="name flex items-center gap-3 mb max-w-[435px] w-full">
                    <UserIcon />
                    {integrationFlag === 0 && <span>{data.cname}</span>}
                    {integrationFlag === 1 && <span>{data.sender_name}</span>}
                    {integrationFlag === 2 && <span>{data.full_name}</span>}
                </div>
            </div>

            {isLogging && (
                <div className="details p-3 mb-5">
                    <div className="grid grid-cols-8 gap-4 mb-5">
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

                    <div className="grid grid-cols-8 gap-4 mb-5">
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
                        <>
                            <div className="grid grid-cols-8 gap-4 mb-5">
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

                            <div className="grid grid-cols-8 gap-4 mb-5">
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
                                <p className="col-span-3 font-medium">Remarks</p>

                                <span className="col-span-1">:</span>

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
                        </>
                    )}
                </div>
            )}

            {isLogging && (
                <div className="flex items-center justify-center gap-4">
                    <Button
                        className="h-12 w-12 rounded-full !font-bold !p-0"
                        variant="contained"
                        color="green"
                        size="sm"
                        onClick={updateCall}
                        title="Confirm Update Log"
                        disabled={updateButtonDisabled}
                    >
                        <IoCheckmarkSharp size={30} color={"white"} />
                    </Button>

                    <Button
                        className="h-12 w-12 rounded-full !font-bold !p-0"
                        variant="contained"
                        color="red"
                        size="sm"
                        onClick={handleClickCancel}
                        title="Cancel Update"
                    >
                        <IoCloseSharp size={30} color={"white"} />
                    </Button>
                </div>
            )}

            {!isLogging && integrationFlag === 0 && (
                <div className="details p-3 mb-5">
                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Executive Name:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{extractExecNames(data.executive_name) || "-"}</p>
                        </div>
                    </div>

                    {data.contact_person && (
                        <div className="flex flex-row w-full gap-2 mb-5">
                            <p className="basis-1/3 font-medium">Contact Person:</p>
                            <div className="basis-2/3 text-gray-600">
                                <p>{data.contact_person}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium pt-0.5">Mobile Number({mobileList.length}):</p>

                        <div className="basis-2/3">
                            {mobileList.length === 0 && <span className="text-gray-600">-</span>}
                            {mobileList.map((num, index) => (
                                <div key={index} className="flex flex-row items-center w-full mb-2">
                                    <p className="basis-1/2 text-center text-gray-600 font-medium">{num}</p>
                                    {/*callRecordUidList[index] === "" ? (
                                        <div className="basis-1/2 flex justify-center">
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
                                    ) : callResponseList[index] === "" ? (
                                        <div className="basis-1/2 flex items-center justify-center gap-2">
                                            <input
                                                type="radio"
                                                id={`primary_${index}`}
                                                value={num}
                                                checked={callRecordUidList[index] === primaryCallRecord}
                                                onChange={() => handlePrimaryChange(index)}
                                            />
                                            <label htmlFor={`primary_${index}`} className="text-xs font-semibold">
                                                Set as Primary
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="basis-1/2 flex items-center justify-center">
                                            <p className="text-red-500 text-xs font-semibold">
                                                {callResponseList[index]}
                                            </p>
                                        </div>
									)*/}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Email:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{data.email_address || "-"}</p>
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Address:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{data.address || "-"}</p>
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">GST Number:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{data.GST_NUMBER || "-"}</p>
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Turnover:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{data.Turnover || "-"}</p>
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Entity Type:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{data.entity_type || "-"}</p>
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Category/Nature of Business:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{data.nature_of_business || "-"}</p>
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Website Link:</p>
                        <div className="basis-2/3">
                            <a
                                className="text-blue-500 font-normal leading-none hover:underline"
                                href={data.web_link}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {data.web_link}
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {!isLogging && integrationFlag === 1 && (
                <div className="details p-3 mb-5">
                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium pt-0.5">Mobile Number({mobileList.length}):</p>

                        <div className="basis-2/3">
                            {mobileList.length === 0 && <span className="text-gray-600">-</span>}
                            {mobileList.map((num, index) => (
                                <div key={index} className="flex flex-row items-center w-full mb-2">
                                    <p className="basis-1/2 text-center text-gray-600 font-medium">{num}</p>
                                    {/*callRecordUidList[index] === "" ? (
                                        <div className="basis-1/2 flex justify-center">
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
                                    ) : callResponseList[index] === "" ? (
                                        <div className="basis-1/2 flex items-center justify-center gap-2">
                                            <input
                                                type="radio"
                                                id={`primary_${index}`}
                                                value={num}
                                                checked={callRecordUidList[index] === primaryCallRecord}
                                                onChange={() => handlePrimaryChange(index)}
                                            />
                                            <label htmlFor={`primary_${index}`} className="text-xs font-semibold">
                                                Set as Primary
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="basis-1/2 flex items-center justify-center">
                                            <p className="text-red-500 text-xs font-semibold">
                                                {callResponseList[index]}
                                            </p>
                                        </div>
									)*/}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Email:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{data.sender_email || "-"}</p>
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Query Product:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{data.query_product_name || "-"}</p>
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Query Category:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{data.query_mcat_name || "-"}</p>
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Subject:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{data.subject || "-"}</p>
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Query Message:</p>
                        <div className="basis-2/3 text-gray-600">
                            {data.query_message ? <p dangerouslySetInnerHTML={{ __html: data.query_message }} /> : "-"}
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Query Time:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{data.query_time || "-"}</p>
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Address:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{data.sender_address || "-"}</p>
                        </div>
                    </div>
                </div>
            )}

            {!isLogging && integrationFlag === 2 && (
                <div className="details p-3 mb-5">
                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium pt-0.5">Mobile Number({mobileList.length}):</p>

                        <div className="basis-2/3">
                            {mobileList.length === 0 && <span className="text-gray-600">-</span>}
                            {mobileList.map((num, index) => (
                                <div key={index} className="flex flex-row items-center w-full mb-2">
                                    <p className="basis-1/2 text-center text-gray-600 font-medium">{num}</p>
                                    {/*callRecordUidList[index] === "" ? (
                                        <div className="basis-1/2 flex justify-center">
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
                                    ) : callResponseList[index] === "" ? (
                                        <div className="basis-1/2 flex items-center justify-center gap-2">
                                            <input
                                                type="radio"
                                                id={`primary_${index}`}
                                                value={num}
                                                checked={callRecordUidList[index] === primaryCallRecord}
                                                onChange={() => handlePrimaryChange(index)}
                                            />
                                            <label htmlFor={`primary_${index}`} className="text-xs font-semibold">
                                                Set as Primary
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="basis-1/2 flex items-center justify-center">
                                            <p className="text-red-500 text-xs font-semibold">
                                                {callResponseList[index]}
                                            </p>
                                        </div>
									)*/}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Email:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{data.email || "-"}</p>
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Created Time:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{formatFBTimestamp(data.created_time) || "-"}</p>
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Full Address:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{formatFBAddress(data.street_address, data.city, data.state, data.zip_code) || "-"}</p>
                        </div>
                    </div>
                </div>
            )}

            {!isLogging && (
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

export default UpdateCallModel;
