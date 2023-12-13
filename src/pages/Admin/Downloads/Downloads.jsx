import { useState } from "react";

import logorouded from "../../../assets/images/logo-rounded.png";
import { Button } from "../../../components";
import config from "../../../config/config";
import WhatsappDownload from "./WhatsappDownload";

const Downloads = () => {
    const [whatsappModel, setWhatsappModel] = useState(false);

    const handleClickDownloadChromeExtension = () => {
        const h = 600;
        const w = 1120;
        var top = window.screen.height / 2 - h / 2;
        var left = window.screen.width / 2 - w / 2;
        const windowOptions = `height=${h},width=${w},top=${top},left=${left}`;
        window.open(config.CHROME_EXTENSION_URL, "YogLeads Chrome Extension", windowOptions);
    };

    const handleClickToggleWhatsappModel = () => {
        setWhatsappModel((prev) => !prev);
    };

    return (
        <div className="downloads_page page">
            <div className="info mb-8">
                <h2 className="font-semibold text-2xl">Downloads</h2>
            </div>

            <div className="content mb-5">
                <div className="yogleads_extension flex items-center justify-between p-4 rounded-md shadow-app1 mb-8">
                    <div className="info flex items-center">
                        <img src={logorouded} alt="logo" width="70" />

                        <div className="ml-4 ">
                            <p className="text-2xl font-medium mb-0.5">Yog B2B Chrome Extension</p>
                            <p className="text-lg text-gray-600 font-medium">
                                Search and Add Leads on your Chrome Browser using Google Places
                            </p>
                        </div>
                    </div>

                    <div className="action ml-4 max-w-xs w-full">
                        <Button
                            className="w-full hover:!bg-primary"
                            variant="outlined"
                            color="primary"
                            size="xl"
                            onClick={handleClickDownloadChromeExtension}
                        >
                            Install Extension
                        </Button>
                    </div>
                </div>

                <div className="yogleads_app flex items-center justify-between p-4 rounded-md shadow-app1 mb-6">
                    <div className="info flex items-center">
                        <img src={logorouded} alt="logo" width="70" />

                        <div className="ml-4 ">
                            <p className="text-2xl font-medium mb-0.5">YogLeads Android App</p>
                            <p className="text-lg text-gray-600 font-medium">
                                Use Calling List Feature to connect with Leads
                            </p>
                        </div>
                    </div>

                    <div className="action ml-4 max-w-xs w-full">
                        <Button
                            className="w-full hover:!bg-primary"
                            variant="outlined"
                            color="primary"
                            size="xl"
                            onClick={handleClickToggleWhatsappModel}
                        >
                            Get Download Link
                        </Button>
                    </div>
                </div>
            </div>

            {whatsappModel && <WhatsappDownload onClose={handleClickToggleWhatsappModel} />}
        </div>
    );
};

export default Downloads;
