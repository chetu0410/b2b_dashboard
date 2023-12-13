import { useMemo, useState } from "react";
import { MdClose } from "react-icons/md";
import IntegrationIcon from "../Icons/IntegrationIcon";
import "../../assets/css/sendmessage.css";
import cookieHelper from "../../utils/cookieHelper";
import { registerUserTradeIndia } from "../../apis";

const TradeIndiaIntegration = ({ onClose }) => {
    const [customError, setCustomError] = useState(null);
    const [userId, setUserId] = useState(cookieHelper.getCookie("ti-userid") || "");
    const [profileId, setProfileId] = useState(cookieHelper.getCookie("ti-profileid") || "");
    const [platformKey, setPlatformKey] = useState(cookieHelper.getCookie("ti-key") || "");

    const [isSending, setIsSending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

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

    const handlePlatformKeyChange = (e) => {
        setPlatformKey(e.target.value);
    };

    const handleUserIdChange = (e) => {
        setUserId(e.target.value);
    };

    const handleProfileIdChange = (e) => {
        setProfileId(e.target.value);
    };

    const handleRegisterButton = async () => {
        setIsSuccess(false);
        setIsSending(true);
        setCustomError(null);

        try {
            const body = {
                b2b_user_uid: parent.parent_user_uid,
                key: platformKey,
                profile_id: profileId,
                user_id: userId,
            };
            const { data: res } = await registerUserTradeIndia(body);

            if (res.status !== "success") {
                throw new Error(res.data);
            }
            cookieHelper.setCookie("ti-userid", userId, 15);
            cookieHelper.setCookie("ti-profileid", profileId, 15);
            cookieHelper.setCookie("ti-key", platformKey, 15);
            setIsSending(false);
            setIsSuccess(true);
        } catch (err) {
            setIsSending(false);
            setIsSuccess(false);
            setCustomError(err.message);
        }
    };

    const buttonDisabled = useMemo(() => {
        return !platformKey || !userId || !profileId || isSuccess;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [platformKey, userId, profileId, isSuccess]);

    const inputDisabled = useMemo(() => {
        return isSending || isSuccess;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSending, isSuccess]);

    return (
        <>
            <div className="p-8 max-w-3xl w-full mx-auto mt-4 bg-white rounded-lg shadow-lg hero">
                <div className="title flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold flex gap-2 items-center justify-left">
                        <IntegrationIcon fill={"#FEC619"} stroke={"#FEC619"} />
                        TradeIndia Integration
                    </h2>
                    <span
                        className="h-8 w-8 f-center bg-gray rounded-full cursor-pointer"
                        onClick={(e) => handleClickToggleModel(e)}
                    >
                        <MdClose className="text-lg" />
                    </span>
                </div>
                <div className={"flex flex-col gap-y-4"}>
                    <div className={"flex flex-col items-center"}>
                        <div className="mx-4">
                            <p className="block font-bold mb-1">
                                Learn how to get User ID, Profile ID and API Key from Trade India :{" "}
                            </p>
                            <ol className="text-m">
                                <li className="list-decimal list-inside">
                                    <a
                                        href="https://www.tradeindia.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 underline"
                                    >
                                        Click Here
                                    </a>
                                    &nbsp;to go to TradeIndia Key Generation Page.
                                </li>
                                <li className="list-decimal list-inside">
                                    You must be logged in with a TradeIndia Paid Seller Account.
                                </li>
                                <li className="list-decimal list-inside">
                                    Go to "Inquiries & Contacts" and click on "My Inquiry API".
                                </li>
                                <li className="list-decimal list-inside">
                                    Copy the relevant fields and paste in the corresponding fields below.
                                </li>
                                <li className="list-decimal list-inside">Click Register.</li>
                            </ol>
                        </div>
                    </div>
                    <div className="flex flex-col justify-between">
                        <div className="flex justify-center pb-2">
                            <label htmlFor="userId" className="basis-1/6 font-bold text-md flex items-center">
                                User ID:
                            </label>
                            <input
                                disabled={inputDisabled}
                                type="text"
                                id="userId"
                                value={userId}
                                onChange={handleUserIdChange}
                                className="basis-5/6 w-full max-w-[360px] text-md px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                            />
                        </div>
                        <div className="flex justify-center pb-2">
                            <label htmlFor="profileId" className="basis-1/6 font-bold text-md flex items-center">
                                Profile ID:
                            </label>
                            <input
                                disabled={inputDisabled}
                                type="text"
                                id="profileId"
                                value={profileId}
                                onChange={handleProfileIdChange}
                                className="basis-5/6 w-full max-w-[360px] text-md px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                            />
                        </div>
                        <div className="flex justify-center pb-2">
                            <label htmlFor="platformKey" className="basis-1/6 font-bold text-md flex items-center">
                                API Key:
                            </label>
                            <input
                                disabled={inputDisabled}
                                type="text"
                                id="platformKey"
                                value={platformKey}
                                onChange={handlePlatformKeyChange}
                                className="basis-5/6 w-full max-w-[360px] text-md px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                            />
                        </div>

                        <div className="flex justify-center mt-4">
                            <button
                                disabled={buttonDisabled || isSending}
                                onClick={() => handleRegisterButton()}
                                className={`bg-blue-500 flex items-center justify-center text-white w-1/3 px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none
            ${buttonDisabled || isSending ? "opacity-50 cursor-not-allowed" : ""}
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
                                Register
                            </button>
                        </div>
                        {customError && (
                            <div className="flex justify-center mt-4 pb-2">
                                <p className="text-red-500 text-center">{customError}</p>
                            </div>
                        )}
                        <div className="flex justify-center mt-4 pb-2">
                            {isSuccess && (
                                <div className="text-green-500 text-m text-center">
                                    Registration successful!
                                    <br /> It may take upto an hour for TradeIndia Data to show on your Dashboard.
                                    <br />
                                    Please refresh the "My Search History" page if you don't see the "TradeIndia Data"
                                    Tab.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TradeIndiaIntegration;
