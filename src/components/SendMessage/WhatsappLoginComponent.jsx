import { useEffect, useMemo, useState } from "react";
import { MdClose } from "react-icons/md";

import "../../assets/css/sendmessage.css";
import qrplaceholder from "../../assets/images/qrcode.png";
import WhatsAppIcon from "../Icons/WhatsAppIcon";
import cookieHelper from "../../utils/cookieHelper";
import Select from "react-select";

const TIMEOUT_SEC = 30;
const API_DELAY = 4000;

const locationOptions = [
    { value: 1, label: "Delhi" },
    { value: 2, label: "Mumbai" },
    { value: 3, label: "Hyderabad" },
];

let interval = null;
let filename = null;

const WhatsappLoginComponent = ({ onClose }) => {
    const { v4: uuidv4 } = require("uuid");

    const QRPLACEHOLDER = new URL(qrplaceholder, import.meta.url).href;
    const [customError, setCustomError] = useState(null);
    const [qrCode, setQrCode] = useState(null); // This will be a base64 encoded image [string
    const [isTimeoutHappened, setIsTimeoutHappened] = useState(false);
    const [isLoginHappened, setIsLoginHappened] = useState(null);

    const [tryCount, setTryCount] = useState(0);

    const [isLoading, setIsLoading] = useState(false);

    const [countdown, setCountdown] = useState(TIMEOUT_SEC);
    const [isSending, setIsSending] = useState(false);

    const [seleniumLocation, setSeleniumLocation] = useState(
        localStorage.getItem("selenium-location") ? JSON.parse(localStorage.getItem("selenium-location")) : null
    );

    const [isSuccess, setIsSuccess] = useState(false);
    const [generateQrCodeText, setGenerateQrCodeText] = useState("Regenerate QR Code");

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

    const handleSelectLocation = (option) => {
        setSeleniumLocation(option);
    };

    const login = async (body) => {
        const url = "https://wa-mktg.trending-trends.com/wa_login";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (response.status !== 200 && response.status !== 403) {
            console.error(response);
            throw new Error("Login failed. Please try again later.");
        }

        const data = await response.json();
        return data.message;
    };

    const generateQrCodeToAPI = async (body) => {
        const url = "https://wa-mktg.trending-trends.com/show-image";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (response.status !== 200) {
            console.error(response);
            throw new Error("Error occured in generating QR code.");
        }

        const data = await response.json();
        const base64Image = data.image_base64;

        return base64Image;
    };

    const handleGenerateQRCode = async (trial = 0, type, filename) => {
        //if (isTimeoutHappened && isLoginHappened === false) return;
        await generateQrCodeToAPI({ user_uid: parent.parent_user_uid, file_name: filename })
            .then((data) => {
                if (data) {
                    const dataURL = `data:image/png;base64,${data}`;
                    setQrCode(dataURL);
                    setIsLoading(false);
                    startCountdown();
                }
            })
            .catch(async (error) => {
                trial++;

                if (trial >= 2) {
                    setIsLoading(false);
                    setCustomError("Error in Generating QR Code. Please try again.");
                    setQrCode(null);
                    setIsSending(false);
                    stopCountdown();
                    setTryCount(0);
                    return;
                }

                await new Promise((resolve) => setTimeout(resolve, 2000));
                await handleGenerateQRCode(trial, type, filename);
                return error;
            })
            .finally(() => {
                setGenerateQrCodeText("Regenerate QR Code");
                setIsLoading(false);
            });
    };

    const handleSignInButton = async (type) => {
        setIsSuccess(false);
        setIsSending(true);
        setIsTimeoutHappened(false);
        setCustomError(null);
        setGenerateQrCodeText("Regenerate QR Code");
        setQrCode(null);

        if (type === "generateQrCodeAgain") {
            setGenerateQrCodeText("Regenerating QR Code...");
            setIsLoading(true);
            stopCountdown();
        } else {
            setCountdown(TIMEOUT_SEC);
        }

        if (!type) {
            filename = uuidv4();
            if (Boolean(cookieHelper.getCookie("next-login"))) {
                const currentTime = new Date();
                const expireTime = new Date(cookieHelper.getCookie("next-login"));
                const timeGap = Math.ceil((expireTime - currentTime) / (1000 * 60));
                setIsLoading(false);
                setGenerateQrCodeText("Retry");
                setCustomError(
                    `We detected a recent sign-in attempt...\nPlease retry sign-in after ${timeGap} minute(s).`
                );
                setIsSending(false);
                stopCountdown();
                setTryCount(0);
                setIsSuccess(false);
                setQrCode(null);
                return;
            } else {
                const currentTime = new Date();
                const expireTime = new Date(currentTime.getTime() + 3 * 60000);
                cookieHelper.setCookieMinutes("next-login", expireTime.toUTCString(), 3);
                setIsLoginHappened(null);
            }

            login({
                user_uid: parent.parent_user_uid,
                file_name: filename,
                location_flag: seleniumLocation ? seleniumLocation.value : 0,
            })
                .then((message) => {
                    if (message.includes("login success")) {
                        setIsLoginHappened(true);
                        localStorage.setItem("selenium-location", JSON.stringify(seleniumLocation));
                        setIsSuccess(true);
                        setIsLoading(false);
                        setTryCount(0);
                        setCustomError(null);
                        setIsSending(false);
                        setCountdown(TIMEOUT_SEC);
                        stopCountdown();
                        setQrCode(null);
                        setTimeout(() => {
                            window.location.reload();
                        }, 3500);
                        return;
                    } else {
                        setIsLoginHappened(false);
                        setIsLoading(false);
                        setGenerateQrCodeText("Retry");
                        setCustomError(null);
                        setIsSending(false);
                        stopCountdown();
                        setTryCount(0);
                        setIsSuccess(false);
                        setQrCode(null);
                        return;
                    }
                })
                .catch((err) => {
                    setIsLoading(false);
                    setGenerateQrCodeText("Retry");
                    setCustomError(err.message);
                    setIsSending(false);
                    stopCountdown();
                    setTryCount(0);
                    setIsSuccess(false);
                    setQrCode(null);
                    return;
                });
            //wait 4 seconds
            setIsLoading(true);
            await new Promise((resolve) => setTimeout(resolve, API_DELAY));
        }
        handleGenerateQRCode(0, type, filename);
    };

    const buttonDisabled = useMemo(() => {
        return qrCode || isSuccess || seleniumLocation === null || isTimeoutHappened;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qrCode, isSuccess, seleniumLocation, isTimeoutHappened]);

    const inputDisabled = useMemo(() => {
        return qrCode || isLoading;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qrCode, isLoading]);

    const startCountdown = () => {
        stopCountdown();
        setCountdown(TIMEOUT_SEC);
        clearInterval(interval);
        let i = setInterval(() => {
            setCountdown((countdown) => countdown - 1);
        }, 1000);
        interval = i;
    };
    const stopCountdown = () => {
        clearInterval(interval);
        interval = null;
    };

    useEffect(() => {
        if (countdown === 0) {
            stopCountdown();
            if (tryCount === 0) {
                setTryCount(1);
                setCountdown(TIMEOUT_SEC);
                setIsLoading(true);
                setQrCode(null);
                handleGenerateQRCode(0, "retry", filename);
            } else {
                setIsTimeoutHappened(true);
                setIsLoading(false);
                setGenerateQrCodeText("Retry");
                setCustomError(null);
                setIsSending(false);
                stopCountdown();
                setTryCount(0);
                setIsSuccess(false);
                setQrCode(null);
            }
        }
    }, [countdown]);

    return (
        <div className="scrollable-container">
            <div className="p-8 max-w-3xl w-full mx-auto mt-4 mb-4 bg-white rounded-lg shadow-lg hero">
                <div className="title flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold flex gap-2 items-center justify-left">
                        <WhatsAppIcon />
                        WhatsApp Marketing Sign-In
                    </h2>
                    <span
                        className="h-8 w-8 f-center bg-gray rounded-full cursor-pointer"
                        onClick={(e) => handleClickToggleModel(e)}
                    >
                        <MdClose className="text-lg" />
                    </span>
                </div>

                <div className={`grid grid-cols-2`}>
                    <div className="">
                        <div className="mb-2">
                            <label htmlFor="location" className="block font-bold mb-1 text-sm">
                                Select your Closest Location: <span className="text-red-500">*</span>
                            </label>
                            <Select
                                name="location"
                                value={seleniumLocation}
                                options={locationOptions}
                                onChange={handleSelectLocation}
                                placeholder={"Select..."}
                                styles={{
                                    // To make the select wider
                                    control: (provided) => ({
                                        ...provided,
                                        width: "full", // Adjust the width as needed
                                    }),
                                }}
                                isDisabled={inputDisabled}
                            />
                        </div>
                        <p
                            className="
            text-xs text-gray-500 font-medium pb-4"
                        >
                            Please select the city with least distance to your location. <br />
                        </p>

                        <div className="my-4">
                            <p className="text-xs font-bold text-gray-500">Learn how to scan QR code on WhatsApp: </p>
                            <ol className="text-xs text-gray-500">
                                <li className="list-decimal list-inside">Open WhatsApp on your phone.</li>
                                <li className="list-decimal list-inside">
                                    Tap your Profile Picture or Settings on the top-right corner.
                                </li>
                                <li className="list-decimal list-inside">
                                    Select "Linked Devices" and tap on "Link a Device".
                                </li>
                                <li className="list-decimal list-inside">
                                    Point your phone to this screen to scan the QR code.
                                </li>
                            </ol>
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                disabled={buttonDisabled || isSending}
                                onClick={() => handleSignInButton()}
                                className={`bg-blue-500 flex items-center justify-center text-white w-1/2 px-6 mt-1 py-2 rounded-md hover:bg-blue-600 focus:outline-none ${
                                    buttonDisabled || isSending ? "opacity-50 cursor-not-allowed" : ""
                                }
          `}
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
                                Sign-In
                            </button>
                        </div>
                    </div>

                    <div className={`${isTimeoutHappened && "flex flex-col items-center justify-center"}`}>
                        {!isSuccess && !customError && (
                            <p className="text-sm text-gray-500 font-medium text-center mb-4 mx-2">
                                Please use an older, reputed mobile number for sign-in to reduce risk of ban by
                                WhatsApp.
                            </p>
                        )}

                        {!isLoading && !qrCode && (
                            <img className="blur-[3px] ml-auto mr-auto" src={QRPLACEHOLDER} alt="QR Code" />
                        )}
                        {isLoading && (
                            <div className="flex justify-center items-center">
                                <svg
                                    version="1.1"
                                    id="L9"
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlnsXlink="http://www.w3.org/1999/xlink"
                                    x="0px"
                                    y="0px"
                                    viewBox="0 0 100 100"
                                    enableBackground="new 0 0 0 0"
                                    width={200}
                                    height={200}
                                >
                                    <path
                                        fill="#00a884"
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

                        {isTimeoutHappened && isLoginHappened === null && !isSuccess && (
                            <div className="flex items-center justify-center text-sm text-center font-medium text-amber-500 mx-1 mb-2">
                                Checking login success. Please wait...
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

                        {isTimeoutHappened && isLoginHappened === false && !isSuccess && (
                            <div className="flex flex-col justify-center items-center mx-1">
                                <p className="text-red-500 text-center">
                                    QR Code was not scanned in time!
                                    <br />
                                    Please try again.
                                </p>
                            </div>
                        )}

                        {qrCode && (
                            <div className="flex justify-center items-center flex-col">
                                <img src={qrCode} alt="QR Code" width={"276px"} height={"276px"} />
                                <p className="text-right">Expires in {countdown} seconds</p>
                            </div>
                        )}

                        {((!isLoading && qrCode) || (isTimeoutHappened && isLoginHappened === false)) && (
                            <div className="mt-2 flex items-center justify-center flex-col">
                                {!isTimeoutHappened && <p className="text-red-500 mb-2">Couldn't link device?</p>}
                                <button
                                    onClick={() =>
                                        !isTimeoutHappened
                                            ? handleSignInButton("generateQrCodeAgain")
                                            : handleSignInButton(null)
                                    }
                                    className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 focus:outline-none"
                                >
                                    {generateQrCodeText}
                                </button>
                            </div>
                        )}

                        {customError && !isSuccess && (
                            <div className="flex flex-col justify-center items-center mx-1">
                                <p className="text-red-500 text-center font-medium whitespace-pre-line">
                                    {customError}
                                </p>
                            </div>
                        )}

                        {isSuccess && (
                            <div className="flex justify-between items-center mb-4 mx-1">
                                <p className="text-center font-medium">
                                    <span className="text-green-500 text-sm">
                                        WhatsApp Sign-In Successful! <br />
                                        You can now easily schedule WhatsApp Marketing messages across the Dashboard.
                                        <br /> The page will now refresh...
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsappLoginComponent;
