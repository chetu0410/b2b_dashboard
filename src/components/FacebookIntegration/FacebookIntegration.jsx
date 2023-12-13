import { useMemo, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

import { MdClose } from "react-icons/md";
import IntegrationIcon from "../Icons/IntegrationIcon";
import "../../assets/css/sendmessage.css";
import Select from "react-select";
import CheckBox from "../CheckBox/CheckBox";
import handleError from "../../utils/errorHandler";

const FacebookIntegration = ({ onClose }) => {
    const [customError, setCustomError] = useState(null);

    const [loginStatus, setLoginStatus] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const parent = useMemo(() => {
        try {
            return localStorage.getItem("self") ? JSON.parse(localStorage.getItem("self")) : {};
        } catch (err) {
            return {};
        }
    }, []);

    const [pageData, setPageData] = useState([]);
    const [formsData, setFormsData] = useState([]);

    const [selectedOption, setSelectedOption] = useState(null);
    const [selectedForms, setSelectedForms] = useState({});

    const handleClickToggleModel = (e) => {
        if (!onClose) return;
        onClose(e);
    };

    const handleSelectOption = async (option) => {
        setSelectedOption(option);
        setIsLoading(true);
        setCustomError(null);
        try {
            if (option.value === "") {
                setFormsData([]);
                setIsLoading(false);
                return;
            }
            const selectedPage = pageData.find((page) => page.id === option.value);

            const body = {
                page_id: selectedPage.id,
                page_access_token: selectedPage.access_token,
            };

            const response = await getForms(body);
            if (response === "No forms found for the selected page") throw Error(response);
            else {
                setFormsData(response);
                setIsLoading(false);
            }
        } catch (err) {
            setIsLoading(false);
            setCustomError(err.message);
        }
    };

    const handleChangeCheckBox = (e, form) => {
        let forms = { ...selectedForms };

        if (forms.hasOwnProperty(form.id)) {
            delete forms[form.id];
            return setSelectedForms({ ...forms });
        }

        forms[form.id] = form.name;

        setSelectedForms({ ...selectedForms, ...forms });
    };

    const handleToggleAllCheckboxes = (e) => {
        if (formsData.length === Object.keys(selectedForms).length) return setSelectedForms({});

        let forms = {};
        formsData.forEach((form) => {
            forms[form.id] = form.name;
        });
        setSelectedForms({ ...forms });
    };

    function getPageOptions() {
        const options = [];

        pageData.forEach((page) => {
            const pageObject = {
                value: page.id,
                label: page.name,
            };

            options.push(pageObject);
        });
        return options;
    }

    const getForms = async (body) => {
        const url = "https://integrations.yogleads.in/fb/get_forms";

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (response.status !== 200) {
            throw new Error("Error occured in fetching forms. Please try again.");
        }

        const data = await response.json();

        return data.data;
    };

    const integrationSuccess = async (body) => {
        const url = "https://integrations.yogleads.in/fb/integration_success";

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (response.status !== 200) {
            throw new Error("Error occured in finalising integration. Please try again.");
        }

        const data = await response.json();
        return data.data;
    };

    const handleRegisterButton = async () => {
        setIsSuccess(false);
        setIsAuthenticating(true);
        setCustomError(null);
        setIsLoading(false);
        setIsSending(false);
        setLoginStatus(false);

        const provider = new firebase.auth.FacebookAuthProvider();
        provider.addScope("public_profile");
        provider.addScope("pages_manage_ads");
        provider.addScope("leads_retrieval");
        provider.addScope("pages_show_list");
        provider.addScope("pages_read_engagement");

        try {
            const result = await firebase.auth().signInWithPopup(provider);
            console.log("Result:", result);

            const url = "https://integrations.yogleads.in/fb/get_page_details";

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_access_token: result.credential.accessToken,
                    user_id: result.additionalUserInfo.profile.id,
                }),
            });

            if (response.status !== 200) {
                throw new Error("Error occurred in fetching Facebook page data.");
            }

            const data = await response.json();

            if (data.pages_data.data.length === 0) {
                setPageData([]);
                setIsAuthenticating(false);
                setLoginStatus(false);
                throw Error("No page data found for your Facebook account.");
            }
            setPageData(data.pages_data.data);
            setIsAuthenticating(false);
            setLoginStatus(true);
        } catch (err) {
            handleError(err);
            console.log(err.message);
        }
    };

    const handleFinishButton = async () => {
        setIsSuccess(false);
        setCustomError(null);
        setIsSending(true);

        try {
            const selectedPage = pageData.find((page) => page.id === selectedOption.value);
            const body = {
                b2b_user_uid: parent.parent_user_uid,
                page_id: selectedPage.id,
                form_info: selectedForms,
                page_access_token: selectedPage.access_token,
            };
            const response = await integrationSuccess(body);
            if (response === "Integration Successful!") {
                setIsSending(false);
                setIsSuccess(true);
            }
        } catch (err) {
            setCustomError(err.message);
            setIsSending(false);
        }
    };

    const registerButtonDisabled = useMemo(() => {
        return isAuthenticating;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticating]);

    const finishButtonDisabled = useMemo(() => {
        return !selectedOption || Object.keys(selectedForms).length === 0 || isSending || isSuccess;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedOption, selectedForms, isSending, isSuccess]);

    const inputDisabled = useMemo(() => {
        return isSending || isSuccess;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSending, isSuccess]);

    return (
        <div className="scrollable-container">
            <div className="p-8 max-w-3xl w-full mx-auto mt-4 bg-white rounded-lg shadow-lg hero">
                <div className="title flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold flex gap-2 items-center justify-left">
                        <IntegrationIcon fill={"#0866FF"} stroke={"#0866FF"} />
                        Facebook Integration
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
                            {!loginStatus && (
                                <p className="block font-bold mb-1">
                                    Click the button below and link Yogleads WebApp to your Facebook Account.
                                </p>
                            )}
                            {loginStatus && pageData.length !== 0 && (
                                <p className="block font-bold mb-1">
                                    Select the Page and Form(s) you want to add to Yogleads and click Finish.
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col justify-evenly">
                        {!loginStatus && (
                            <div className="flex justify-center mt-4">
                                <button
                                    disabled={registerButtonDisabled}
                                    onClick={() => handleRegisterButton()}
                                    className={`bg-blue-500 flex items-center justify-center text-white w-1/3 px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none
            ${registerButtonDisabled || isAuthenticating ? "opacity-50 cursor-not-allowed" : ""}
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
                                    Get Started
                                </button>
                            </div>
                        )}
                        {loginStatus && pageData.length !== 0 && (
                            <div className="flex flex-col justify-center items-center mt-4">
                                <div className="flex justify-start items-center">
                                    <label htmlFor="pageselect" className="block font-bold text-sm mr-2">
                                        Select Page:
                                    </label>
                                    <Select
                                        disabled={inputDisabled}
                                        id="pageselect"
                                        name="page"
                                        value={selectedOption}
                                        options={getPageOptions()}
                                        onChange={handleSelectOption}
                                        placeholder={"Please Select..."}
                                        styles={{
                                            // To make the select wider
                                            control: (provided) => ({
                                                ...provided,
                                                width: "300px", // Adjust the width as needed
                                            }),
                                        }}
                                        //className="mr-4" // Add margin-right to the Select component
                                    />
                                </div>
                                {isLoading && (
                                    <div className="flex justify-center items-center mt-4">
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

                                {!isLoading && formsData.length !== 0 && (
                                    <div className="flex flex-col justify-center items-stretch mt-6">
                                        <label
                                            htmlFor="formselect"
                                            className="block font-bold mb-1 text-sm text-center"
                                        >
                                            Select Form(s) to synchronise (atleast one):
                                        </label>
                                        <div className="flex justify-start items-center mt-2">
                                            <CheckBox
                                                disabled={inputDisabled}
                                                id="allCheck"
                                                checked={Object.keys(selectedForms).length === formsData.length}
                                                onChange={handleToggleAllCheckboxes}
                                            />
                                            <label htmlFor="allCheck" className="text-md text-red-500 ml-2">
                                                {Object.keys(selectedForms).length === formsData.length
                                                    ? "Deselect All"
                                                    : "Select All"}
                                            </label>
                                        </div>
                                        <div className="max-h-[300px] overflow-auto">
                                            {formsData.map((form, index) => (
                                                <div
                                                    key={form.id || index}
                                                    className="flex justify-start items-center mt-2"
                                                >
                                                    <CheckBox
                                                        disabled={inputDisabled}
                                                        id={form.id}
                                                        checked={selectedForms.hasOwnProperty(form.id)}
                                                        onChange={(e) => handleChangeCheckBox(e, form)}
                                                    />
                                                    <label htmlFor={form.id} className="ml-2 text-md">
                                                        {form.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {customError && (
                                    <div className="flex justify-center items-center mt-4">
                                        <p className="text-red-500 text-center">{customError}</p>
                                    </div>
                                )}
                                <div className="flex justify-stretch mt-6">
                                    <button
                                        disabled={finishButtonDisabled}
                                        onClick={() => handleFinishButton()}
                                        className={`bg-blue-500 flex items-center justify-center text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none
            ${finishButtonDisabled || isSending ? "opacity-50 cursor-not-allowed" : ""}
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
                                        Finish
                                    </button>
                                </div>
                            </div>
                        )}
                        {pageData.length === 0 && customError && (
                            <div className="flex justify-center items-center mt-4">
                                <p className="text-red-500 text-center">{customError}</p>
                            </div>
                        )}
                        {isSuccess && (
                            <div className="flex justify-center mt-4 pb-2">
                                <p className="text-green-500 text-md text-center">
                                    Integration Successful!
                                    <br />
                                    It may take some time for Facebook Data to show on Dashboard.
                                    <br />
                                    Please refresh the "My Search History" page if you don't see the "Facebook Data"
                                    Tab.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacebookIntegration;
