import React, { useState } from "react";
import toast from "react-hot-toast";
import { MdClose } from "react-icons/md";
import { Button, Input, WhatsAppIcon } from "../../../components";

const WhatsappDownload = ({ onClose }) => {
    const [mobile, setMobile] = useState("+91");

    const handleChangeMobile = (e) => {
        setMobile(e.target.value);
    };

    const handleClickSendMeLink = (e) => {
        if (!mobile) return toast.error("Please enter mobile number");

        const phone = [...mobile].filter((str) => str !== "+" && str.trim() !== "").join("");

        if (phone.length < 7) return toast.error("Enter valid mobile number");

        window.open(
            `https://wa.me/${phone}?text=Hello%2C+%0D%0AHere+is+the+download+link+to+YogLeads+Calling+App.%0D%0Ahttps%3A%2F%2Fyogleads-app-apk.s3.ap-south-1.amazonaws.com%2Flive-apk%2FYogLeads-Calling-App.apk`
        );

        if (onClose) onClose(e);
    };
    return (
        <div className="whatsapp_download_app_model fixed top-0 bottom-0 left-0 right-0 bg-model f-center">
            <div className="max-w-xl w-full bg-white p-8 rounded-md shadow-app2 relative">
                <span
                    className="absolute -top-10 right-2 h-8 w-8 f-center bg-white rounded-full cursor-pointer"
                    onClick={onClose}
                >
                    <MdClose className="text-lg" />
                </span>

                <div className="flex justify-between mb-4">
                    <div className="info">
                        <h4 className="text-2xl font-semibold mb-3">Send App Download Link via Whatsapp</h4>
                        <p className="text-lg text-gray-500 font-medium leading-5">
                            Enter the receipient whatsapp number below to
                            <br />
                            send the download link for YogLeads Calling App.
                        </p>
                    </div>

                    <div className="ml-2">
                        <WhatsAppIcon height={48} width={48} />
                    </div>
                </div>

                <div className="f-center flex-col max-w-sm mx-auto mt-10">
                    <Input value={mobile} onChange={handleChangeMobile} />

                    {/* <IconInput className="!rounded-md" place="start" onChange={handleChangeMobile}>
                        <p className="pl-1">+91</p>
                    </IconInput> */}

                    <div className="max-w-xs w-full mt-5">
                        <Button
                            className="w-full"
                            variant="outlined"
                            color="primary"
                            size="lg"
                            onClick={handleClickSendMeLink}
                        >
                            Send Me Link
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsappDownload;
