import { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";

import { MdClose, MdAddCall } from "react-icons/md";
import { IoCheckmarkSharp, IoCloseSharp } from "react-icons/io5";
import { BsCalendarFill } from "react-icons/bs";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import { Button, Spinner, UserIcon, WhatsAppIcon } from "../../../components";
import { callingHistory, callingUpdate, leadStatusUpdate, dialNumber } from "../../../apis";

import CallStatus from "../SearchHistory/components/CallStatus";
import Select from "react-select";
import extractExecNames from "../../../utils/extractExecNames";
import formatDate from "../../../utils/formatDate";
import formatFBAddress from "../../../utils/formatFBAddress";
import formatFBTimestamp from "../../../utils/formatFBTimestamp";
import formatTIAddress from "../../../utils/formatTIAddress";
import formatTINumbers from "../../../utils/formatTINumbers";

const connectStatusOptions = [
    { value: 0, label: "Wrong Number" },
    { value: 1, label: "Not Connected" },
    { value: 2, label: "Connected" },
];

const customTagOption = [
    { value: 0, label: "Hot Leads" },
    { value: 1, label: "Good Leads" },
    { value: 2, label: "Avenger" },
];

const leadStatusOptions = [
    { value: 0, label: "Interested" },
    { value: 1, label: "Not Interested" },
    { value: 2, label: "Call Tomorrow" },
    { value: 3, label: "Call Day After" },
    { value: 4, label: "Call Next Week" },
    { value: 5, label: "Call On Specific Date" },
];

const UpdateCallModel = ({ data = {}, integrationFlag, handleMustFinalise, onUpdate, onDial, setUrl, onClose }) => {
    const [mobileNumber, setMobileNumber] = useState(null);
    const [contactPerson, setContactPerson] = useState("");
    const [remark, setRemark] = useState("");
    const [connectStatus, setConnectStatus] = useState(null);
    const [customtagStatus,setCustomTagStatus] = useState(null)
    console.log('customtagStatus',customtagStatus)
    const [leadStatus, setLeadStatus] = useState(null);

    const [dateValue, setDateValue] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(false);
    const [dateModel, setDateModel] = useState(false);
    const customTagData = localStorage.getItem("ctm_data") ? JSON.parse(localStorage.getItem("ctm_data")) : {};
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

        if (integrationFlag === 3)
            return formatTINumbers(data.sender_mobile, data.sender_other_mobiles)
                ? formatTINumbers(data.sender_mobile, data.sender_other_mobiles)
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

    const [dialerModel, setDialerModel] = useState(false);
    const [dialedUid, setDialedUid] = useState(null);
    
   




    const parent = useMemo(() => {
        try {
            return localStorage.getItem("self") ? JSON.parse(localStorage.getItem("self")) : {};
        } catch (err) {
            return {};
        }
    }, []);

    const dialerExt = useMemo(() => {
        try {
            return localStorage.getItem("dialer_extension") ? JSON.parse(localStorage.getItem("dialer_extension")) : "";
        } catch (err) {
            return "";
        }
    }, []);

    const handleClickToggleModel = (e) => {
        if (!onClose) return;
        onClose(e);
    };

    const handleToggleDateModel = () => {
        setDateModel((prev) => !prev);
    };

    const handleDateChange = (val, e) => {
        if (formatDate(val) === formatDate(new Date())) setSelectedDate(false);
        else setSelectedDate(true);
        setDateValue(val);
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
    const handleSelectCustomTagStatus = (option) => {
        setCustomTagStatus(option);
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

    //MAKING CALLS

    const dialCall = async () => {
        try {
            const body = {
                user_uid: parent.parent_user_uid,
                mobile_number: mobileNumber,
                context: "Out_102",
                integration_flag: integrationFlag,
            };

            const { data } = await dialNumber(body);

            if (data.status !== "success") throw new Error(data.data);
            else {
                setDialedUid(data.call_record_uid);
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    useEffect(() => {
        const iframe = document.getElementById("dialer");

        const handleLoad = (event) => {
            setTimeout(() => {
                dialCall();
                console.log("dialer loaded and call made");
            }, 2000);
        };

        const handleTerminate = (event) => {
            const data = event.data.terminateflag;
            if (data) {
                console.log("call ended");
            }
        };

        if (dialerModel) {
            if (iframe) {
                // Wait for the iframe to load
                iframe.addEventListener("load", handleLoad);
                window.addEventListener("message", handleTerminate);
            }
        }

        return () => {
            if (!dialerModel) {
                //const iframe = document.getElementById("dialer");
                // Make sure the iframe exists before trying to remove event listeners
                if (iframe) {
                    iframe.removeEventListener("load", handleLoad);
                    window.removeEventListener("message", handleTerminate);
                }
            }
        };
    }, [dialerModel]);

    //END MAKIKNG CALLS

    const updateCall = async () => {
        setIsUpdating(true);
        const tId = toast.loading("Updating call record...");
        try {
            const body = {
                user_uid: parent.parent_user_uid, 
                lead_call_number: mobileNumber,
                custom_flag:customtagStatus.sequence_id,
                connect_status: connectStatus ? connectStatus.value : -1,
                lead_status: leadStatus ? leadStatus.value : -1,
                ...(data.hasOwnProperty("record_uid")
                    ? { record_uid: data.record_uid }
                    : { record_uid: data.mongodb_record_id }),
                ...(remark && { remarks: remark }),
                ...(contactPerson && { contact_person: contactPerson }),
                ...(dialedUid && { call_record_uid: dialedUid }),
                ...(leadStatus && leadStatus.value === 5 && { call_back_date: formatDate(dateValue) }),
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
                setDialedUid(null);
                onDial(false);
                setUrl("");
                setDialerModel(false);

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
            setDateValue(new Date());
            setSelectedDate(false);
            setDateModel(false);
            setRemark("");
            setDialedUid(null);
            onDial(false);
            setUrl("");
            setDialerModel(false);
        } finally {
            fetchCallingHistory();
        }
    };

    const finaliseUpdate = async () => {
        setIsFinalising(true);
        const tId = toast.loading("Finalising updated record...");
        try {
            const body = {
                user_uid: parent.parent_user_uid,
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
            setDateValue(new Date());
            setSelectedDate(false);
            setDateModel(false);
            setRemark("");
        }
    };

    useEffect(() => {
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

            if (integrationFlag === 3)
                return formatTINumbers(data.sender_mobile, data.sender_other_mobiles)
                    ? formatTINumbers(data.sender_mobile, data.sender_other_mobiles)
                          .trim()
                          .split(",")
                          .map((x) => x.trim())
                          .filter((x) => x)
                    : [];
        });
        setCallRecordUidList([]);
        setCallResponseList([]);

        setDialerModel(false);
        setDialedUid(null);

        setCallData([]);
        setPage({ page: 1, fetching: false, allocateCall: false });
        fetchCallingHistory();
    }, [data]);

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

    const handleClickDialCall = (index) => {
        if (!dialerExt) {
            toast.error("You must be integrated with the Dialer to make calls!");
            return;
        }
        setMobileNumber(mobileList[index]);
        setLoggingIndex(index);
        setDialedUid(null);
        setIsLogging(true);

        setUrl(
            `https://sanpbxsl.sansoftwares.com/pbxadmin/dialplanapi/sanweb?ext=${dialerExt}&pwd=$@n_B@B@_${dialerExt}&wsport=8089&udpport=7835&ip=sanpbxsl.sansoftwares.com&lines=1&token=VXlPeDBuekJGVGNSLzJoM1o5NE1NQT09`
        );
        //setUrl(`https://sanpbxsl.sansoftwares.com/pbxadmin/webphone/getwebphone/${dialerExt}`);

        onDial(true);
        setDialerModel(true);
    };

    const handleClickLogCall = (index) => {
        setMobileNumber(mobileList[index]);
        setLoggingIndex(index);
        setDialedUid(null);
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
        setDateValue(new Date());
        setSelectedDate(false);
        setDateModel(false);
        setRemark("");
        setIsLogging(false);
        onDial(false);
        setDialerModel(false);
        setDialedUid(null);
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

    const callDisabled = useMemo(() => {
        return !Boolean(dialerExt);
    }, [dialerExt]);



     /***Custom tag dropdown content */
    //  const [customTagData, setCustomTagData] = useState(null)
    //  console.log(customTagData,'customTagData is here')
    //  useEffect(() => {
    //      const fetchData = async () => {
    //        try {
    //          const response = await fetch('http://13.234.159.105/dashboard/showAllLeads2', {
    //            method: 'POST',
    //            headers: {
    //              'Content-Type': 'application/json',
    //            },
    //            body: JSON.stringify({
    //              jwt_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InNoaXZhbTc5OWt1bWFyQGdtYWlsLmNvbSIsImV4cCI6MTcwMjM1NzQwMX0.z2kCpcVkTj2DuiQRxYbwmoIKBzjCzcHvJyAN0hSFEJ8',
    //              page: 1,
    //              GST_NUMBER: 0,
    //              Turnover: 0,
    //              search_query: '',
    //              include_email: 0,
    //              include_mobile_number: 0,
    //              five_recent_searches: 1,
    //              include_turnover_ranges: [],
    //            }),
    //          });
     
    //          if (!response.ok) {
    //            throw new Error(`HTTP error! Status: ${response.status}`);
    //          }
     
    //          const responseData = await response.json();
    //          setCustomTagData(responseData.data.ctm_data);
    //        } catch (error) {
    //          console.error('Error fetching data:', error.message);
    //        }
    //      };
     
    //      fetchData();
    //    }, []);



    //    const customTagOption = customTagData.data.ctm

    return (
        <div className="lead_detail bg-white px-6 py-4 shadow-app1 max-w-xl w-full h-full overflow-auto overscroll-contain pointer-events-auto">
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
                    {(integrationFlag === 1 || integrationFlag === 3) && <span>{data.sender_name}</span>}
                    {integrationFlag === 2 && <span>{data.full_name}</span>}
                </div>
            </div>
             
            {isLogging && (
                
                <div className="details p-3">
                <div className="grid grid-cols-8 items-center gap-4 mb-5">
                        <p className="col-span-3 font-medium">
                            Custom Tag 
                        </p>

                        <span className="col-span-1">:</span>

                        <div className="col-span-4">
                            <Select
                                name="customtagStatus"
                                id="customtagStatus"
                                value={customtagStatus}
                                options={customTagData}
                                onChange={handleSelectCustomTagStatus}
                                placeholder={"Select..."}
                                getOptionLabel={(option) => {
                                    return <span className="flex items-center justify-start">{option.custom_tag}</span>;
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

            {isLogging && (
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
                        <p className="basis-1/3 font-medium pt-0.5">Mobile Number ({mobileList.length}):</p>

                        <div className="basis-2/3">
                            {mobileList.length === 0 && <span className="text-gray-600">-</span>}
                            {mobileList.map((num, index) => (
                                <div key={index} className="flex flex-row items-center w-full mb-2">
                                    <p className="basis-1/3 text-gray-600 font-medium">{num}</p>
                                    {callRecordUidList[index] === "" ? (
                                        <div className="basis-2/3 ml-3 flex gap-1">
                                            <Button
                                                variant="contained"
                                                color="green"
                                                size="sm"
                                                onClick={() => handleClickDialCall(index)}
                                                title={`Dial Call for ${num}`}
                                                disabled={callDisabled}
                                            >
                                                Dial Call
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="blue"
                                                size="sm"
                                                onClick={() => handleClickLogCall(index)}
                                                title={`Add Call Log for ${num}`}
                                            >
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
                                                <label htmlFor={`primary_${index}`} className="text-xs font-semibold">
                                                    Set as Primary
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {callDisabled && (
                        <div className="flex flex-col items-center justify-center w-full border-2 border-red-500 rounded-md p-2 mb-5 gap-2">
                            <p className="flex items-center font-medium">
                                You must be integrated with the Dialer to use "Dial Call"!
                            </p>
                            <p className="flex items-center gap-1">
                                For Dialer Integration, please contact us on
                                <a
                                    href={`https://wa.me/+919354304061`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-block"
                                >
                                    <Button variant="contained" color="green" size="sm" className="!gap-1">
                                        <WhatsAppIcon color="#FFFFFF" />
                                        +919354304061
                                    </Button>
                                </a>
                            </p>
                        </div>
                    )}

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
                                className="text-blue-500 font-normal leading-none break-all hover:underline"
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
                    {data.sender_company && (
                        <div className="flex flex-row w-full gap-2 mb-5">
                            <p className="basis-1/3 font-medium">Sender Company:</p>
                            <div className="basis-2/3 text-gray-600">
                                <p>{data.sender_company || "-"}</p>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium pt-0.5">Mobile Number({mobileList.length}):</p>

                        <div className="basis-2/3">
                            {mobileList.length === 0 && <span className="text-gray-600">-</span>}
                            {mobileList.map((num, index) => (
                                <div key={index} className="flex flex-row items-center w-full mb-2">
                                    <p className="basis-1/3 text-gray-600 font-medium">{num}</p>
                                    {callRecordUidList[index] === "" ? (
                                        <div className="basis-2/3 ml-3 flex gap-1">
                                            <Button
                                                variant="contained"
                                                color="green"
                                                size="sm"
                                                onClick={() => handleClickDialCall(index)}
                                                title={`Dial Call for ${num}`}
                                                disabled={callDisabled}
                                            >
                                                Dial Call
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="blue"
                                                size="sm"
                                                onClick={() => handleClickLogCall(index)}
                                                title={`Add Call Log for ${num}`}
                                            >
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
                                                <label htmlFor={`primary_${index}`} className="text-xs font-semibold">
                                                    Set as Primary
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {callDisabled && (
                        <div className="flex flex-col items-center justify-center w-full border-2 border-red-500 rounded-md p-2 mb-5 gap-2">
                            <p className="flex items-center font-medium">
                                You must be integrated with the Dialer to use "Dial Call"!
                            </p>
                            <p className="flex items-center gap-1">
                                For Dialer Integration, please contact us on
                                <a
                                    href={`https://wa.me/+919354304061`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-block"
                                >
                                    <Button variant="contained" color="green" size="sm" className="!gap-1">
                                        <WhatsAppIcon color="#FFFFFF" />
                                        +919354304061
                                    </Button>
                                </a>
                            </p>
                        </div>
                    )}

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
                                    <p className="basis-1/3 text-gray-600 font-medium">{num}</p>
                                    {callRecordUidList[index] === "" ? (
                                        <div className="basis-2/3 ml-3 flex gap-1">
                                            <Button
                                                variant="contained"
                                                color="green"
                                                size="sm"
                                                onClick={() => handleClickDialCall(index)}
                                                title={`Dial Call for ${num}`}
                                                disabled={callDisabled}
                                            >
                                                Dial Call
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="blue"
                                                size="sm"
                                                onClick={() => handleClickLogCall(index)}
                                                title={`Add Call Log for ${num}`}
                                            >
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
                                                <label htmlFor={`primary_${index}`} className="text-xs font-semibold">
                                                    Set as Primary
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {callDisabled && (
                        <div className="flex flex-col items-center justify-center w-full border-2 border-red-500 rounded-md p-2 mb-5 gap-2">
                            <p className="flex items-center font-medium">
                                You must be integrated with the Dialer to use "Dial Call"!
                            </p>
                            <p className="flex items-center gap-1">
                                For Dialer Integration, please contact us on
                                <a
                                    href={`https://wa.me/+919354304061`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-block"
                                >
                                    <Button variant="contained" color="green" size="sm" className="!gap-1">
                                        <WhatsAppIcon color="#FFFFFF" />
                                        +919354304061
                                    </Button>
                                </a>
                            </p>
                        </div>
                    )}

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

            {!isLogging && integrationFlag === 3 && (
                <div className="details p-3 mb-5">
                    {data.sender_company && (
                        <div className="flex flex-row w-full gap-2 mb-5">
                            <p className="basis-1/3 font-medium">Sender Company:</p>
                            <div className="basis-2/3 text-gray-600">
                                <p>{data.sender_company || "-"}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium pt-0.5">Mobile Number ({mobileList.length}):</p>

                        <div className="basis-2/3">
                            {mobileList.length === 0 && <span className="text-gray-600">-</span>}
                            {mobileList.map((num, index) => (
                                <div key={index} className="flex flex-row items-center w-full mb-2">
                                    <p className="basis-1/3 text-gray-600 font-medium">{num}</p>
                                    {callRecordUidList[index] === "" ? (
                                        <div className="basis-2/3 ml-3 flex gap-1">
                                            <Button
                                                variant="contained"
                                                color="green"
                                                size="sm"
                                                onClick={() => handleClickDialCall(index)}
                                                title={`Dial Call for ${num}`}
                                                disabled={callDisabled}
                                            >
                                                Dial Call
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="blue"
                                                size="sm"
                                                onClick={() => handleClickLogCall(index)}
                                                title={`Add Call Log for ${num}`}
                                            >
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
                                                <label htmlFor={`primary_${index}`} className="text-xs font-semibold">
                                                    Set as Primary
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {callDisabled && (
                        <div className="flex flex-col items-center justify-center w-full border-2 border-red-500 rounded-md p-2 mb-5 gap-2">
                            <p className="flex items-center font-medium">
                                You must be integrated with the Dialer to use "Dial Call"!
                            </p>
                            <p className="flex items-center gap-1">
                                For Dialer Integration, please contact us on
                                <a
                                    href={`https://wa.me/+919354304061`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-block"
                                >
                                    <Button variant="contained" color="green" size="sm" className="!gap-1">
                                        <WhatsAppIcon color="#FFFFFF" />
                                        +919354304061
                                    </Button>
                                </a>
                            </p>
                        </div>
                    )}

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Inquiry Type:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{data.inquiry_type || "-"}</p>
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Product Name:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{data.product_name || "-"}</p>
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Product Source:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{data.product_source || "-"}</p>
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Inquiry Source:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{data.source || "-"}</p>
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Subject:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{data.subject || "-"}</p>
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Sender Address:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{formatTIAddress(data.sender_city, data.sender_state, data.sender_country) || "-"}</p>
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Generated Date:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{data.generated_date || "-"}</p>
                        </div>
                    </div>

                    <div className="flex flex-row w-full gap-2 mb-5">
                        <p className="basis-1/3 font-medium">Generated Time:</p>
                        <div className="basis-2/3 text-gray-600">
                            <p>{data.generated_time || "-"}</p>
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

export default UpdateCallModel;
