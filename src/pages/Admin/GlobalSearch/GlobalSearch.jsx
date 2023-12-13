import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { BsSearch } from "react-icons/bs";
import { IoSyncCircleOutline } from "react-icons/io5";
import { MdCategory } from "react-icons/md";
import { FaCrown } from "react-icons/fa";
import {
    FaAddressCard,
    FaBriefcase,
    FaBuildingColumns,
    FaBuildingUser,
    FaHandshake,
    FaLocationDot,
    FaMoneyBillWave,
    FaPersonCircleQuestion,
    FaUserTie,
} from "react-icons/fa6";
import { RiHandCoinFill } from "react-icons/ri";
import { HiReceiptTax } from "react-icons/hi";
import { TbWorldSearch } from "react-icons/tb";

import { getJumku, getGstDirector } from "../../../apis";
import { Button, CheckBox, GlobalSearchFilters, Input, Pagination, Printer, Spinner } from "../../../components";
import SearchDetailsModel from "./SearchDetailsModel";
import cookieHelper from "../../../utils/cookieHelper";
import handleError from "../../../utils/errorHandler";
import "../../../assets/css/animations.css";

const texts = [
    "Search from a database of 1000000+ prospects from all over India.",
    "Find and connect with prospects easily in your preferred location.",
    "Start a Campaign to obtain multiple prospect details in your 'My Data' tab.",
    // Add more text as needed
];

const GlobalSearch = () => {
    const navigate = useNavigate();
    const [textIndex, setTextIndex] = useState(0);

    const [jumkuData, setJumkuData] = useState([]);
    const [searchTerms, setSearchTerms] = useState({
        hsn_or_sac: "",
        city: "",
        state: "",
        pincode: "",
    });

    const [searchDetailsModel, setSearchDetailsModel] = useState({ open: false });

    const [campaignMode, setCampaignMode] = useState(false);
    const [campaignName, setCampaignName] = useState("");
    const [selectedData, setSelectedData] = useState([]);

    const parent = useMemo(() => {
        try {
            return localStorage.getItem("self") ? JSON.parse(localStorage.getItem("self")) : {};
        } catch (err) {
            return {};
        }
    }, []);

    const [page, setPage] = useState({
        page: 1,
        total: 0,
        totalPage: 1,
        perPage: 20,
        fetching: false,
    });

    const [filters, setFilters] = useState({
        jwt_token: cookieHelper.getCookie("jwt"),
        user_uid: parent.parent_user_uid,
        include_gst_number: 0,
        include_turnover_ranges: [],
        include_business_activities: [],
    });

    const fetchJumkuData = async () => {
        setJumkuData([]);
        setPage({ ...page, total: 0, totalPage: 1, fetching: true });
        try {
            const body = {
                ...filters,
                search_hsn_or_sac: searchTerms.hsn_or_sac,
                include_city: searchTerms.city,
                include_state: searchTerms.state,
                include_pincode: searchTerms.pincode,
                page: page.page,
            };

            const { data: res } = await getJumku(body);
            if (res.status !== "success") throw new Error(res.data?.toString());

            setJumkuData(res?.data);
            setPage({
                ...page,
                total: res?.total_results_count || 0,
                totalPage: res?.total_page_count || 1,
                fetching: false,
            });
        } catch (err) {
            setPage({ ...page, fetching: false });
            console.error(err);

            if (err.message.includes("Invalid jwt_token")) {
                toast.error("Your login has expired. Please login again.");
                navigate("dev/auth/login");
            } else handleError(err);
        }
    };

    const setCampaignData = async (params, headers) => {
        const tId = toast.loading("Getting data for selected prospects. Please wait...", {
            style: {
                maxWidth: 500,
            },
        });
        try {
            const body = {
                gst_numbers: selectedData,
                jwt_token: cookieHelper.getCookie("jwt"),
                b2b_user_uid: parent.parent_user_uid,
                campaign_name: campaignName,
            };

            const { data: res } = await getGstDirector(body, params, headers);
            if (res.status !== "success") throw new Error(res.data?.toString());
            if (!res.data || res?.data.includes("Credit GST balance is not greater than 0"))
                toast.error("Your credits are exhausted!", { id: tId });
            else {
                toast.success("Prospect details added to 'My Data' tab.", { id: tId });
                setCampaignMode(false);
                setSelectedData([]);
                setCampaignName("");
            }
        } catch (err) {
            console.log(err.message);
            toast.error(err.message, { id: tId });
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
        }, 5000); // 0.5s (fade in) + 4s (stay) + 0.5s (fade out) = 5s

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        fetchJumkuData();
    }, [filters, page.page]);

    const handleClickRefresh = (e) => {
        fetchJumkuData();
        setSelectedData([]);
    };

    const handleClickSearch = (e) => {
        fetchJumkuData();
    };

    const handleClickToggleCampaign = () => {
        setCampaignMode((prev) => {
            if (prev === true) {
                setSelectedData([]);
                setCampaignName("");
            }
            return !prev;
        });
    };

    const handleCampaignChange = (e) => {
        setCampaignName(e.target.value);
    };

    const handleClickToggleSearchDetailsModel = (e, open, data = {}) => {
        //if (e && e.target.closest(".discart_model")) return;
        setSearchDetailsModel({ ...searchDetailsModel, open, ...data });
    };

    const handleSaveFilter = (e, filters_) => {
        setFilters({ ...filters, ...filters_ });
        setPage({
            page: 1,
            total: 0,
            totalPage: 1,
            perPage: 20,
            fetching: false,
        });
    };

    const handleChangePage = (value) => {
        if (value === page.page) return;
        window.scrollTo({ top: 0 });

        setPage({ ...page, page: value });
    };

    const handleToggleAllCheckboxes = (e) => {
        if (jumkuData.length === selectedData.length) return setSelectedData([]);

        setSelectedData(jumkuData.map((ele) => ele.gst_number));
    };

    const handleChangeCheckBox = (e, details) => {
        const i = selectedData.indexOf(details.gst_number);

        if (i > -1) {
            selectedData.splice(i, 1);
            return setSelectedData([...selectedData]);
        }

        if (selectedData.length >= 25) {
            toast.error("Cannot select more than 25 prospects at a time!", { style: { maxWidth: 500 } });
            return;
        }
        setSelectedData([...selectedData, details.gst_number]);
    };

    const formatAddress = (city, state, pincode) => {
        const parts = [city, state, pincode].filter(Boolean);
        if (parts.length === 0) return null;

        return parts.join(", ");
    };

    return (
        <div className="global_search_page page">
            <section className="page_header f-center flex flex-col items-center mb-8 pb-4 border-b border-b-gray-200">
                <div className="flex flex-col items-center gap-2 mb-5">
                    <div className="flex items-center gap-2">
                        <TbWorldSearch size="40" />
                        <h2 className="text-xl font-bold">Yogleads Prospect Explorer</h2>
                    </div>
                    <p className="text-base font-normal text-gray-700 mb-2 fade-in-out-text">{texts[textIndex]}</p>
                    {!campaignMode && (
                        <div className="flex items-center gap-2">
                            <Button variant="contained" color="blue" size="sm" onClick={handleClickToggleCampaign}>
                                Start New Campaign
                            </Button>
                        </div>
                    )}
                    {campaignMode && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <label htmlFor="campaign" className="text-sm font-medium w-44">
                                    Campaign Name:
                                </label>
                                <Input
                                    id="campaign"
                                    type="text"
                                    placeholder="eg. Steel Manufacturers"
                                    size="sm"
                                    value={campaignName}
                                    onChange={handleCampaignChange}
                                />
                            </div>

                            <Button
                                variant="contained"
                                color="green"
                                size="sm"
                                onClick={setCampaignData}
                                disabled={!campaignName || selectedData.length === 0}
                            >
                                Get Selected Details ({selectedData.length}/25)
                            </Button>

                            <Button variant="contained" color="red" size="sm" onClick={handleClickToggleCampaign}>
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>
                <div className="filters flex items-center gap-3 pb-2 mb-2">
                    <div className="flex gap-2 items-center">
                        <p className="text-sm font-medium">HSN/SAC: </p>
                        <Input
                            type="text"
                            placeholder="eg. 28091000, 84145930,..."
                            size="sm"
                            onChange={(e) => setSearchTerms({ ...searchTerms, hsn_or_sac: e.target.value })}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleClickSearch();
                                }
                            }}
                        />
                    </div>
                    <div className="flex gap-2 items-center">
                        <p className="text-sm font-medium">City: </p>
                        <Input
                            type="text"
                            placeholder="eg. Ghaziabad"
                            size="sm"
                            onChange={(e) => setSearchTerms({ ...searchTerms, city: e.target.value })}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleClickSearch();
                                }
                            }}
                        />
                    </div>
                    <div className="flex gap-2 items-center">
                        <p className="text-sm font-medium">State: </p>
                        <Input
                            type="text"
                            placeholder="eg. Uttar Pradesh"
                            size="sm"
                            onChange={(e) => setSearchTerms({ ...searchTerms, state: e.target.value })}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleClickSearch();
                                }
                            }}
                        />
                    </div>
                    <div className="flex gap-2 items-center">
                        <p className="text-sm font-medium">Pincode: </p>
                        <Input
                            type="text"
                            placeholder="eg. 201007"
                            size="sm"
                            onChange={(e) => setSearchTerms({ ...searchTerms, pincode: e.target.value })}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleClickSearch();
                                }
                            }}
                        />
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button
                        className="!shadow-app1"
                        variant="contained"
                        color="primary"
                        size="md"
                        disabled={page.fetching}
                        onClick={handleClickSearch}
                    >
                        <BsSearch />
                        Search
                    </Button>
                    <GlobalSearchFilters onSave={handleSaveFilter} />
                </div>
            </section>

            <section className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start gap-2">
                        <p className="text-gray-600 text-sm font-medium">
                            Showing {jumkuData.length !== 0 ? (page.page - 1) * page.perPage + 1 : 0}-
                            {jumkuData.length !== page.perPage ? page.total : page.page * jumkuData.length} of{" "}
                            {page.total}
                        </p>

                        <span className="hidden sm:block">|</span>
                    </div>
                    <IoSyncCircleOutline
                        size={36}
                        color="gray"
                        onClick={handleClickRefresh}
                        className={`cursor-pointer ${page.fetching ? "animate-spin" : ""}`}
                        title="Synchronize"
                    />
                </div>
            </section>

            <section>
                <div className="content mb-5">
                    {jumkuData.length !== 0 &&
                        jumkuData.map((details, i) => {
                            return (
                                <div
                                    key={i}
                                    className={`grid grid-cols-3 gap-4 px-4 py-4 rounded-md shadow-app1 mb-6 hover:bg-gray-50 ${
                                        selectedData.includes(details.gst_number) ? "bg-gray-100" : "bg-white"
                                    }`}
                                    onClick={(e) => {
                                        if (campaignMode) handleChangeCheckBox(e, details);
                                    }}
                                >
                                    <div className="flex w-full">
                                        {details.entity_type && (
                                            <>
                                                {details.entity_type.includes("Proprietorship") &&
                                                    !details.entity_type.includes("Partnership") &&
                                                    !details.entity_type.includes("Private") &&
                                                    !details.entity_type.includes("Public") && (
                                                        <FaUserTie size={24} className="shrink-0" />
                                                    )}
                                                {details.entity_type.includes("Partnership") &&
                                                    !details.entity_type.includes("Proprietorship") &&
                                                    !details.entity_type.includes("Private") &&
                                                    !details.entity_type.includes("Public") && (
                                                        <FaHandshake size={24} className="shrink-0" />
                                                    )}
                                                {details.entity_type.includes("Private") &&
                                                    !details.entity_type.includes("Proprietorship") &&
                                                    !details.entity_type.includes("Partnership") &&
                                                    !details.entity_type.includes("Public") && (
                                                        <FaBuildingUser size={24} className="shrink-0" />
                                                    )}
                                                {details.entity_type.includes("Public") &&
                                                    !details.entity_type.includes("Proprietorship") &&
                                                    !details.entity_type.includes("Partnership") &&
                                                    !details.entity_type.includes("Private") && (
                                                        <FaBuildingColumns size={24} className="shrink-0" />
                                                    )}
                                                {!details.entity_type.includes("Proprietorship") &&
                                                    !details.entity_type.includes("Partnership") &&
                                                    !details.entity_type.includes("Private") &&
                                                    !details.entity_type.includes("Public") && (
                                                        <FaAddressCard size={24} className="shrink-0" />
                                                    )}
                                            </>
                                        )}
                                        {!details.entity_type && <FaPersonCircleQuestion className="shrink-0" />}

                                        <div className="ml-3">
                                            <p className="text-lg font-medium capitalize leading-snug mb-2">
                                                {details.trade_name || details.legal_name}
                                            </p>

                                            <p className="flex items-center gap-2 text-sm font-medium capitalize leading-snug mb-2">
                                                <FaBriefcase title="Business Activities" className="shrink-0" />
                                                {details.business_activities}
                                            </p>

                                            <p className="flex items-center gap-2 text-sm font-medium capitalize leading-snug">
                                                <MdCategory title="Entity Type" className="shrink-0" />
                                                {details.entity_type}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="w-full flex flex-col justify-between">
                                        <p className="flex items-center gap-2 text-sm font-medium leading-snug mb-2">
                                            <FaCrown title="Owner(s)" className="shrink-0" />
                                            <span
                                                className="text-ellipsis overflow-hidden whitespace-nowrap"
                                                title={details.owner_name}
                                            >
                                                <Printer value={details.owner_name} />
                                            </span>
                                        </p>

                                        <p className="flex items-center gap-2 text-sm font-medium capitalize leading-snug mb-2">
                                            <FaLocationDot title="Address" className="shrink-0" />
                                            <Printer
                                                value={formatAddress(details.city, details.state, details.pincode)}
                                            />
                                        </p>

                                        <p className="flex items-center gap-2 text-sm font-medium leading-snug">
                                            <FaMoneyBillWave title="Turnover" className="shrink-0" />
                                            <Printer
                                                value={
                                                    details.turnover ? details.turnover.replace(/Slab:\s/g, "") : null
                                                }
                                            />
                                        </p>
                                    </div>

                                    <div className="w-full">
                                        <div className="flex flex-col justify-between">
                                            <p className="flex items-center gap-2 text-sm font-medium leading-snug mb-2">
                                                <RiHandCoinFill
                                                    title="HSN/SAC Numbers"
                                                    className="shrink-0"
                                                    size={18}
                                                />
                                                <span
                                                    className="text-ellipsis overflow-hidden whitespace-nowrap"
                                                    title={details.hsn_or_sac}
                                                >
                                                    <Printer value={details.hsn_or_sac} />
                                                </span>
                                            </p>

                                            <p className="flex items-center gap-2 text-sm font-medium leading-snug mb-2">
                                                <HiReceiptTax title="GST Number" className="shrink-0" size={18} />
                                                <Printer value={details.gst_number} />
                                            </p>
                                            {!campaignMode && (
                                                <Button
                                                    className="!self-center"
                                                    variant="contained"
                                                    color="primary"
                                                    size="sm"
                                                    onClick={(e) =>
                                                        handleClickToggleSearchDetailsModel(e, true, details)
                                                    }
                                                    disabled={!details.gst_number ? true : false}
                                                >
                                                    Get Director Details
                                                </Button>
                                            )}
                                            {campaignMode && (
                                                <div className="flex items-center justify-center">
                                                    <CheckBox
                                                        size="xl"
                                                        checked={selectedData.includes(details.gst_number)}
                                                        onChange={(e) => handleChangeCheckBox(e, details)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                    {!page.fetching && jumkuData.length === 0 && (
                        <p className="text-center text-xl">No data found for selected filters/queries.</p>
                    )}

                    {page.fetching && (
                        <div className="f-center">
                            <Spinner />
                        </div>
                    )}
                </div>
            </section>

            {page.totalPage !== 1 && (
                <div className="flex items-center justify-center p-4">
                    <Pagination
                        total={page.totalPage * page.perPage}
                        perPage={page.perPage}
                        page={page.page}
                        onChange={handleChangePage}
                    />
                </div>
            )}

            {searchDetailsModel.open && (
                <div className="search_details fixed top-20 right-0 bottom-0 max-h-lg max-w-xl w-full">
                    <SearchDetailsModel
                        key={searchDetailsModel.record_uid}
                        data={searchDetailsModel}
                        onClose={(e) => handleClickToggleSearchDetailsModel(e, false)}
                    />
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
