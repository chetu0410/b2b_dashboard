import { useEffect, useMemo, useState } from "react";
import { MdClose } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import gmail from "../../assets/images/gmail.ico";
import CheckBox from "../CheckBox/CheckBox";

import { LuCalendarClock } from "react-icons/lu";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import TimePicker from "react-time-picker";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

import "../../assets/css/sendmessage.css";
import EmailComposer from "./EmailComposer";
import ImageModal from "../SendMessage/ImageModal";
import Button from "../Button/Button";
import formatDate from "../../utils/formatDate";

const SendMessageComponent = ({ user_uid, email, leadData = [], selectedLeads = [], integrationFlag, onClose }) => {
    const [selectedType, setSelectedType] = useState("selected");
    const [customError, setCustomError] = useState(null);

    const [senderEmail, setSenderEmail] = useState(email);
    const [receiverEmail, setReceiverEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const [scheduledDateValue, setScheduledDateValue] = useState(new Date());
    const [scheduledTimeValue, setScheduledTimeValue] = useState(new Date());
    const [minTime, setMinTime] = useState(new Date());
    const [useScheduled, setUseScheduled] = useState(false);
    const [scheduleModel, setScheduleModel] = useState(false);

    const [authUrl, setAuthUrl] = useState("");
    const [isAuthHappened, setIsAuthHappened] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const [isSending, setIsSending] = useState(false);
    const [disableSendButton, setDisableSendButton] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [emailError, setEmailError] = useState(null);

    const [image, setImage] = useState(null);
    const [file, setFile] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [showInfoModel, setShowInfoModel] = useState(false);

    const handleSenderEmailChange = (e) => {
        setSenderEmail(e.target.value);
    };

    const handleClickToggleModel = (e) => {
        if (!onClose) return;
        onClose(e);
    };

    const handleReceiverEmailChange = (e) => {
        setReceiverEmail(e.target.value);
    };

    const handleSubjectChange = (e) => {
        setSubject(e.target.value);
    };

    const handleMessageChange = (message) => {
        setMessage("<html><body>" + message + "</body></html>");
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

    function extractEmailAddresses() {
        const emails = [];

        if (integrationFlag === 0) {
            // Iterate through each selected lead
            selectedLeads.forEach((id) => {
                // Find the lead object that matches the current id
                const lead = leadData.find((data) => data.id === id);

                // If a matching lead is found, extract the mobile numbers
                if (lead && lead.email_address) {
                    const email = lead.email_address
                        .trim()
                        .split(",")
                        .map((x) => x.trim())
                        .filter((x) => x);

                    // Push the id and mobile numbers as an array into the result array
                    emails.push(...email);
                }
            });
        } else if (integrationFlag === 1 || integrationFlag === 2) {
            // Iterate through each selected lead
            selectedLeads.forEach((mongodb_record_id) => {
                // Find the lead object that matches the current id
                const lead = leadData.find((data) => data.mongodb_record_id === mongodb_record_id);

                // If a matching lead is found, extract the mobile numbers
                if (lead && lead.email) {
                    const email = lead.email
                        .trim()
                        .split(",")
                        .map((x) => x.trim())
                        .filter((x) => x);

                    // Push the id and mobile numbers as an array into the result array
                    emails.push(...email);
                }
            });
        }

        return emails;
    }

    const scheduleEmails = async (file, receiver_emails) => {
        const url = "https://integrations.yogleads.in/email/process_email";
        const fileUrl = "https://tools.procbee.in/upload";

        const formData = new FormData();
        let fileLink;

        if (file) {
            formData.append("file", file);
            formData.append("user_uid", user_uid);
            const response = await fetch(fileUrl, {
                method: "POST",
                body: formData,
            });

            if (response.status !== 200) {
                throw new Error("Network response was not ok");
            } else {
                const fileResponse = await response.json();
                fileLink = fileResponse.data.downloadLink;
            }
        } else {
            fileLink = null;
        }

        const scheduleData = {
            sender_email: senderEmail,
            b2b_user_uid: user_uid,
            recipient_emails: receiver_emails,
            subject: subject,
            message: message,
            attachment_url: fileLink,
            scheduled_time: useScheduled
                ? formatDate(formatScheduleTime(scheduledDateValue, scheduledTimeValue), "yyyy-mm-dd hh:mm:ss")
                : formatDate(new Date(), "yyyy-mm-dd hh:mm:ss"),
        };

        return fetch(url, {
            accept: "application/json",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(scheduleData),
        });
    };

    const handleSendEmail = async (type) => {
        setIsSuccess(false);
        setCustomError(null);

        let emails;
        if (selectedType === "manual") {
            emails = receiverEmail
                .split(",")
                .map((item) => item.trim())
                .filter((x) => x);
        } else if (selectedType === "selected") {
            emails = extractEmailAddresses();
            if (!emails || emails.length === 0) {
                setEmailError("No emails found in selected leads.");
                setIsSending(false);
                setIsSuccess(false);
                return;
            }
        }

        if (!type) {
            setIsSending(true);
            scheduleEmails(file, emails)
                .then((result) => {
                    if (result.status !== 200) {
                        throw new Error("Network response was not ok");
                    }

                    const data = result.json();
                    return data;
                })
                .then((data) => {
                    if (data.message === "Email sending process started") {
                        setDisableSendButton(true);
                        setIsSending(false);
                        setIsSuccess(true);
                    } else if (data.message.includes("Sender not authenticated")) {
                        setAuthUrl(
                            `https://integrations.yogleads.in/email/authorize?sender_email=${senderEmail}&b2b_user_uid=${user_uid}`
                        );
                        setIsAuthHappened(false);
                        setIsAuthenticating(true);
                        setIsSending(false);
                    }
                })
                .catch((err) => {
                    setCustomError("Error in Scheduling Email. Please try again.");
                    setIsSending(false);
                    setIsSuccess(false);
                    return;
                });
        }
    };

    const handleAuthButton = async () => {
        const windowFeatures = "width=600,height=800,left=50%,top=50%,resizable=yes,scrollbars=yes";
        const popup = window.open(authUrl, "gmailPopup", windowFeatures);
        if (popup) {
            const checkClosed = setInterval(() => {
                if (popup.closed || typeof popup.closed === "undefined") {
                    setIsAuthenticating(false);
                    setIsAuthHappened(true);
                    clearInterval(checkClosed);
                }
            }, 1000); // You can adjust the interval as needed
        }
    };

    const buttonDisabled = useMemo(() => {
        return (
            !senderEmail || (!receiverEmail && selectedType === "manual") || !message || isAuthenticating || isSuccess
        );
    }, [senderEmail, receiverEmail, message, isAuthenticating, isSuccess]);

    const inputDisabled = useMemo(() => {
        return isAuthenticating;
    }, [isAuthenticating]);

    const [selectedCount, setSelectedCount] = useState(0);

    useEffect(() => {
        const getSelectedCount = async () => {
            const emails = extractEmailAddresses();
            setSelectedCount(emails.length);
        };
        getSelectedCount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setFile(file);
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
            const base64 = arrayBufferToBase64(reader.result);
            setImage(base64);
        };
        reader.onerror = (error) => {};
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
            <div className="p-8 max-w-3xl w-full mx-auto mt-4 mb-4 bg-white rounded-lg shadow-lg hero">
                <div className="title flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold flex gap-2 items-center justify-left">
                        <svg
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            width="32px"
                            height="20px"
                            viewBox="0 0 32 20"
                        >
                            <path
                                d="M1.5,1.6c0.8,0.5,12.6,7,13,7.2c0.4,0.2,0.9,0.3,1.6,0.3s1.1-0.1,1.6-0.3s12.2-6.7,13-7.2
								c0.3-0.2,0.8-0.5,1-0.8c0.2-0.6,0-0.8-0.9-0.8H16.1H1.4C0.5,0,0.3,0.2,0.5,0.8C0.6,1.2,1.1,1.5,1.5,1.6z M31.4,2
								c-0.6,0.3-6.3,4.4-10,6.9l6.3,7.2c0.2,0.2,0.2,0.3,0.1,0.4c-0.1,0.1-0.3,0-0.5-0.1l-7.6-6.5c-1.1,0.7-2,1.3-2.1,1.3
								c-0.6,0.3-1,0.3-1.6,0.3c-0.6,0-1,0-1.6-0.3c-0.1-0.1-0.9-0.6-2.1-1.3l-7.6,6.5c-0.2,0.2-0.4,0.2-0.5,0.1c-0.1-0.1,0-0.3,0.1-0.4
								l6.3-7.2C7.1,6.4,1.3,2.3,0.7,2C0,1.6,0,2,0,2.4c0,0.3,0,16,0,16C0,19.1,1.1,20,1.8,20h14.3h14.3c0.8,0,1.7-0.9,1.7-1.6
								c0,0,0-15.7,0-16C32,2,32,1.6,31.4,2z"
                                fill="#EAB31B"
                            />
                        </svg>
                        Send Email
                    </h2>
                    <span
                        className="h-8 w-8 f-center bg-gray rounded-full cursor-pointer"
                        onClick={(e) => handleClickToggleModel(e)}
                    >
                        <MdClose className="text-lg" />
                    </span>
                </div>
                <div className={`grid grid-cols-1`}>
                    <div className="">
                        <div className="mb-4">
                            <label htmlFor="senderEmail" className="block font-bold mb-1 text-sm">
                                Enter Sender's Email:
                            </label>
                            <input
                                disabled={inputDisabled}
                                type="text"
                                id="senderEmail"
                                value={senderEmail}
                                onChange={handleSenderEmailChange}
                                className="w-full text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                            />
                        </div>
                        <div className="mb-2 flex gap-4 items-center ">
                            <div className="flex items-center justify-center gap-2">
                                <input
                                    type="radio"
                                    name="type"
                                    value="manual"
                                    id="manual"
                                    onChange={(e) => {
                                        setEmailError(null);
                                        setSelectedType(e.target.value);
                                    }}
                                    checked={selectedType === "manual"}
                                    disabled={inputDisabled}
                                />
                                <label htmlFor="manual" className="block font-bold text-sm">
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
                                        setEmailError(null);
                                        setReceiverEmail("");
                                    }}
                                    disabled={inputDisabled}
                                />
                                <label htmlFor="selected" className="block font-bold text-sm">
                                    Selected {""}
                                    <span className="font-normal text-red-500">({selectedCount} emails)</span>
                                </label>
                            </div>
                        </div>
                        {selectedType === "manual" && (
                            <>
                                <div className="mb-2">
                                    <label htmlFor="receiverEmail" className="block font-bold mb-1 text-sm">
                                        Enter Receiver's Email:
                                    </label>
                                    <input
                                        disabled={inputDisabled || selectedType === "selected"}
                                        type="text"
                                        id="receiverEmail"
                                        value={receiverEmail}
                                        placeholder="workingemail1905@gmail.com"
                                        onChange={handleReceiverEmailChange}
                                        className="w-full text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                                    />
                                </div>
                            </>
                        )}
                        <div className="flex items-center mb-2">
                            <p className="text-red-500 text-center text-xs">{emailError}</p>
                        </div>
                        <div className="mb-2">
                            <label htmlFor="subject" className="block font-bold mb-1 text-sm">
                                Subject:
                            </label>
                            <input
                                disabled={inputDisabled}
                                type="text"
                                id="subject"
                                value={subject}
                                onChange={handleSubjectChange}
                                className="w-full text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                            />
                        </div>
                        <div className="mb-2">
                            <label htmlFor="message" className="block font-bold mb-1 text-sm">
                                Compose Mail:
                            </label>
                            <EmailComposer id="message" onMessageChange={handleMessageChange} />
                        </div>
                        <p
                            className="text-xs text-gray-500 mb-2
                  "
                        >
                            Supports Rich Text formatting.
                        </p>
                        {/* Display the message value received from EmailComposer 
                        <p>Message from EmailComposer: {message}</p>*/}
                        <div className="mb-4">
                            <label htmlFor="file" className="block font-bold mb-1 text-sm">
                                Attachment:
                            </label>
                            {!image && (
                                <>
                                    <input
                                        disabled={inputDisabled}
                                        type="file"
                                        id="file"
                                        accept="image/*,application/pdf"
                                        onChange={handleImageChange}
                                        className="w-full text-sm px-4 py-2 border border-neutral-300 rounded-md resize-none focus:outline-none focus:border-blue-400"
                                        rows="4"
                                    ></input>
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

                        <div className="relative flex items-center gap-12 my-2 h-8">
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

                        <div className="flex items-center gap-4">
                            <button
                                disabled={buttonDisabled || isSending || disableSendButton}
                                onClick={() => handleSendEmail()}
                                className={`bg-blue-500 flex items-center justify-evenly text-sm font-semibold text-white w-[200px] px-2 py-2 rounded-md hover:bg-blue-600 focus:outline-none
            ${buttonDisabled || isSending || disableSendButton ? "opacity-50 cursor-not-allowed" : ""}
          `}
                            >
                                <div className="bg-white p-0.5 rounded-md">
                                    <img src={gmail} alt="gmail" width="24px" />
                                </div>
                                Schedule with Gmail
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
                            </button>

                            {!isAuthHappened && isAuthenticating && (
                                <div className="relative mt-2 flex items-center flex-col">
                                    <p className="text-red-500 mb-2 text-sm">
                                        Please authenticate 'Yogleads Email Sender' with your Gmail account to schedule
                                        emails.
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="contained"
                                            color="blue"
                                            size="sm"
                                            onClick={handleAuthButton}
                                            className="!gap-1"
                                        >
                                            <div className="bg-white p-0.5 rounded-full">
                                                <FcGoogle />
                                            </div>
                                            <span>Sign-in with Google</span>
                                        </Button>
                                        <span
                                            className="w-5 h-5 border bg-gray-400 rounded-full text-sm text-bold text-white text-center cursor-pointer"
                                            onClick={() => setShowInfoModel((prev) => !prev)}
                                        >
                                            i
                                        </span>
                                    </div>
                                    {showInfoModel && (
                                        <div className="absolute text-sm bottom-9 right-0 w-[450px] bg-white p-2 rounded-md shadow-md border border-gray-300 z-10">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-bold">Limited Use and Data Policy</span>

                                                <Button
                                                    variant="contained"
                                                    color="gray"
                                                    size="sm"
                                                    onClick={() => setShowInfoModel((prev) => !prev)}
                                                >
                                                    X
                                                </Button>
                                            </div>
                                            <p className="whitespace-normal font-normal">
                                                Yogleads complies with the Google API Services User Data Policy,
                                                including the Limited Use requirements. <br />
                                                <span className="font-medium">
                                                    We DO NOT share your data with any third-party tools, such as AI
                                                    models or information resellers.
                                                </span>
                                                <br />
                                                <br />
                                                For more information, read our full policy here:{" "}
                                                <a
                                                    className="text-blue-500 hover:underline"
                                                    href={"https://dashboard.yogleads.in/privacy-policy#thirdparty"}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Yogleads Privacy and Data Policy
                                                </a>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {/*isAuthHappened && !isAuthenticating && (
                                <div className="mt-2 flex items-center flex-col">
                                    <p className="text-green-500 mb-2 text-sm">Gmail authentication successful!</p>
                                </div>
							)*/}
                        </div>
                    </div>

                    {customError && !isSuccess && (
                        <div className="flex flex-col justify-center items-center">
                            <p className="text-red-500 text-center font-medium">{customError}</p>
                        </div>
                    )}

                    {!customError && isSuccess && (
                        <div className="flex flex-col justify-center items-center gap-2">
                            <p className="text-center font-medium">
                                {!useScheduled && (
                                    <span className="text-green-500 text-sm">
                                        Sit back and relax! <br />
                                        Your emails are scheduled to be sent within 15 minutes!
                                    </span>
                                )}
                                {useScheduled && (
                                    <span className="text-green-500 text-sm">
                                        Sit back and relax! <br />
                                        Your emails will start sending within 15 minutes of your scheduled time (
                                        {formatDate(
                                            formatScheduleTime(scheduledDateValue, scheduledTimeValue),
                                            "dd-mm-yyyy hh:mm:AMPM"
                                        )}
                                        )
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
            </div>

            {!isFilePdf && (
                <ImageModal base64={`data:${file?.type};base64,${image}`} show={showModal} setShow={setShowModal} />
            )}
        </div>
    );
};

export default SendMessageComponent;
