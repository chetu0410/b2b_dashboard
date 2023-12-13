import { useMemo, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { MdClose } from "react-icons/md";
import {
    FaAddressCard,
    FaBuildingColumns,
    FaBuildingUser,
    FaHandshake,
    FaLock,
    FaPersonCircleQuestion,
    FaUserTie,
} from "react-icons/fa6";

import { Button, Spinner, WhatsAppIcon } from "../../../components";
import { getGstDirector } from "../../../apis";
import cookieHelper from "../../../utils/cookieHelper";

const SearchDetailsModel = ({ data = {}, onClose }) => {
    const navigate = useNavigate();
    const [directorData, setDirectorData] = useState({});
    const [fetching, setFetching] = useState(false);
    const [creditsExpired, setCreditsExpired] = useState(false);

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

    const fetchDirectorData = async (params, headers) => {
        setFetching(true);
        try {
            const body = {
                gst_numbers: [data.gst_number],
                jwt_token: cookieHelper.getCookie("jwt"),
                b2b_user_uid: parent.parent_user_uid,
                //campaign_name: "default",
            };

            const { data: res } = await getGstDirector(body, params, headers);
            if (res.status !== "success") throw new Error(res.data?.toString());
            if (!res.data || res?.data.includes("Credit GST balance is not greater than 0")) setCreditsExpired(true);
            else {
                setDirectorData(res?.data?.at(0));
                toast.success("Prospect details added to 'My Data' tab.");
            }
        } catch (err) {
            if (err.message.includes("Invalid jwt_token")) {
                toast.error("Your login has expired. Please login again.");
                navigate("/dev/auth/login");
            } else {
                console.log(err.message);
                toast.error(err.message);
            }
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchDirectorData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="lead_detail bg-white px-6 py-4 shadow-app1 max-w-xl w-full h-full overflow-auto overscroll-contain">
            <div className="title flex items-center justify-between mb-5">
                <h5 className="text-lg font-medium">{"Prospect Details"}</h5>

                <span
                    className="h-8 w-8 f-center bg-gray rounded-full cursor-pointer"
                    onClick={(e) => handleClickToggleModel(e)}
                >
                    <MdClose className="text-lg" />
                </span>
            </div>

            <div className="flex items-center justify-between px-4 mb-5">
                <div className="name flex items-center gap-3 w-full text-lg font-medium capitalize">
                    {data.entity_type && (
                        <>
                            {data.entity_type.includes("Proprietorship") &&
                                !data.entity_type.includes("Partnership") &&
                                !data.entity_type.includes("Private") &&
                                !data.entity_type.includes("Public") && <FaUserTie size={24} className="shrink-0" />}
                            {data.entity_type.includes("Partnership") &&
                                !data.entity_type.includes("Proprietorship") &&
                                !data.entity_type.includes("Private") &&
                                !data.entity_type.includes("Public") && <FaHandshake size={24} className="shrink-0" />}
                            {data.entity_type.includes("Private") &&
                                !data.entity_type.includes("Proprietorship") &&
                                !data.entity_type.includes("Partnership") &&
                                !data.entity_type.includes("Public") && (
                                    <FaBuildingUser size={24} className="shrink-0" />
                                )}
                            {data.entity_type.includes("Public") &&
                                !data.entity_type.includes("Proprietorship") &&
                                !data.entity_type.includes("Partnership") &&
                                !data.entity_type.includes("Private") && (
                                    <FaBuildingColumns size={24} className="shrink-0" />
                                )}
                            {!data.entity_type.includes("Proprietorship") &&
                                !data.entity_type.includes("Partnership") &&
                                !data.entity_type.includes("Private") &&
                                !data.entity_type.includes("Public") && (
                                    <FaAddressCard size={24} className="shrink-0" />
                                )}
                        </>
                    )}
                    {!data.entity_type && <FaPersonCircleQuestion className="shrink-0" />}

                    <span>{data.trade_name || data.legal_name}</span>
                </div>
            </div>

            <div className="details mb-5">
                <fieldset className="w-full border-4 border-double border-amber-500 rounded-md p-4">
                    <legend className="px-1 font-semibold text-sm">Director Info</legend>
                    {!fetching && !creditsExpired && Object.keys(directorData).length !== 0 && (
                        <>
                            {directorData.director_name && (
                                <div className="grid grid-cols-8 w-full gap-0.5 mb-5 font-medium">
                                    <p className="col-span-3">Director Name</p>
                                    <span className="col-span-1">:</span>
                                    <div className="col-span-4 text-gray-600">
                                        <p>{directorData.director_name || "-"}</p>
                                    </div>
                                </div>
                            )}

                            {directorData.director_mobile && (
                                <div className="grid grid-cols-8 w-full gap-0.5 mb-5 font-medium">
                                    <p className="col-span-3">Director Mobile</p>
                                    <span className="col-span-1">:</span>
                                    <div className="col-span-4 text-gray-600">
                                        <p>{directorData.director_mobile || "-"}</p>
                                    </div>
                                </div>
                            )}

                            {directorData.director_email && (
                                <div className="grid grid-cols-8 w-full gap-0.5 mb-5 font-medium">
                                    <p className="col-span-3">Director Email</p>
                                    <span className="col-span-1">:</span>
                                    <div className="col-span-4 text-gray-600 break-all">
                                        <p>{directorData.director_email || "-"}</p>
                                    </div>
                                </div>
                            )}

                            {directorData.director_address && (
                                <div className="grid grid-cols-8 w-full gap-0.5 mb-5 font-medium">
                                    <p className="col-span-3">Director Address</p>
                                    <span className="col-span-1">:</span>
                                    <div className="col-span-4 capitalize text-gray-600">
                                        <p>{directorData.director_address}</p>
                                    </div>
                                </div>
                            )}

                            {directorData.org_name && (
                                <div className="grid grid-cols-8 w-full gap-0.5 mb-5 font-medium">
                                    <p className="col-span-3">Organisation Name</p>
                                    <span className="col-span-1">:</span>
                                    <div className="col-span-4 capitalize text-gray-600">
                                        <p>{directorData.org_name}</p>
                                    </div>
                                </div>
                            )}

                            {directorData.org_mobile && (
                                <div className="grid grid-cols-8 w-full gap-0.5 mb-5 font-medium">
                                    <p className="col-span-3">Organisation Mobile</p>
                                    <span className="col-span-1">:</span>
                                    <div className="col-span-4 text-gray-600">
                                        <p>{directorData.org_mobile}</p>
                                    </div>
                                </div>
                            )}

                            {directorData.org_email && (
                                <div className="grid grid-cols-8 w-full gap-0.5 font-medium">
                                    <p className="col-span-3">Organisation Email</p>
                                    <span className="col-span-1">:</span>
                                    <div className="col-span-4 text-gray-600 break-all">
                                        <p>{directorData.org_email}</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    {!fetching && creditsExpired && (
                        <div className="flex flex-col items-center gap-4">
                            <FaLock size={24} />
                            <p className="text-center font-medium text-md">Uh Oh! Your credits are exhausted!</p>
                            <p className="flex items-center gap-1">
                                For top-up request, please contact us on
                                <a
                                    href={`https://wa.me/+919354304061`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-block"
                                >
                                    <Button variant="contained" color="green" size="sm" className="!gap-1">
                                        <WhatsAppIcon color="#FFFFFF" />
                                        +919354304061
                                    </Button>
                                </a>
                            </p>
                        </div>
                    )}
                    {fetching && (
                        <div className="f-center">
                            <Spinner />
                        </div>
                    )}
                </fieldset>

                <div className="w-full border-4 border-double border-transparent rounded-md p-4">
                    <>
                        {data.gst_number && (
                            <div className="grid grid-cols-8 w-full gap-0.5 mb-5">
                                <p className="col-span-3 font-medium">GST Number</p>
                                <span className="col-span-1">:</span>
                                <div className="col-span-4 text-gray-600">
                                    <p>{data.gst_number}</p>
                                </div>
                            </div>
                        )}

                        {data.business_activities && (
                            <div className="grid grid-cols-8 w-full gap-0.5 mb-5">
                                <p className="col-span-3 font-medium">Business Activities</p>
                                <span className="col-span-1">:</span>
                                <div className="col-span-4 text-gray-600">
                                    <p>{data.business_activities}</p>
                                </div>
                            </div>
                        )}

                        {data.entity_type && (
                            <div className="grid grid-cols-8 w-full gap-0.5 mb-5">
                                <p className="col-span-3 font-medium">Entity Type</p>
                                <span className="col-span-1">:</span>
                                <div className="col-span-4 text-gray-600">
                                    <p>{data.entity_type}</p>
                                </div>
                            </div>
                        )}

                        {data.hsn_or_sac && (
                            <div className="grid grid-cols-8 w-full gap-0.5 mb-5">
                                <p className="col-span-3 font-medium">HSN/SAC Numbers</p>
                                <span className="col-span-1">:</span>
                                <div className="col-span-4 text-gray-600">
                                    <p>{data.hsn_or_sac}</p>
                                </div>
                            </div>
                        )}

                        {data.PlaceOfBusiness_address && (
                            <div className="grid grid-cols-8 w-full gap-0.5 mb-5">
                                <p className="col-span-3 font-medium">Full Address</p>
                                <span className="col-span-1">:</span>
                                <div className="col-span-4 text-gray-600">
                                    <p>{data.PlaceOfBusiness_address}</p>
                                </div>
                            </div>
                        )}
                    </>
                </div>
            </div>
        </div>
    );
};

export default SearchDetailsModel;
