import { useState } from "react";
import { FaFileDownload } from "react-icons/fa";

import "../../../assets/css/imagemodal.css";
import { Printer, Spinner } from "../../../components";
import ImageModal from "../../../components/SendMessage/ImageModal";
import formatDate from "../../../utils/formatDate";
import MessagePreview from "../../../components/SendMessage/MessagePreview";

const HistoryTab = ({ fetching, data }) => {
    const [batchModelDetails, setBatchModelDetails] = useState({ open: false });

    const [showModal, setShowModal] = useState(false);
    const [image, setImage] = useState("");

    const showImageInModal = (img) => {
        setImage(img);
        setShowModal(true);
    };

    const handleClickToggleBatchDetails = (e, open, data = {}) => {
        if (e && e.target.closest(".discart_model")) return;
        setBatchModelDetails({ ...batchModelDetails, open, ...data });
    };

    return (
        <section>
            <div className="relative overflow-x-auto min-h-[500px]">
                <table className="w-full text-sm text-left text-gray-900 font-medium">
                    <thead className="text-base text-gray-700 uppercase bg-gray">
                        <tr>
                            {/*<th scope="col" className="p-4">
                                    <CheckBox
                                        checked={selectedLeads.length === leadData.length}
                                        onChange={handleToggleAllCheckboxes}
                                    />
								</th>*/}
                            <th scope="col" className="px-6 py-3">
                                <div className="flex items-center">scheduled time</div>
                            </th>
                            <th scope="col" className="px-6 py-3">
                                <div className="flex items-center">mobile numbers</div>
                            </th>
                            <th scope="col" className="px-6 py-3">
                                <div className="flex items-center justify-center">message</div>
                            </th>
                            <th scope="col" className="px-6 py-3">
                                <div className="flex items-center">attachment</div>
                            </th>
                            <th scope="col" className="px-6 py-3">
                                <div className="flex items-center">type</div>
                            </th>
                        </tr>
                        <tr className="invisible">
                            <th className="invisible px-6 py-3"></th>
                        </tr>
                    </thead>

                    <tbody className="border border-gray-200">
                        {data.map((details, i) => (
                            <tr
                                key={details.batch_uid || i}
                                className={"bg-white hover:bg-gray-50"}
                                /*onClick={(e) => {
                                        if (!mustFinalise) handleClickToggleLeadDetails(e, true, details);
                                        else handleClickDisabled();
                                    }}*/
                            >
                                {/*<td className="w-4 p-4 discart_model">
                                        <CheckBox
                                            checked={selectedLeads.includes(details.id)}
                                            onChange={(e) => handleChangeCheckBox(e, details)}
                                        />
									</td>
                                    <td className="px-6 py-2">
                                        <div className="flex items-center">
                                            <span className="block w-4">
                                                {details.call_allocated === 1 && <CallIcon />}
                                            </span>
                                            <span className="block ml-2 text-ellipsis overflow-hidden max-w-[260px]">
                                                {details.cname}
                                            </span>
                                        </div>
                                    </td>*/}

                                <td className="px-6 py-2 text-ellipsis overflow-hidden max-w-[200px]">
                                    <Printer value={details.formatted_scheduled_time} />
                                </td>

                                <td
                                    className="px-6 py-2 text-ellipsis overflow-hidden max-w-[300px]"
                                    title={details.phone_numbers.join(", ")}
                                >
                                    <Printer value={details.phone_numbers.join(", ")} />
                                </td>

                                <td className="px-6 py-2 text-ellipsis overflow-hidden max-w-[320px]">
                                    <MessagePreview markdownText={details.message} />
                                </td>

                                <td className={`px-6 max-w-[80px] ${details.images.length !== 0 ? "py-2" : "py-6"}`}>
                                    {details.images.length !== 0 && (
                                        <div className="image-modal-container mt-2 p-1 border-2 rounded w-24 h-full flex items-center justify-center relative">
                                            <div className="container-background"></div>
                                            {details.type[0] !== "image" ? (
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
                                                <img src={details.images[0]} alt="" />
                                            )}
                                            {details.type[0] !== "image" ? (
                                                <span
                                                    className="absolute cursor-pointer text-white left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center hover:text-gray-100"
                                                    onClick={() => {
                                                        // Create an anchor element
                                                        const anchor = document.createElement("a");
                                                        // Set the href to the link of the file you want to download
                                                        anchor.href = details.images[0];
                                                        // Append the anchor to the body
                                                        document.body.appendChild(anchor);
                                                        // Trigger the download
                                                        anchor.click();
                                                        // Remove the anchor from the body
                                                        document.body.removeChild(anchor);
                                                    }}
                                                    title="Download PDF"
                                                >
                                                    <FaFileDownload color="currentColor" size={20} />
                                                </span>
                                            ) : (
                                                <span
                                                    className="absolute cursor-pointer text-white left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center hover:text-gray-100"
                                                    onClick={() => showImageInModal(details.images[0])}
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
                                    )}
                                    {details.images.length === 0 && <span className="flex items-center ml-11">-</span>}
                                </td>

                                <td className="px-6 py-2 text-ellipsis uppercase overflow-hidden max-w-[100px]">
                                    {details.type.length !== 0 && <Printer value={details.type[0]} />}
                                    {details.type.length === 0 && <span className="flex items-center ml-4">-</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {!fetching && data.length === 0 && <p className="text-center text-xl">No schedule history found.</p>}

                {fetching && (
                    <div className="f-center absolute top-0 bottom-0 left-0 right-0 bg-model">
                        <Spinner />
                    </div>
                )}
            </div>
            <ImageModal base64={image} show={showModal} setShow={setShowModal} />
        </section>
    );
};

export default HistoryTab;
