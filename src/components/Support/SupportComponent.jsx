import { useState, useMemo } from "react";
import { MdClose } from "react-icons/md";
import { BiSupport } from "react-icons/bi";

const SupportComponent = ({ onClose }) => {
    const parent = useMemo(() => {
        try {
            return localStorage.getItem("self") ? JSON.parse(localStorage.getItem("self")) : {};
        } catch (err) {
            return {};
        }
    }, []);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState(parent.email);
    const [concern, setConcern] = useState("");

    const [isSending, setIsSending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [customError, setCustomError] = useState(null);

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const handlePhoneChange = (e) => {
        setPhone(e.target.value);
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleConcernChange = (e) => {
        setConcern(e.target.value);
    };

    const sendTicketRequest = () => {
        var myHeaders = new Headers();
        myHeaders.append(
            "Authorization",
            "Bearer pattHJpLLHMasU8fb.4bea76febc1fa4e4f11ef342d0fff91b89c849466bba7e4c0bb1d41846de6816"
        );
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append(
            "Cookie",
            "brw=brwv7YbQ6lPhL92vc; AWSALB=Ksvcfe7GuitLEGJEWxxb9DpNoFxuV3y1qUJGUIbYoe21vd3y1GTc+Imk7EyHKwOL0mnMB6CsjRVOZ3hv3ECDEQkM/GSGyb6ZUWOxWNkQdeiI8LerewPgo/dFfh9s; AWSALBCORS=Ksvcfe7GuitLEGJEWxxb9DpNoFxuV3y1qUJGUIbYoe21vd3y1GTc+Imk7EyHKwOL0mnMB6CsjRVOZ3hv3ECDEQkM/GSGyb6ZUWOxWNkQdeiI8LerewPgo/dFfh9s"
        );

        var raw = JSON.stringify({
            records: [
                {
                    fields: {
                        Name: name,
                        "Phone Number": phone,
                        Email: email,
                        Concern: concern,
                        Plugin_Type: "Dashboard",
                    },
                },
            ],
        });

        var requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow",
        };
        return fetch("https://api.airtable.com/v0/appvONEclqMcPdUTh/Extension%20Tickets", requestOptions);
    };

    const handleSubmitButton = async () => {
        setIsSending(true);
        setIsSuccess(false);

        await sendTicketRequest()
            .then((res) => res.json())
            .then((res) => {
                setIsSending(false);
                setIsSuccess(true);
            })
            .catch((err) => {
                setIsSending(false);
                setCustomError("Something went wrong. Please try again later.");
                setIsSuccess(false);
                return;
            });
    };

    const handleClickToggleModel = (e) => {
        if (!onClose) return;
        onClose(e);
    };

    const buttonDisabled = useMemo(() => {
        return !name || !phone || !email || !concern || isSuccess;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [name, phone, email, concern, isSuccess]);

    const inputDisabled = useMemo(() => {
        return isSending || isSuccess;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSending, isSuccess]);

    return (
        <div className="support bg-white px-6 py-4 shadow-app1 max-w-md w-full h-full overflow-auto">
            <div className="title flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold flex gap-2 items-center justify-left">
                    <BiSupport style={{ fontSize: "1.5rem" }} />
                    Support Form
                </h2>

                <span
                    className="h-8 w-8 f-center bg-gray rounded-full cursor-pointer"
                    onClick={(e) => handleClickToggleModel(e)}
                >
                    <MdClose className="text-lg" />
                </span>
            </div>

            <div className="">
                <div className="mb-4">
                    <label htmlFor="name" className="block font-bold mb-1 text-sm">
                        Name:
                    </label>
                    <input
                        disabled={inputDisabled}
                        type="text"
                        id="name"
                        value={name}
                        onChange={handleNameChange}
                        className="w-full text-sm px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:border-blue-400"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="phone" className="block font-bold mb-1 text-sm">
                        Phone:
                    </label>
                    <input
                        disabled={inputDisabled}
                        type="text"
                        id="phone"
                        value={phone}
                        onChange={handlePhoneChange}
                        className="w-full text-sm px-4 py-2 border rounded-md focus:outline-none focus:border-blue-400"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="email" className="block font-bold mb-1 text-sm">
                        Email:
                    </label>
                    <input
                        disabled={true}
                        type="text"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                        className="w-full text-sm px-4 py-2 border rounded-md focus:outline-none focus:border-blue-400"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="concern" className="block font-bold mb-1 text-sm">
                        Query/Concern:
                    </label>
                    <textarea
                        disabled={inputDisabled}
                        id="concern"
                        value={concern}
                        onChange={handleConcernChange}
                        className="w-full text-sm px-4 py-2 border rounded-md resize-none focus:outline-none focus:border-blue-400"
                        rows="4"
                    ></textarea>
                </div>

                <div className="flex justify-between items-center">
                    <button
                        disabled={buttonDisabled}
                        onClick={() => handleSubmitButton()}
                        className={`bg-blue-500 flex items-center justify-center text-white w-1/3 px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none
            ${buttonDisabled ? "opacity-50 cursor-not-allowed" : ""}
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
                        Submit
                    </button>
                </div>

                {isSuccess && (
                    <div className="flex justify-start items-center mt-4">
                        <p className="text-green-500 text-center">Your ticket has been submitted successfully.</p>
                    </div>
                )}

                {customError && (
                    <div className="flex justify-start items-center mt-4">
                        <p className="text-red-500 text-center">{customError}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportComponent;
