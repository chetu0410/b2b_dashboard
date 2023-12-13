import { useEffect, useMemo, useState } from "react";
import { MdClose } from "react-icons/md";
import ToggleButton from "../ToggleButton/ToggleButton";
import "../../assets/css/sendmessage.css";
import qrplaceholder from "../../assets/images/qrcode.png";
import { FaRobot } from "react-icons/fa";
import cookieHelper from "../../utils/cookieHelper";
import Select from "react-select";

const TIMEOUT_SEC = 60;
const API_DELAY = 5000;

const locationOptions = [
    { value: 1, label: "Delhi" },
    { value: 2, label: "Mumbai" },
    { value: 3, label: "Hyderabad" },
];

let interval = null;
let filename;

const LeadbotLoginComponent = ({ integrations = [], onClose }) => {
    const QRPLACEHOLDER = new URL(qrplaceholder, import.meta.url).href;
    const [customError, setCustomError] = useState(null);

    const [companyName, setCompanyName] = useState(cookieHelper.getCookie("company-name"));
    const [selectedLocation, setSelectedLocation] = useState(null);

    const [indiamartFlag, setIndiamartFlag] = useState(false);
    const [facebookFlag, setFacebookFlag] = useState(false);
    const [tradeIndiaFlag, setTradeIndiaFlag] = useState(false);
    const [justdialFlag, setJustdialFlag] = useState(false);
    const [alibabaFlag, setAlibabaFlag] = useState(false);
    const [integrationFlags, setIntegrationFlags] = useState([]);

    const [qrCode, setQrCode] = useState(null); // This will be a base64 encoded image [string
    const [isTimeoutHappened, setIsTimeoutHappened] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [tryCount, setTryCount] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    // eslint-disable-next-line no-unused-vars

    const [countdown, setCountdown] = useState(TIMEOUT_SEC);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [isSuccess, setIsSuccess] = useState(false);
    const [generateQrCodeText, setGenerateQrCodeText] = useState("Generate QR Code Again");

    const parent = useMemo(() => {
        try {
            return localStorage.getItem("self") ? JSON.parse(localStorage.getItem("self")) : {};
        } catch (err) {
            return {};
        }
    }, []);

    const handleCompanyNameChange = (e) => {
        setCompanyName(e.target.value);
    };

    const handleSelectLocation = (option) => {
        setSelectedLocation(option);
    };

    const handleIndiamartToggleButton = (e) => {
        setIndiamartFlag(e.target.checked);
    };

    const handleFacebookToggleButton = (e) => {
        setFacebookFlag(e.target.checked);
    };

    const handleTradeIndiaToggleButton = (e) => {
        setTradeIndiaFlag(e.target.checked);
    };

    const handleJustdialToggleButton = (e) => {
        setJustdialFlag(e.target.checked);
    };

    const handleAlibabaToggleButton = (e) => {
        setAlibabaFlag(e.target.checked);
    };

    useEffect(() => {
        let integrations = [];
        if (indiamartFlag) integrations.push(1);
        if (facebookFlag) integrations.push(2);
        if (tradeIndiaFlag) integrations.push(3);
        if (justdialFlag) integrations.push(4);
        if (alibabaFlag) integrations.push(5);
        setIntegrationFlags(integrations);
    }, [indiamartFlag, facebookFlag, tradeIndiaFlag, justdialFlag, alibabaFlag]);

    const handleClickToggleModel = (e) => {
        if (!onClose) return;
        onClose(e);
    };

    const login = async (body) => {
        const url = "https://lb-central.trending-trends.com/lead_bot/login";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (response.status !== 200) {
            throw new Error("Error occured in trying to login. Please try again later.");
        }

        const data = await response.json();
        return data;
    };

    const generateQrCodeToAPI = async (type, filename) => {
        const url = "https://lb-central.trending-trends.com/lead_bot/get-qrcode";

        const qrData = {
            user_uid: parent.parent_user_uid,
            filename: filename,
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(qrData),
        });

        if (response.status !== 200) {
            throw new Error("Error occured in getting QR code.");
        }

        const data = await response.json();

        const base64Image = data.image;
        if (data.check_status_flag === 1) {
            setIsAuthenticating(true);
            startCountdown();
            checkStatus(filename)
                .then((res) => {
                    if (res.status !== 200) {
                        throw new Error("Error occured in checking status.");
                    }
                    const data = res.json();
                    return data;
                })
                .then((data) => {
                    const message = data.message;
                    if (message === "Timeout, QR code not scanned yet") {
                        throw new Error(message);
                    } else {
                        setIntegrationLBM()
                            .then((result) => {
                                if (result.status !== 200) {
                                    throw new Error("Error in registering with leadbot. Please try again.");
                                }
                                const data = result.json();
                                return data;
                            })
                            .then((data) => {
                                if (data.status !== "success") {
                                    throw new Error("Error in registering with leadbot. Please try again.");
                                } else {
                                    cookieHelper.setCookie("company-name", companyName, 30);
                                    setIsSuccess(true);
                                    setIsLoading(false);
                                    setCustomError(null);
                                    setTryCount(0);
                                    setIsAuthenticating(false);
                                    setCountdown(TIMEOUT_SEC);
                                    stopCountdown();
                                    setQrCode(null);
                                    setTimeout(() => {
                                        window.location.reload();
                                    }, 3000);
                                }
                            })
                            .catch((err) => {
                                setIsLoading(false);
                                setGenerateQrCodeText("Generate QR Code Again");
                                setCustomError(err.message);
                                stopCountdown();
                                setTryCount(0);
                                setIsAuthenticating(false);
                                setIsSuccess(false);
                                return;
                            });
                    }
                })
                .catch((err) => {
                    setGenerateQrCodeText("Generate QR Code Again");
                    setCustomError(err.message);
                    setTryCount(0);
                    setIsSuccess(false);
                    setQrCode(null);
                    stopCountdown();
                    setIsAuthenticating(false);
                    setIsLoading(false);
                });
        } else {
            setIsAuthenticated(true);
            setIntegrationLBM()
                .then((result) => {
                    if (result.status !== 200) {
                        throw new Error("Error occurred registering with leadbot. Please try again.");
                    }
                    const data = result.json();
                    return data;
                })
                .then((data) => {
                    if (data.status !== "success") {
                        throw new Error("Error occurred in registering with leadbot. Please try again.");
                    } else {
                        cookieHelper.setCookie("company-name", companyName, 30);
                        setIsSuccess(true);
                        setIsLoading(false);
                        setCustomError(null);
                        setTryCount(0);
                        setIsAuthenticating(false);
                        setCountdown(TIMEOUT_SEC);
                        stopCountdown();
                        setQrCode(null);
                        setTimeout(() => {
                            window.location.reload();
                        }, 3000);
                    }
                })
                .catch((err) => {
                    setIsLoading(false);
                    setGenerateQrCodeText("Generate QR Code Again");
                    setCustomError(err.message);
                    stopCountdown();
                    setTryCount(0);
                    setIsAuthenticating(false);
                    setIsSuccess(false);
                    return;
                });
        }

        return base64Image;
    };

    const handleGenerateQRCode = async (trial = 0, type, filename) => {
        await generateQrCodeToAPI(type, filename)
            .then((data) => {
                if (data) {
                    const dataURL = `data:image/png;base64,${data}`;
                    setQrCode(dataURL);
                }
            })
            .catch(async (error) => {
                trial++;

                if (trial >= 2) {
                    setIsLoading(false);
                    setCustomError("Error in Generating QR Code. Please try again.");
                    setIsAuthenticating(false);
                    stopCountdown();
                    setTryCount(0);
                    return;
                }

                await new Promise((resolve) => setTimeout(resolve, 2000));
                await handleGenerateQRCode(trial, type, filename);
                return error;
            })
            .finally(() => {
                setGenerateQrCodeText("Generate QR Code Again");
                setIsLoading(false);
            });
    };

    async function checkStatus(contentDisposition) {
        const url = "https://lb-central.trending-trends.com/lead_bot/check-status";
        await new Promise((resolve) => setTimeout(resolve, 2000));
        try {
            return fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ filename: contentDisposition }),
            });
        } catch (error) {
            console.error("Error checking status:", error.message);
            return null;
        }
    }

    async function setIntegrationLBM() {
        const url = "https://tools.procbee.in/integrations/setIntegrationLBM";

        const body = {
            b2b_user_uid: parent.parent_user_uid,
            company_name: companyName,
            integration_flag: integrationFlags,
        };

        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
    }

    const handleRegisterButton = async (type) => {
        setIsSuccess(false);
        setIsTimeoutHappened(false);
        setCustomError(null);
        setTryCount(0);
        setGenerateQrCodeText("Generate QR Code Again");
        setQrCode(null);

        if (type === "generateQrCodeAgain") {
            setGenerateQrCodeText("Generating QR Code...");
            setIsLoading(true);
        } else {
            setCountdown(TIMEOUT_SEC);
        }

        if (!type) {
            setIsLoading(true);
            try {
                const loginData = await login({
                    user_uid: parent.parent_user_uid,
                    ...(selectedLocation && { location_flag: selectedLocation.value }),
                });
                filename = loginData.filename;
            } catch (err) {
                setCustomError(err.message);
                setIsAuthenticating(false);
                setIsLoading(false);
                return;
            }
            //wait 5 seconds
            await new Promise((resolve) => setTimeout(resolve, API_DELAY));
        }
        handleGenerateQRCode(0, type, filename);
    };

    const buttonDisabled = useMemo(() => {
        return !companyName || integrationFlags.length === 0 || qrCode || isSuccess;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyName, integrationFlags, qrCode, isSuccess]);

    const inputDisabled = useMemo(() => {
        return qrCode || isLoading || isAuthenticating;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qrCode, isLoading, isAuthenticating]);

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
        }
    }, [countdown]);

    return (
        <div className="scrollable-container">
            <div className="p-8 max-w-3xl w-full mx-auto mt-4 mb-4 bg-white rounded-lg shadow-lg hero">
                <div className="title flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold flex gap-2 items-center justify-left">
                        <FaRobot style={{ color: "#09D261", fontSize: "2rem" }} />
                        WhatsApp AutoResponder
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
                        <div className="mb-4">
                            <label htmlFor="companyName" className="block font-bold mb-1 text-sm">
                                Enter your Company Name:
                            </label>
                            <input
                                disabled={inputDisabled}
                                type="text"
                                id="companyName"
                                value={companyName}
                                onChange={handleCompanyNameChange}
                                className="w-full text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                            />
                        </div>
                        <p
                            className="
            text-xs text-gray-500 pb-4"
                        >
                            This name will be used by the AutoResponder in the responses.
                        </p>

                        <div className="mb-4">
                            <label htmlFor="location" className="block font-bold mb-1 text-sm">
                                Select your Closest Location:
                            </label>
                            <Select
                                name="location"
                                value={selectedLocation}
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
                            />
                        </div>
                        <p
                            className="
            text-xs text-gray-500 pb-4"
                        >
                            Please select the city with least distance to your location.
                        </p>

                        <div className="flex flex-col mb-2">
                            {(integrations.length === 0 || !integrations.includes(1)) && (
                                <p className="text-red-500 mb-2 text-sm">
                                    You must be integrated with any of the platforms such as IndiaMART, to use this
                                    feature.
                                </p>
                            )}
                            {integrations.length !== 0 && integrations.includes(1) && (
                                <>
                                    <label htmlFor="integrationFlags" className="block font-bold mb-2 text-sm">
                                        Enable AutoResponder for:
                                    </label>
                                    <p
                                        className="
            text-xs text-gray-500 pb-4"
                                    >
                                        Please select atleast one.
                                    </p>
                                </>
                            )}
                            {integrations.includes(1) && (
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1">
                                        <p className="text-base text-gray-900 font-medium">{"IndiaMART"}</p>
                                    </div>
                                    <ToggleButton
                                        name={"indiamart"}
                                        checked={indiamartFlag}
                                        onChange={handleIndiamartToggleButton}
                                        disabled={inputDisabled}
                                    />
                                </div>
                            )}
                            {/*integrations.includes(2) && (
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1">
                                        <p className="text-base text-gray-900 font-medium">{"Facebook"}</p>
                                    </div>
                                    <ToggleButton
                                        name={"facebook"}
                                        checked={facebookFlag ? true : false}
                                        onChange={handleFacebookToggleButton}
                                        disabled={inputDisabled}
                                    />
                                </div>
							)}
                            {integrations.includes(3) && (
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1">
                                        <p className="text-base text-gray-900 font-medium">{"TradeIndia"}</p>
                                    </div>
                                    <ToggleButton
                                        name={"tradeindia"}
                                        checked={tradeIndiaFlag ? true : false}
                                        onChange={handleTradeIndiaToggleButton}
                                        disabled={inputDisabled}
                                    />
                                </div>
                            )}
                            {integrations.includes(4) && (
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1">
                                        <p className="text-base text-gray-900 font-medium">{"Justdial"}</p>
                                    </div>
                                    <ToggleButton
                                        name={"justdial"}
                                        checked={justdialFlag ? true : false}
                                        onChange={handleJustdialToggleButton}
                                        disabled={inputDisabled}
                                    />
                                </div>
                            )}
                            {integrations.includes(5) && (
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1">
                                        <p className="text-base text-gray-900 font-medium">{"Alibaba"}</p>
                                    </div>
                                    <ToggleButton
                                        name={"alibaba"}
                                        checked={alibabaFlag ? true : false}
                                        onChange={handleAlibabaToggleButton}
                                        disabled={inputDisabled}
                                    />
                                </div>
							)*/}
                        </div>
                        <div className="flex justify-between items-center">
                            <button
                                disabled={buttonDisabled || isAuthenticating}
                                onClick={(e) => handleRegisterButton()}
                                className={`bg-blue-500 flex items-center justify-center text-white w-1/3 px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none
            ${buttonDisabled || isAuthenticating ? "opacity-50 cursor-not-allowed" : ""}
          `}
                            >
                                {isAuthenticating && (
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
                                Register
                            </button>
                        </div>
                    </div>

                    <div className={`${isTimeoutHappened && "flex flex-col items-center justify-center"}`}>
                        <p className="text-sm text-gray-500 font-medium text-center mb-4">
                            Please use an older, reputed mobile number or account to reduce risk of ban by WhatsApp.
                        </p>
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
                        {isTimeoutHappened && (
                            <div className="flex justify-center items-center">
                                <p className="text-red-500 text-center">
                                    QR code not scanned in time.
                                    <br />
                                    Please try again.
                                </p>
                            </div>
                        )}
                        {customError && (
                            <div className="flex justify-center items-center">
                                <p className="text-red-500 text-center">{customError}</p>
                            </div>
                        )}
                        {qrCode && (
                            <div className="flex justify-center items-center flex-col">
                                <img src={qrCode} alt="QR Code" />
                                <p className="text-right">Expires in {countdown} seconds</p>
                            </div>
                        )}

                        {((!isLoading && qrCode) || isTimeoutHappened) && (
                            <div className="mt-2 flex items-center justify-center flex-col">
                                {!isTimeoutHappened && (
                                    <p className="text-red-500 mb-2">Didn't receive a proper QR Code?</p>
                                )}
                                <button
                                    onClick={() =>
                                        !isTimeoutHappened
                                            ? handleRegisterButton("generateQrCodeAgain")
                                            : handleRegisterButton()
                                    }
                                    className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 focus:outline-none"
                                >
                                    {generateQrCodeText}
                                </button>
                            </div>
                        )}
                        <div className="flex justify-between items-center mt-2 pl-4">
                            <p>
                                {!isAuthenticated && isSuccess && (
                                    <span className="text-green-500 text-sm">
                                        Sit back and relax! AutoResponder is successfully enabled!
                                        <br />
                                        The page will now refresh...
                                    </span>
                                )}
                                {isAuthenticated && isSuccess && (
                                    <span className="text-green-500 text-sm">
                                        Previous login found. No need to scan QR code!
                                        <br />
                                        AutoResponder is successfully enabled!
                                        <br />
                                        The page will now refresh...
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="mt-4 pl-4">
                            <p className="text-xs text-gray-500">Learn how to scan QR code on WhatsApp: </p>
                            <ol className="text-xs text-gray-500">
                                <li className="list-decimal list-inside">Open WhatsApp on your phone</li>
                                <li className="list-decimal list-inside">
                                    Tap Menu or Settings and select Linked Devices
                                </li>
                                <li className="list-decimal list-inside">Tap on Link a Device</li>
                                <li className="list-decimal list-inside">
                                    Point your phone to this screen to capture the QR code
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadbotLoginComponent;
