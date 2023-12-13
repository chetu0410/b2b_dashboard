import { useEffect, useMemo, useState } from "react";
import { MdClose } from "react-icons/md";
import { BiSupport } from "react-icons/bi";
import { getContactList } from "../../apis";
import Button from "../Button/Button";
import CheckBox from "../CheckBox/CheckBox";

import { LuCalendarClock } from "react-icons/lu";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

import "../../assets/css/sendmessage.css";
import "../../assets/css/imagemodal.css";
import ImageModal from "./ImageModal";
import ContactModel from "./ContactModel";
import TemplateModel from "./TemplateModel";
import formatTINumbers from "../../utils/formatTINumbers";
import formatDate from "../../utils/formatDate";

const SendMessageComponent = ({ user_uid, leadData = [], selectedLeads = [], integrationFlag, onClose }) => {
    const { v4: uuidv4 } = require("uuid");
    const [selectedType, setSelectedType] = useState("selected");
    const [customError, setCustomError] = useState(null);

    const [receiverPhoneNumber, setReceiverPhoneNumber] = useState("");
    const [message, setMessage] = useState("");

    const [lastLoginTime, setLastLoginTime] = useState("");

    const [scheduledDateValue, setScheduledDateValue] = useState(new Date());
    const [scheduledTimeValue, setScheduledTimeValue] = useState(new Date());
    const [minTime, setMinTime] = useState(new Date());
    const [useScheduled, setUseScheduled] = useState(false);
    const [scheduleModel, setScheduleModel] = useState(false);

    const [useContacts, setUseContacts] = useState(true);
    const [contactList, setContactList] = useState([]);
    const [contactId, setContactId] = useState(null);
    const [contactError, setContactError] = useState(null);

    const [isSending, setIsSending] = useState(false);
    const [seleniumStatus, setSeleniumStatus] = useState(
        /*cookieHelper.getCookie("selenium-status") === "true" ? true :*/ null
    );

    const [isSuccess, setIsSuccess] = useState(false);
    const [phoneNumberError, setPhoneNumberError] = useState(null);
    const [fileSizeError, setFileSizeError] = useState(null);

    const [image, setImage] = useState(null);
    const [file, setFile] = useState(null);

    const [showModal, setShowModal] = useState(false);

    const [showContactModel, setShowContactModel] = useState(false);
    const [showTemplateModel, setShowTemplateModel] = useState(true);
    //const [showFilesModel, setShowFilesModel] = useState(false);

    const handleClickToggleModel = (e) => {
        if (!onClose) return;
        onClose(e);
    };

    const handleReceiverPhoneChange = (e) => {
        setReceiverPhoneNumber(e.target.value);
    };

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
    };

    const handleChangeScheduleCheckBox = () => {
        setUseScheduled(!useScheduled);
    };

    useEffect(() => {
        if (useScheduled) {
            const currentTime = new Date();
            setMinTime(new Date(currentTime.getTime() + 60 * 60 * 1000));
        } else {
            setScheduleModel(false);
        }
    }, [useScheduled]);

    useEffect(() => {
        setScheduledDateValue(new Date(minTime.getFullYear(), minTime.getMonth(), minTime.getDate()));
        setScheduledTimeValue(
            formatDate(
                new Date(
                    minTime.getFullYear(),
                    minTime.getMonth(),
                    minTime.getDate(),
                    minTime.getHours(),
                    minTime.getMinutes(),
                    minTime.getSeconds()
                ),
                "hh:mm"
            )
        );
    }, [minTime]);

    const handleToggleScheduleModel = () => {
        setScheduleModel((prev) => !prev);
    };

    const handleColChange = (tab) => {
        switch (tab) {
            case "contacts":
                setShowTemplateModel(false);
                //setShowFilesModel(false);
                setShowContactModel(true);
                break;
            case "templates":
                //setShowFilesModel(false);
                setShowContactModel(false);
                setShowTemplateModel(true);
                break;
            /*case "files":
                setShowTemplateModel(false);
                setShowContactModel(false);
                setShowFilesModel(true);
                break;*/
            default:
                setShowTemplateModel(false);
                //setShowFilesModel(false);
                setShowContactModel(false);
        }
    };

    const handleTemplateChange = (message) => {
        if (!inputDisabled) setMessage(message);
    };

    const handleChangeContactCheckBox = () => {
        setUseContacts(!useContacts);
    };

    const fetchContacts = async () => {
        setContactList([]);
        setContactId(null);
        try {
            const { data: res } = await getContactList({
                user_uid: user_uid,
            });

            if (res.status !== "Success") throw Error(res.message);
            else if (res.message.includes("No result found for given user_uid")) throw Error(res.message);
            else {
                setContactList(res.team_data[0]?.phone_numbers);
                setContactId(res.team_data[0]?.team_contact_id);
            }
        } catch (err) {
            if (err.message.includes("No result found for given user_uid")) return null;
            else setContactError(err.message);
        }
    };

    const handleContactChange = () => {
        if (useContacts) fetchContacts();
    };

    useEffect(() => {
        handleContactChange();
    }, [useContacts]);

    function extractMobileNumbers() {
        const numbers = [];

        if (integrationFlag === 0) {
            // SEARCH HISTORY AND MY DATA
            selectedLeads.forEach((id) => {
                const lead = leadData.find((data) => data.id === id);

                if (lead && lead.mobile_number) {
                    const mobileNumbers = lead.mobile_number
                        .trim()
                        .split(",")
                        .map((x) => x.trim().replace(/^(\+\s*)/, ""))
                        .filter((x) => x);

                    numbers.push([lead.record_uid, ...mobileNumbers]);
                }
            });
        } else if (integrationFlag === 1) {
            // INDIAMART DATA
            selectedLeads.forEach((mongodb_record_id) => {
                const lead = leadData.find((data) => data.mongodb_record_id === mongodb_record_id);

                if (lead && lead.mobile) {
                    const mobileNumbers = lead.mobile
                        .trim()
                        .split(",")
                        .map((x) => x.trim().replace(/^(\+\s*)/, ""))
                        .filter((x) => x);

                    numbers.push([lead.mongodb_record_id, ...mobileNumbers]);
                }
            });
        } else if (integrationFlag === 2) {
            // FACEBOOK DATA
            selectedLeads.forEach((mongodb_record_id) => {
                const lead = leadData.find((data) => data.mongodb_record_id === mongodb_record_id);

                if (lead && lead.phone_number) {
                    const mobileNumbers = lead.phone_number
                        .trim()
                        .split(",")
                        .map((x) => x.trim().replace(/^(\+\s*)/, ""))
                        .filter((x) => x);

                    numbers.push([lead.mongodb_record_id, ...mobileNumbers]);
                }
            });
        } else if (integrationFlag === 3) {
            // TRADEINDIA DATA
            selectedLeads.forEach((mongodb_record_id) => {
                const lead = leadData.find((data) => data.mongodb_record_id === mongodb_record_id);

                const nums = formatTINumbers(lead.sender_mobile, lead.sender_other_mobiles);

                if (lead && nums) {
                    const mobileNumbers = nums
                        .trim()
                        .split(",")
                        .map((x) => x.trim().replace(/^(\+\s*)/, ""))
                        .filter((x) => x);

                    numbers.push([lead.mongodb_record_id, ...mobileNumbers]);
                }
            });
        }
        return numbers;
    }

    async function enqMessage(file, receiver_numbers) {
        const url = "https://wa-mktg.trending-trends.com/enqueue_message";

        const fileUrl = "https://tools.procbee.in/upload";
        const formData = new FormData();
        let fileLink = [],
            fileType = [],
            campaignUid = uuidv4();
        /*
		for (const key in body) {
			formData.append(key, body[key]);
		}
		*/
        if (file) {
            formData.append("file", file);
            formData.append("user_uid", user_uid);

            const response = await fetch(fileUrl, {
                method: "POST",
                body: formData,
            });

            if (response.status !== 200) {
                console.error(response);
                throw new Error("Error occured in uploading file.");
            } else {
                const fileResponse = await response.json();

                fileLink.push(fileResponse.data.downloadLink);
                if (file.type.includes("image")) fileType.push("image");
                else if (file.type.includes("pdf")) fileType.push("pdf");
            }
        } else {
            fileLink = [];
            fileType = [];
        }

        const body = {
            user_uid: user_uid,
            message: message,
            phone_number_set: receiver_numbers,
            image: fileLink,
            type: fileType,
            time_scheduled: useScheduled
                ? formatDate(formatScheduleTime(scheduledDateValue, scheduledTimeValue), "yyyy-mm-dd hh:mm:ss")
                : formatDate(new Date(), "yyyy-mm-dd hh:mm:ss"),
            logout_flag: 0,
            campaign_uid: campaignUid,
        };

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return data.message;
    }

    const handleSendMessage = () => {
        setIsSuccess(false);
        setIsSending(true);
        setCustomError(null);

        let numbers;
        if (selectedType === "manual") {
            numbers = [
                [
                    "dummy_manual_uid",
                    ...receiverPhoneNumber
                        .split(",")
                        .map((item) => item.trim())
                        .filter((x) => x),
                ],
            ];
        } else if (selectedType === "selected") {
            numbers = extractMobileNumbers();
            if ((!numbers || numbers.length === 0) && (!useContacts || (useContacts && contactList.length === 0))) {
                setPhoneNumberError("No phone number found in selected leads.");
                //stopCountdown();
                //setTryCount(0);
                setIsSending(false);
                setIsSuccess(false);
                return;
            }
        }

        if (useContacts && contactList.length !== 0) numbers.push(["dummy_teamcontact_uid", ...contactList]);

        if (seleniumStatus) {
            enqMessage(file, numbers)
                .then((message) => {
                    if (message.includes("please schedule your messages accordingly")) {
                        setCustomError(message);
                    } else {
                        setCustomError(null);
                    }
                    setIsSuccess(true);
                    setIsSending(false);
                })
                .catch((err) => {
                    setCustomError(err.message);
                    setIsSending(false);
                    setIsSuccess(false);
                    return;
                });
            return;
        } else {
            setCustomError("Please sign-in for Marketing WhatsApp for sending messages!");
            setIsSending(false);
            setIsSuccess(false);
            return;
        }
    };

    // Helper function to convert ArrayBuffer to Base64
    function arrayBufferToBase64(buffer) {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    const buttonDisabled = useMemo(() => {
        return (
            (!receiverPhoneNumber && selectedType === "manual") ||
            !message ||
            isSuccess ||
            !seleniumStatus ||
            (useScheduled && scheduledTimeValue === null)
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [receiverPhoneNumber, message, isSuccess, seleniumStatus, useScheduled, scheduledTimeValue]);

    const inputDisabled = useMemo(() => {
        return !seleniumStatus || isSuccess;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seleniumStatus, isSuccess]);

    const [selectedCount, setSelectedCount] = useState(0);

    useEffect(() => {
        const getSelectedCount = async () => {
            const numbers = extractMobileNumbers();
            const numCount = [].concat(...numbers);
            setSelectedCount(numCount.length - numbers.length);
            //const numCount = [].concat(...numbers);
            //setSelectedCount(numbers.length);
        };
        getSelectedCount();
        // eslint-disable-next-line react-hooks/exhaustive-deps

        const checkSeleniumStatus = async () => {
            //const url = "https://wa-mktg.trending-trends.com/wa_logincheck";
            const url = "https://wa-mktg.trending-trends.com/wa_login_record_check";

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_uid: user_uid }),
            });

            if (response.status === 200) {
                const data = await response.json();
                if (data.login_status === 1) {
                    setSeleniumStatus(true);
                    setLastLoginTime(data.last_check_time);
                } else setSeleniumStatus(false);
            } else {
                console.error(response);
                setCustomError("Error occured in checking login. Please try again later.");
                setIsSending(false);
                setIsSuccess(false);
            }

            /*if (response.status === 200) {
                setSeleniumStatus(true);
                setLastLoginTime("your device.");
            } else if (response.status === 403) setSeleniumStatus(false);
            else {
                console.error(response);
                setIsLoading(false);
                setGenerateQrCodeText("Retry");
                setCustomError("Error occured in checking login. Please try again later.");
                setIsSending(false);
                stopCountdown();
                setTryCount(0);
                setIsSending(false);
                setIsSuccess(false);
            }*/
        };
        checkSeleniumStatus();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        /*setFile(file);
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
            const base64 = arrayBufferToBase64(reader.result);
            setImage(base64);
        };
        reader.onerror = (error) => {
            console.error(error);
        };*/

        setFileSizeError(null);

        const fileSize = file.size / (1024 * 1024);

        if (fileSize <= 10) {
            setFile(file);

            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = () => {
                const base64 = arrayBufferToBase64(reader.result);
                setImage(base64);
            };
            reader.onerror = (error) => {
                console.error(error);
            };
        } else {
            setFileSizeError("Too big! File size should not be more than 10MB!");
            document.getElementById("file").value = null; // Clear the input field
            setFile(null);
        }
    };

    const showImageInModal = () => {
        setShowModal(true);
    };

    const isFilePdf = useMemo(() => {
        if (file) {
            return file.type === "application/pdf";
        }
        return false;
    }, [file]);

    const formatScheduleTime = (date, time) => {
        if (!time) time = formatDate(minTime, "hh:mm");
        const [hours, minutes] = time.split(":").map(Number);

        // Creating a new Date object by setting the hours, minutes, and seconds
        const combinedTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, "00");

        if (combinedTime < minTime) return minTime;
        else return combinedTime;
    };

    return (
        <div className="scrollable-container">
            <div className="p-8 max-w-4xl w-full mx-auto mt-4 mb-4 bg-white rounded-lg shadow-lg hero">
                <div className="title flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold flex gap-2 items-center justify-left">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_339_30)">
                                <path d="M2 3V10.8L18 12L2 13.2V21L22 12L2 3Z" fill="#25d366" />
                            </g>
                            <defs>
                                <clipPath id="clip0_339_30">
                                    <rect width="24" height="24" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                        Send Message
                    </h2>

                    <span
                        className="h-8 w-8 f-center bg-gray rounded-full cursor-pointer"
                        onClick={(e) => handleClickToggleModel(e)}
                    >
                        <MdClose className="text-lg" />
                    </span>
                </div>

                <div className="grid grid-cols-2 divide-x divide-dashed divide-neutral-300 gap-2">
                    <div className="relative">
                        <div className="mb-2">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block font-bold text-sm">
                                    Set Receiver(s): <span className="text-red-500">*</span>
                                </label>
                                <Button
                                    variant={showContactModel ? "filled" : "outlined"}
                                    color="blue"
                                    size="xs"
                                    onClick={() => handleColChange("contacts")}
                                    className="!border !border-blue-600 !px-2"
                                    disabled={inputDisabled}
                                >
                                    Team Contacts
                                </Button>
                            </div>
                            <div className="flex gap-4 items-center ">
                                <div className="flex items-center justify-center gap-2">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="manual"
                                        id="manual"
                                        onChange={(e) => {
                                            setPhoneNumberError(null);
                                            setSelectedType(e.target.value);
                                        }}
                                        checked={selectedType === "manual"}
                                        disabled={inputDisabled}
                                    />
                                    <label htmlFor="manual" className="block font-medium text-sm">
                                        Manual Input
                                    </label>
                                </div>

                                <div className="flex items-center justify-center gap-2">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="selected"
                                        id="selected"
                                        checked={selectedType === "selected"}
                                        onChange={(e) => {
                                            setSelectedType(e.target.value);
                                            setPhoneNumberError(null);
                                            setReceiverPhoneNumber("");
                                        }}
                                        disabled={inputDisabled}
                                    />
                                    <label htmlFor="selected" className="block font-medium text-sm">
                                        Selected Leads {""}
                                        <span className="text-xs text-gray-500">({selectedCount} numbers)</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {selectedType === "manual" && (
                            <>
                                <div className="mb-2">
                                    <label htmlFor="receiverPhoneNumber" className="block font-bold mb-1 text-sm">
                                        Receiver Phone Number(s): <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        disabled={inputDisabled || selectedType === "selected"}
                                        type="text"
                                        id="receiverPhoneNumber"
                                        value={receiverPhoneNumber}
                                        placeholder="918882908807"
                                        onChange={handleReceiverPhoneChange}
                                        className="w-full text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                    />
                                </div>
                                <p className="text-xs text-gray-500">Use commas for multiple numbers.</p>
                            </>
                        )}
                        {phoneNumberError && (
                            <div className="flex items-center mb-2">
                                <p className="text-red-500 text-center text-xs">{phoneNumberError}</p>
                            </div>
                        )}

                        <div className="flex items-center my-2">
                            <CheckBox
                                disabled={inputDisabled}
                                id="useContacts"
                                size="sm"
                                checked={useContacts}
                                onChange={(e) => handleChangeContactCheckBox()}
                            />
                            <label htmlFor="useContacts" className="ml-2 font-medium text-sm">
                                Send to Team Contacts{" "}
                                <span className="text-xs text-gray-500">({contactList.length} numbers)</span>
                            </label>
                        </div>
                        {contactError && (
                            <div className="flex items-center mb-2">
                                <p className="text-red-500 text-center text-xs">{contactError}</p>
                            </div>
                        )}

                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="message" className="block font-bold text-sm">
                                    Message: <span className="text-red-500">*</span>
                                </label>
                                <Button
                                    variant={showTemplateModel ? "filled" : "outlined"}
                                    color="green"
                                    size="xs"
                                    onClick={() => handleColChange("templates")}
                                    className="!border !border-green-600 !px-2"
                                    disabled={inputDisabled}
                                >
                                    My Templates
                                </Button>
                            </div>
                            <textarea
                                disabled={inputDisabled}
                                id="message"
                                value={message}
                                onChange={handleMessageChange}
                                className="w-full text-sm px-4 py-2 border rounded-md resize-none focus:outline-none focus:border-blue-400"
                                rows="4"
                            ></textarea>
                            <p className="text-xs text-gray-500 mt-2">Supports WhatsApp-style Markdown formatting.</p>
                        </div>

                        {/*<div className="mb-4">
                            <MessagePreview markdownText={message} />
                        </div>*/}

                        <div className="mb-4">
                            <label htmlFor="file" className="block font-bold mb-1 text-sm">
                                File:
                            </label>
                            {!image && (
                                <>
                                    <input
                                        disabled={inputDisabled}
                                        type="file"
                                        id="file"
                                        accept="image/*,application/pdf"
                                        onChange={handleImageChange}
                                        className="w-full text-sm px-4 py-2 border rounded-md resize-none focus:outline-none focus:border-blue-400"
                                        rows="4"
                                    ></input>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Only images and pdf files are allowed.
                                        <br />
                                        (Maximum Size: 10MB)
                                    </p>
                                    <div className="flex items-center mb-2">
                                        <p className="text-red-500 text-center text-xs">{fileSizeError}</p>
                                    </div>
                                </>
                            )}

                            {image && (
                                <>
                                    <div className="image-modal-container mt-2 p-1 border-2 rounded w-24 h-full flex items-center justify-center relative">
                                        <div className="container-background"></div>
                                        <span
                                            className="absolute cursor-pointer text-white top-0 right-0 w-4 h-4 flex items-center justify-center bg-red-500 rounded-full shadow-xl hover:bg-red-600 hover:shadow-none hover:text-white"
                                            onClick={() => {
                                                setImage("");
                                                setFile("");
                                            }}
                                            title="Remove"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="icon icon-tabler icon-tabler-x"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                <path d="M18 6l-12 12" />
                                                <path d="M6 6l12 12" />
                                            </svg>
                                        </span>
                                        {isFilePdf ? (
                                            <svg
                                                width="48"
                                                height="48"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M3 0H15.745L22.5 6.729V22.5C22.5 23.329 21.828 24 21 24H3C2.172 24 1.5 23.329 1.5 22.5V1.5C1.5 0.671 2.172 0 3 0Z"
                                                    fill="#E2574C"
                                                />
                                                <path
                                                    d="M22.478 6.74965H17.25C16.422 6.74965 15.75 6.07765 15.75 5.24965V0.0146484L22.478 6.74965Z"
                                                    fill="#B53629"
                                                />
                                                <path
                                                    d="M16.8728 11.3718C17.1238 11.3718 17.2468 11.1528 17.2468 10.9408C17.2468 10.7208 17.1188 10.5088 16.8728 10.5088H15.4418C15.1618 10.5088 15.0058 10.7408 15.0058 10.9968V14.5138C15.0058 14.8278 15.1838 15.0018 15.4258 15.0018C15.6658 15.0018 15.8448 14.8278 15.8448 14.5138V13.5488H16.7108C16.9798 13.5488 17.1138 13.3288 17.1138 13.1108C17.1138 12.8968 16.9798 12.6848 16.7108 12.6848H15.8448V11.3728H16.8718L16.8728 11.3718ZM12.0358 10.5088H10.9888C10.7048 10.5088 10.5028 10.7038 10.5028 10.9928V14.5158C10.5028 14.8748 10.7928 14.9878 11.0008 14.9878H12.0998C13.3998 14.9878 14.2588 14.1318 14.2588 12.8108C14.2578 11.4148 13.4498 10.5088 12.0358 10.5088ZM12.0858 14.1198H11.4478V11.3778H12.0228C12.8938 11.3778 13.2718 11.9618 13.2718 12.7678C13.2718 13.5228 12.8998 14.1198 12.0858 14.1198ZM8.25184 10.5088H7.21384C6.92084 10.5088 6.75684 10.7018 6.75684 10.9968V14.5138C6.75684 14.8278 6.94384 15.0018 7.19584 15.0018C7.44784 15.0018 7.63484 14.8278 7.63484 14.5138V13.4868H8.28484C9.08684 13.4868 9.74984 12.9178 9.74984 12.0038C9.74984 11.1088 9.11084 10.5088 8.24984 10.5088H8.25184ZM8.23484 12.6618H7.63684V11.3348H8.23484C8.60384 11.3348 8.83884 11.6228 8.83884 11.9988C8.83784 12.3738 8.60384 12.6618 8.23484 12.6618Z"
                                                    fill="white"
                                                />
                                            </svg>
                                        ) : (
                                            <img src={`data:${file?.type};base64,${image}`} alt="" />
                                        )}
                                        {!isFilePdf && (
                                            <span
                                                className="absolute cursor-pointer text-white left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center hover:text-gray-100"
                                                onClick={showImageInModal}
                                                title="Full View"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="icon icon-tabler icon-tabler-zoom-in-filled"
                                                    width="24"
                                                    height="24"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.5"
                                                    stroke="currentColor"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                    <path
                                                        d="M14 3.072a8 8 0 0 1 2.617 11.424l4.944 4.943a1.5 1.5 0 0 1 -2.008 2.225l-.114 -.103l-4.943 -4.944a8 8 0 0 1 -12.49 -6.332l-.006 -.285l.005 -.285a8 8 0 0 1 11.995 -6.643zm-4 2.928a1 1 0 0 0 -.993 .883l-.007 .117v2h-2l-.117 .007a1 1 0 0 0 0 1.986l.117 .007h2v2l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-2h2l.117 -.007a1 1 0 0 0 0 -1.986l-.117 -.007h-2v-2l-.007 -.117a1 1 0 0 0 -.993 -.883z"
                                                        strokeWidth="0"
                                                        fill="currentColor"
                                                    />
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs w-24 mt-0.5 text-gray-500 text-center">{file.name}</p>
                                </>
                            )}
                        </div>

                        <div className="relative flex items-center justify-between my-2 h-8">
                            <div>
                                <CheckBox
                                    disabled={inputDisabled}
                                    id="useScheduled"
                                    size="sm"
                                    checked={useScheduled}
                                    onChange={(e) => handleChangeScheduleCheckBox()}
                                />
                                <label htmlFor="useScheduled" className="ml-2 font-medium text-sm">
                                    Schedule For Later
                                </label>
                            </div>

                            {useScheduled && (
                                <div className="flex items-center">
                                    <Button
                                        className="font-semibold"
                                        variant="outlined"
                                        color="gray"
                                        size="sm"
                                        onClick={handleToggleScheduleModel}
                                        disabled={inputDisabled}
                                    >
                                        <span>
                                            {formatDate(
                                                formatScheduleTime(scheduledDateValue, scheduledTimeValue),
                                                "dd-mm-yyyy hh:mm:AMPM"
                                            )}
                                        </span>
                                        <LuCalendarClock className="text-gray-600 text-base" />
                                    </Button>
                                </div>
                            )}

                            {scheduleModel && (
                                <div className="absolute left bottom-8 bg-white p-2 rounded-md shadow-md border border-gray-300 z-10">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-medium">Select Date:</p>
                                            <Button
                                                variant="contained"
                                                color="gray"
                                                size="sm"
                                                onClick={handleToggleScheduleModel}
                                            >
                                                <MdClose />
                                            </Button>
                                        </div>
                                        <Calendar
                                            value={scheduledDateValue}
                                            onChange={setScheduledDateValue}
                                            minDate={new Date()}
                                            className="self-center"
                                        />
                                        <div className="flex items-center justify-center gap-2">
                                            <p className="font-medium">Select Time:</p>

                                            <TimePicker
                                                value={scheduledTimeValue}
                                                onChange={setScheduledTimeValue}
                                                clearIcon={null}
                                                disableClock={true}
                                                className="self-center"
                                                format="hh:mm a"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center mt-1">
                            {!isSuccess && (
                                <button
                                    disabled={buttonDisabled || isSending}
                                    onClick={() => handleSendMessage()}
                                    className={`bg-blue-500 flex items-center justify-center text-white w-1/3 px-6  py-2 rounded-md hover:bg-blue-600 focus:outline-none ${
                                        buttonDisabled || isSending ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                >
                                    {isSending && (
                                        <svg
                                            version="1.1"
                                            id="L9"
                                            xmlns="http://www.w3.org/2000/svg"
                                            xmlnsXlink="http://www.w3.org/1999/xlink"
                                            x="0px"
                                            y="0px"
                                            viewBox="0 0 100 100"
                                            enableBackground="new 0 0 0 0"
                                            width={20}
                                            height={20}
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50"
                                            >
                                                <animateTransform
                                                    attributeName="transform"
                                                    attributeType="XML"
                                                    type="rotate"
                                                    dur="1s"
                                                    from="0 50 50"
                                                    to="360 50 50"
                                                    repeatCount="indefinite"
                                                ></animateTransform>
                                            </path>
                                        </svg>
                                    )}
                                    Send
                                </button>
                            )}
                            {seleniumStatus === null && !isSuccess && !customError && (
                                <div className="flex items-center justify-center text-sm text-center font-medium text-amber-500 px-4">
                                    Checking login status. Please wait...
                                    <svg
                                        version="1.1"
                                        id="L9"
                                        xmlns="http://www.w3.org/2000/svg"
                                        xmlnsXlink="http://www.w3.org/1999/xlink"
                                        x="0px"
                                        y="0px"
                                        viewBox="0 0 100 100"
                                        enableBackground="new 0 0 0 0"
                                        width={32}
                                        height={32}
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50"
                                        >
                                            <animateTransform
                                                attributeName="transform"
                                                attributeType="XML"
                                                type="rotate"
                                                dur="1s"
                                                from="0 50 50"
                                                to="360 50 50"
                                                repeatCount="indefinite"
                                            ></animateTransform>
                                        </path>
                                    </svg>
                                </div>
                            )}
                            {seleniumStatus === true && !isSuccess && !customError && (
                                <div className="text-sm text-center font-medium text-green-500 px-3">
                                    Last login found at {lastLoginTime}. <br /> You can send messages directly!
                                </div>
                            )}
                            {seleniumStatus === false && !isSuccess && !customError && (
                                <div className="text-sm text-center font-medium text-red-500 px-3">
                                    Marketing WhatsApp is not signed in!
                                    <br />
                                    Please sign-in from the Marketing WhatsApp Button to send messages.
                                </div>
                            )}
                        </div>

                        {customError && !isSuccess && (
                            <div className="flex flex-col justify-center items-center">
                                <p className="text-red-500 text-center font-medium">{customError}</p>
                                <p className="flex items-center gap-0.5 text-sm text-red-500 text-center font-medium">
                                    Getting too many errors? Raise a Support Ticket (
                                    <BiSupport size={20} className="inline-block" />)
                                </p>
                            </div>
                        )}

                        {!customError && isSuccess && (
                            <div className="flex flex-col justify-center items-center gap-2">
                                <p className="text-center font-medium">
                                    {!useScheduled && (
                                        <span className="text-green-500 text-sm">
                                            Sit back and relax! <br />
                                            Your messages will start sending within 10 minutes!
                                            <br />
                                            For the sake of your WhatsApp account reputation, the messages will be sent
                                            in batches of 25 each.
                                        </span>
                                    )}
                                    {useScheduled && (
                                        <span className="text-green-500 text-sm">
                                            Sit back and relax! <br />
                                            Your messages will start sending within 10 minutes of your scheduled time (
                                            {formatDate(
                                                formatScheduleTime(scheduledDateValue, scheduledTimeValue),
                                                "dd-mm-yyyy hh:mm:AMPM"
                                            )}
                                            )
                                            <br />
                                            For the sake of your WhatsApp account reputation, the messages will be sent
                                            in batches of 25 each.
                                        </span>
                                    )}
                                </p>

                                <button
                                    onClick={(e) => handleClickToggleModel(e)}
                                    className={
                                        "bg-red-400 flex items-center justify-center text-white w-1/3 px-6 py-2 rounded-md hover:bg-red-500 focus:outline-none"
                                    }
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        {showContactModel && (
                            <ContactModel
                                user_uid={user_uid}
                                handleContactChange={handleContactChange}
                                show={setShowContactModel}
                                isDisabled={inputDisabled}
                            />
                        )}
                        {showTemplateModel && (
                            <TemplateModel
                                user_uid={user_uid}
                                handleTemplateChange={handleTemplateChange}
                                message={message}
                                show={setShowTemplateModel}
                                isDisabled={inputDisabled}
                            />
                        )}
                        {/*showFilesModel && "Files Model Here"*/}
                    </div>
                </div>
            </div>
            {!isFilePdf && (
                <ImageModal base64={`data:${file?.type};base64,${image}`} show={showModal} setShow={setShowModal} />
            )}
        </div>
    );
};

export default SendMessageComponent;
