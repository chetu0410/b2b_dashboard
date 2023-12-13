import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Iframe from "react-iframe";
import { CallIcon } from "../../../components";
import UpdateCallModel from "./UpdateCallModel";
import formatFBAddress from "../../../utils/formatFBAddress";
import formatFBTimestamp from "../../../utils/formatFBTimestamp";
import formatTIAddress from "../../../utils/formatTIAddress";

const PendingLeadsTab = ({ fetching, data, integrationFlag, onUpdate }) => {
    console.log(data,'data in pending leads')
    const [mustFinalise, setMustFinalise] = useState(false);
    const [updateCallModel, setUpdateCallModel] = useState({ open: false });

    const [dialerModel, setDialerModel] = useState(false);
    const [callUrl, setCallUrl] = useState("");

    const handleClickToggleUpdateCallModel = (e, open, data = {}) => {
        if (e && e.target.closest(".discart_model")) return;
        setUpdateCallModel({ ...updateCallModel, open, ...data });
    };

    const handleClickDisabled = () => {
        toast.error("You must 'Finish' updating the current lead first!");
    };

    const handleMustFinalise = (e) => {
        setMustFinalise(e);
    };

    useEffect(() => {
        if (!updateCallModel.open) {
            setCallUrl("");
            setDialerModel(false);
        }
    }, [updateCallModel]);

    return (
        <>
            {!fetching && (
                <section>
                    {integrationFlag === 0 && (
                        <div className="content mb-5">
                            {data.map((details, i) => {
                                return (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between gap-2 px-4 py-4 rounded-md shadow-app1 mb-6 bg-white hover:bg-gray-50"
                                        onClick={(e) => {
                                            if (!mustFinalise) handleClickToggleUpdateCallModel(e, true, details);
                                            else handleClickDisabled();
                                        }}
                                    >
                                        <div className="flex items-center w-1/3">
                                            <span className="w-12 h-12 f-center border border-blue-500 rounded-full shrink-0">
                                                <CallIcon height={23} width={24} />
                                            </span>

                                            <div className="max-w-md ml-4 ">
                                                {details.cname && (
                                                    <p className="text-lg font-medium leading-none mb-2">
                                                        {details.cname}
                                                    </p>
                                                )}
                                                {details.nature_of_business && (
                                                    <p className="text-md font-normal leading-none mb-2">
                                                        <span className="text-gray-600 mr-2">Category:</span>
                                                        {details.nature_of_business}
                                                    </p>
                                                )}
                                                {details.entity_type && (
                                                    <p className="text-md font-normal leading-none">
                                                        <span className="text-gray-600 mr-2">Type:</span>
                                                        {details.entity_type}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-1/3 ml-2">
                                            {details.address && (
                                                <p className="text-md font-normal leading-none mb-2">
                                                    <span className="text-gray-600 mr-2">Address:</span>
                                                    {details.address}
                                                </p>
                                            )}
                                            {details.web_link && (
                                                <div className="leading-none mb-2">
                                                    <span className="text-gray-600 mr-2">Website:</span>
                                                    <a
                                                        className="discart_model text-md text-blue-500 font-normal break-all hover:underline"
                                                        href={details.web_link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        {details.web_link}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-center w-1/3">
                                            <div>
                                                <h6 className="text-3xl font-semibold text-green-700 text-center">
                                                    {details.alloc_sequence - 1}
                                                </h6>
                                                <p className="text-sm font-medium text-gray-600">Attempt(s) Made</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {integrationFlag === 1 && (
                        <div className="content mb-5">
                            {data.map((details, i) => {
                                return (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between gap-2 px-4 py-4 rounded-md shadow-app1 mb-6 bg-white hover:bg-gray-50"
                                        onClick={(e) => {
                                            if (!mustFinalise) handleClickToggleUpdateCallModel(e, true, details);
                                            else handleClickDisabled();
                                        }}
                                    >
                                        <div className="flex items-center w-1/3">
                                            <span className="w-12 h-12 f-center border border-blue-500 rounded-full shrink-0">
                                                <CallIcon height={23} width={24} />
                                            </span>

                                            <div className="max-w-md ml-4 ">
                                                {details.sender_name && (
                                                    <p className="text-lg font-medium leading-none mb-2">
                                                        {details.sender_name}
                                                    </p>
                                                )}
                                                {details.subject && (
                                                    <p className="text-md font-normal leading-none">
                                                        <span className="text-gray-600 mr-2">Subject:</span>
                                                        {details.subject}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-1/3 ml-2">
                                            {details.query_product_name && (
                                                <p className="text-md font-normal leading-none mb-2">
                                                    <span className="text-gray-600 mr-2">Query Product:</span>
                                                    {details.query_product_name}
                                                </p>
                                            )}
                                            {details.query_mcat_name && (
                                                <p className="text-md font-normal leading-none mb-2">
                                                    <span className="text-gray-600 mr-2">Query Category:</span>
                                                    {details.query_mcat_name}
                                                </p>
                                            )}
                                            {details.query_time && (
                                                <p className="text-md font-normal leading-none">
                                                    <span className="text-gray-600 mr-2">Query Time:</span>
                                                    {details.query_time}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex justify-center w-1/3">
                                            <div>
                                                <h6 className="text-3xl font-semibold text-green-700 text-center">
                                                    {details.alloc_sequence - 1}
                                                </h6>
                                                <p className="text-sm font-medium text-gray-600">Attempt(s) Made</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {integrationFlag === 2 && (
                        <div className="content mb-5">
                            {data.map((details, i) => {
                                return (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between gap-2 px-4 py-4 rounded-md shadow-app1 mb-6 bg-white hover:bg-gray-50"
                                        onClick={(e) => {
                                            if (!mustFinalise) handleClickToggleUpdateCallModel(e, true, details);
                                            else handleClickDisabled();
                                        }}
                                    >
                                        <div className="flex items-center w-1/3">
                                            <span className="w-12 h-12 f-center border border-blue-500 rounded-full shrink-0">
                                                <CallIcon height={23} width={24} />
                                            </span>

                                            <div className="max-w-md ml-4">
                                                {details.full_name && (
                                                    <p className="text-lg font-medium leading-none mb-2">
                                                        {details.full_name}
                                                    </p>
                                                )}
                                                {details.created_time && (
                                                    <p className="text-md font-normal leading-none">
                                                        <span className="text-gray-600 mr-2">Created Time:</span>
                                                        {formatFBTimestamp(details.created_time)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-1/3 ml-2">
                                            {(details.street_address ||
                                                details.city ||
                                                details.state ||
                                                details.zip_code) && (
                                                <p className="text-md font-normal leading-none">
                                                    <span className="text-gray-600 mr-2">Full Address:</span>
                                                    {formatFBAddress(
                                                        details.street_address,
                                                        details.city,
                                                        details.state,
                                                        details.zip_code
                                                    )}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex justify-center w-1/3">
                                            <div>
                                                <h6 className="text-3xl font-semibold text-green-700 text-center">
                                                    {details.alloc_sequence - 1}
                                                </h6>
                                                <p className="text-sm font-medium text-gray-600">Attempt(s) Made</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {integrationFlag === 3 && (
                        <div className="content mb-5">
                            {data.map((details, i) => {
                                return (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between gap-2 px-4 py-4 rounded-md shadow-app1 mb-6 bg-white hover:bg-gray-50"
                                        onClick={(e) => {
                                            if (!mustFinalise) handleClickToggleUpdateCallModel(e, true, details);
                                            else handleClickDisabled();
                                        }}
                                    >
                                        <div className="flex items-center w-1/3">
                                            <span className="w-12 h-12 f-center border border-blue-500 rounded-full shrink-0">
                                                <CallIcon height={23} width={24} />
                                            </span>

                                            <div className="max-w-md ml-4 ">
                                                {details.sender_name && (
                                                    <p className="text-lg font-medium leading-none mb-2">
                                                        {details.sender_name}
                                                    </p>
                                                )}
                                                {details.sender_company && (
                                                    <p className="text-md font-normal leading-none mb-2">
                                                        <span className="text-gray-600 mr-2">Sender Company:</span>
                                                        {details.sender_company}
                                                    </p>
                                                )}
                                                {(details.sender_city ||
                                                    details.sender_state ||
                                                    details.sender_country) && (
                                                    <p className="text-md font-normal leading-none">
                                                        <span className="text-gray-600 mr-2">Sender Address:</span>
                                                        {formatTIAddress(
                                                            details.sender_city,
                                                            details.sender_state,
                                                            details.sender_country
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-1/3 ml-2">
                                            {details.inquiry_type && (
                                                <p className="text-md font-normal leading-none mb-2">
                                                    <span className="text-gray-600 mr-2">Inquiry Type:</span>
                                                    {details.inquiry_type}
                                                </p>
                                            )}
                                            {details.product_name && (
                                                <p className="text-md font-normal leading-none mb-2">
                                                    <span className="text-gray-600 mr-2">Product Name:</span>
                                                    {details.product_name}
                                                </p>
                                            )}
                                            {details.product_source && (
                                                <p className="text-md font-normal leading-none mb-2">
                                                    <span className="text-gray-600 mr-2">Product Source:</span>
                                                    {details.product_source}
                                                </p>
                                            )}
                                            {details.source && (
                                                <p className="text-md font-normal leading-none mb-2">
                                                    <span className="text-gray-600 mr-2">Inquiry Source:</span>
                                                    {details.source}
                                                </p>
                                            )}
                                            {details.generated_date && (
                                                <p className="text-md font-normal leading-none">
                                                    <span className="text-gray-600 mr-2">Generated Timestamp:</span>
                                                    {details.generated_date + " " + details.generated_time}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex justify-center w-1/3">
                                            <div>
                                                <h6 className="text-3xl font-semibold text-green-700 text-center">
                                                    {details.alloc_sequence - 1}
                                                </h6>
                                                <p className="text-sm font-medium text-gray-600">Attempt(s) Made</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}

            {updateCallModel.open && (
                <div className="update_call fixed top-20 right-0 bottom-0 max-h-lg max-w-4xl w-full flex justify-end gap-0 pointer-events-none">
                    {dialerModel && (
                        <Iframe
                            id="dialer"
                            url={callUrl}
                            allow="camera;microphone"
                            height="310px"
                            scrolling="no"
                            className="self-end pointer-events-auto"
                        />
                    )}

                    <UpdateCallModel
                        key={updateCallModel.record_uid}
                        data={updateCallModel}
                        integrationFlag={integrationFlag}
                        handleMustFinalise={handleMustFinalise}
                        onUpdate={onUpdate}
                        onDial={setDialerModel}
                        setUrl={setCallUrl}
                        onClose={(e) => handleClickToggleUpdateCallModel(e, false)}
                    />
                </div>
            )}
        </>
    );
};

export default PendingLeadsTab;
