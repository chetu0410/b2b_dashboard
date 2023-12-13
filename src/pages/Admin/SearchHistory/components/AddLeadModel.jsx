import { useMemo, useState } from "react";
import { MdClose } from "react-icons/md";
import { RiUserAddLine } from "react-icons/ri";
import Select from "react-select";
import "../../../../assets/css/sendmessage.css";
import { addOwnLead } from "../../../../apis";

const AddLeadModel = ({ onClose }) => {
    const [customError, setCustomError] = useState(null);
    const [companyName, setCompanyName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [emailAddress, setEmailAddress] = useState("");
    const [address, setAddress] = useState("");
    const [website, setWebsite] = useState("");
    const [turnover, setTurnover] = useState(null);
    const [entityType, setEntityType] = useState(null);
    const [gstNumber, setGstNumber] = useState("");
    const [nob, setNob] = useState("");
    const [execName, setExecName] = useState("");

    const [isSending, setIsSending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const turnoverOptions = [
        { value: 0, label: "N/A" },
        { value: 1, label: "Rs. 0 to 40 lakhs" },
        { value: 2, label: "Rs. 40 lakhs to 1.5 Cr." },
        { value: 3, label: "Rs. 1.5 Cr. to 5 Cr." },
        { value: 4, label: "Rs. 5 Cr. to 25 Cr." },
        { value: 5, label: "Rs. 25 Cr. to 100 Cr." },
        { value: 6, label: "Rs. 100 Cr. to 500 Cr." },
        { value: 7, label: "More than Rs. 500 Cr." },
    ];

    const entityOptions = [
        { value: 0, label: "N/A" },
        { value: 1, label: "Proprietorship" },
        { value: 2, label: "Private Limited Company" },
        { value: 3, label: "Public Limited Company" },
        { value: 4, label: "Partnership" },
        { value: 5, label: "Limited Liability Partnership" },
        //{ value: 6, label: "Other" },
    ];

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

    const handleCompanyNameChange = (e) => {
        setCompanyName(e.target.value);
    };

    const handleMobileNumberChange = (e) => {
        setMobileNumber(e.target.value);
    };

    const handleEmailAddressChange = (e) => {
        setEmailAddress(e.target.value);
    };

    const handleAddressChange = (e) => {
        setAddress(e.target.value);
    };

    const handleWebsiteChange = (e) => {
        setWebsite(e.target.value);
    };

    const handleTurnoverChange = (option) => {
        setTurnover(option);
    };

    const handleEntityTypeChange = (option) => {
        setEntityType(option);
    };

    const handleGstNumberChange = (e) => {
        setGstNumber(e.target.value);
    };

    const handleNobChange = (e) => {
        setNob(e.target.value);
    };

    const handleExecNameChange = (e) => {
        setExecName(e.target.value);
    };

    /*async function addLead(body) {
        const url = "http://13.234.159.105/dashboard/addYourOwnLead";
        try {
            return fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
        } catch (err) {
            console.error(err.message);
            return null;
        }
    }*/

    const handleAddButton = async () => {
        setIsSuccess(false);
        setIsSending(true);
        setCustomError(null);

        const body = {
            parent_user_uid: parent.parent_user_uid,
            ...(companyName && { cname: companyName }),
            ...(mobileNumber && { mobile_number: mobileNumber }),
            ...(emailAddress && { email_address: emailAddress }),
            ...(address && { address: address }),
            ...(website && { web_link: website }),
            ...(turnover && turnover.value && { Turnover: turnover.value }),
            ...(entityType && entityType.value && { entity_type: entityType.label }),
            ...(gstNumber && { GST_NUMBER: gstNumber }),
            ...(nob && { nature_of_business: nob }),
            ...(execName && { executive_name: execName }),
        };

        try {
            const { data: res } = await addOwnLead(body);

            if (res.status !== "success") {
                setIsSending(false);
                setIsSuccess(false);
                throw new Error("Error in adding lead. Please try again later.");
            }
            setIsSending(false);
            setIsSuccess(true);
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        } catch (err) {
            setCustomError(err.message);
            setIsSending(false);
            setIsSuccess(false);
        }
    };

    const buttonDisabled = useMemo(() => {
        return (
            (!companyName &&
                !mobileNumber &&
                !emailAddress &&
                !address &&
                !website &&
                !turnover &&
                !entityType &&
                !gstNumber &&
                !nob &&
                !execName) ||
            isSuccess
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        companyName,
        mobileNumber,
        emailAddress,
        address,
        website,
        turnover,
        entityType,
        gstNumber,
        nob,
        execName,
        isSuccess,
    ]);

    const inputDisabled = useMemo(() => {
        return isSending || isSuccess;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSending, isSuccess]);

    return (
        <div className="scrollable-container">
            <div className="p-8 max-w-3xl w-full mx-auto my-4 bg-white rounded-lg shadow-lg hero">
                <div className="title flex items-center justify-between mb-5">
                    <h2 className="text-xl font-bold flex gap-2 items-center justify-left">
                        <RiUserAddLine size={48} />
                        Add New Lead
                    </h2>
                    <span
                        className="h-8 w-8 f-center bg-gray rounded-full cursor-pointer"
                        onClick={(e) => handleClickToggleModel(e)}
                    >
                        <MdClose className="text-lg" />
                    </span>
                </div>
                <div className={"flex flex-col ml-8 gap-y-4"}>
                    <div className="grid grid-cols-8 pb-2">
                        <label htmlFor="cname" className="block col-span-3 font-bold ml-8 text-m flex items-center">
                            Company Name:
                        </label>
                        <input
                            disabled={inputDisabled}
                            type="text"
                            id="cname"
                            value={companyName}
                            onChange={handleCompanyNameChange}
                            className="w-full max-w-[360px] col-span-5 text-m px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                        />
                    </div>
                    <div className="grid grid-cols-8 pb-2">
                        <label
                            htmlFor="execName"
                            className="block col-span-3 font-bold ml-8 pt-2 text-m flex items-start"
                        >
                            Executive Name(s):
                        </label>
                        <div className="col-span-5">
                            <input
                                disabled={inputDisabled}
                                type="text"
                                id="execName"
                                value={execName}
                                onChange={handleExecNameChange}
                                className="w-full max-w-[360px] text-m px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                            />
                            <p className="text-xs text-gray-500">
                                Please add commas for multiple names.
                                <br /> for e.g. Kabir Singh, Raju Shah
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-8 pb-2">
                        <label
                            htmlFor="mobileNumber"
                            className="block col-span-3 font-bold ml-8 pt-2 text-m flex items-start"
                        >
                            Mobile Number(s):
                        </label>
                        <div className="col-span-5">
                            <input
                                disabled={inputDisabled}
                                type="text"
                                id="mobileNumber"
                                value={mobileNumber}
                                onChange={handleMobileNumberChange}
                                className="w-full max-w-[360px] text-m px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                            />
                            <p className="text-xs text-gray-500">
                                Please add commas for multiple numbers.
                                <br /> for e.g. +918882908807, +917061726881
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-8 pb-2">
                        <label htmlFor="email" className="block col-span-3 font-bold ml-8 pt-2 text-m flex items-start">
                            Email(s):
                        </label>
                        <div className="col-span-5">
                            <input
                                disabled={inputDisabled}
                                type="text"
                                id="email"
                                value={emailAddress}
                                onChange={handleEmailAddressChange}
                                className="w-full max-w-[360px] text-m px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                            />
                            <p className="text-xs text-gray-500">
                                Please add commas for multiple emails.
                                <br /> for e.g. email1905@gmail.com, xyz123@gmail.com
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-8 pb-2">
                        <label
                            htmlFor="address"
                            className="block col-span-3 font-bold ml-8 pt-2 text-m flex items-start"
                        >
                            Company Address:
                        </label>
                        <textarea
                            disabled={inputDisabled}
                            type="text"
                            id="address"
                            value={address}
                            onChange={handleAddressChange}
                            className="w-full max-w-[360px] col-span-5 text-m px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                            rows={4}
                        ></textarea>
                    </div>
                    <div className="grid grid-cols-8 pb-2">
                        <label htmlFor="gst" className="block col-span-3 font-bold ml-8 text-m flex items-center">
                            GST Number:
                        </label>
                        <input
                            disabled={inputDisabled}
                            type="text"
                            id="gst"
                            value={gstNumber}
                            onChange={handleGstNumberChange}
                            className="w-full max-w-[360px] col-span-5 text-m px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                        />
                    </div>
                    <div className="grid grid-cols-8 pb-2">
                        <label htmlFor="turnover" className="block col-span-3 font-bold ml-8 text-m flex items-center">
                            Turnover:
                        </label>
                        <Select
                            name="turnover"
                            id="turnover"
                            value={turnover}
                            options={turnoverOptions}
                            onChange={handleTurnoverChange}
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
                            className="col-span-5"
                        />
                    </div>
                    <div className="grid grid-cols-8 pb-2">
                        <label
                            htmlFor="entityType"
                            className="block col-span-3 font-bold ml-8 text-m flex items-center"
                        >
                            Entity Type:
                        </label>
                        <Select
                            name="entityType"
                            id="entityType"
                            value={entityType}
                            options={entityOptions}
                            onChange={handleEntityTypeChange}
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
                            className="col-span-5"
                        />
                    </div>
                    <div className="grid grid-cols-8 pb-2">
                        <label htmlFor="nob" className="block col-span-3 font-bold ml-8 text-m flex items-center">
                            Category/Nature of Business:
                        </label>
                        <input
                            disabled={inputDisabled}
                            type="text"
                            id="nob"
                            value={nob}
                            onChange={handleNobChange}
                            className="w-full max-w-[360px] col-span-5 text-m px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                        />
                    </div>
                    <div className="grid grid-cols-8 pb-2">
                        <label htmlFor="website" className="block col-span-3 font-bold ml-8 text-m flex items-center">
                            Company Website:
                        </label>
                        <input
                            disabled={inputDisabled}
                            type="text"
                            id="website"
                            value={website}
                            onChange={handleWebsiteChange}
                            className="w-full max-w-[360px] col-span-5 text-m px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                        />
                    </div>
                    <div className="flex justify-center mt-4">
                        <button
                            disabled={buttonDisabled || isSending}
                            onClick={() => handleAddButton()}
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
                            Add Lead
                        </button>
                    </div>
                    {isSuccess && (
                        <div className="flex items-center justify-center mt-4 pb-2">
                            <p className="text-green-500 text-md text-center">
                                Lead added successfully! Page will now refresh...
                            </p>
                        </div>
                    )}
                    {customError && (
                        <div className="flex justify-center items-center mt-4 pb-2">
                            <p className="text-red-500 text-md text-center">{customError}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddLeadModel;
