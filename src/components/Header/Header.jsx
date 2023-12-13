import { useContext, useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Select from "react-select";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

import { FaUserAlt } from "react-icons/fa";
import { BsCheckLg, BsFacebook } from "react-icons/bs";
import { GrLogout } from "react-icons/gr";
import indiamartLogo from "../../assets/images/indiamart.png";
import tradeIndiaLogo from "../../assets/images/tradeIndia.ico";
import justdialLogo from "../../assets/images/jd.png";
import Logo from "../../assets/images/logo.png";

import AuthContext from "../../context/AuthContext";
import ParentChildContext from "../../context/ParentChildContext";
import cookieHelper from "../../utils/cookieHelper";
import Button from "../Button/Button";
import Chip from "../Chip/Chip";
import Menu from "../Menu/Menu";
import ChildMenu from "../Menu/ChildMenu";
import HamburgMenu from "./HamburgMenu";
import SearchBox from "./SearchBox";
import LeadbotToggle from "../ToggleButton/LeadbotToggle";
import WhatsappButton from "../ToggleButton/WhatsappButton";

const Header = ({ integrations = [], integrationCall, leadbotStatus, leadbotCall, seleniumStatus, seleniumCall }) => {
    const { authUser, setAuthUser } = useContext(AuthContext);
    const { selectedUser, setSelectedUser } = useContext(ParentChildContext);
    const [selectedOption, setSelectedOption] = useState(null);

    const navigate = useNavigate();

    const child = useMemo(() => {
        try {
            return localStorage.getItem("child") ? JSON.parse(localStorage.getItem("child")) : [];
        } catch (err) {
            return [];
        }
    }, []);

    const handleClickLogout = () => {
        cookieHelper.deleteCookie("jwt");
        localStorage.removeItem("access_token");
        localStorage.removeItem("self");
        localStorage.removeItem("g_info");

        setAuthUser({ ...authUser, auth: false });

        firebase.auth().signOut();
    };

    const handleSelectOption = (option) => {
        setSelectedOption(option);
        switch (option.value) {
            case 1:
                integrationCall(1);
                break;
            case 2:
                integrationCall(2);
                break;
            case 3:
                integrationCall(3);
                break;
            default:
                break;
        }
        setSelectedOption(null);
    };

    const handleParentClick = () => {
        setSelectedUser({ isChild: false, user_uid: "", email: "" });
        localStorage.removeItem("child-user");
        toast.success("Switched to Admin Account (Self)", {
            style: {
                maxWidth: 400,
            },
        });
        navigate("/dev/admin/search-history");
    };

    const handleChildClick = (e) => {
        const index = e.currentTarget.getAttribute("child-index");
        const childUser = { isChild: true, user_uid: child[index].user_uid, email: child[index].email };
        setSelectedUser(childUser);
        localStorage.setItem("child-user", JSON.stringify(childUser));
        toast.success(
            `Switched to View-Only Mode for ${child[index].username ? child[index].username : child[index].email}`,
            {
                style: {
                    maxWidth: 500,
                },
            }
        );
        navigate("/dev/child/search-history");
    };

    return (
        <header className="header bg-gray px-2 md:px-4 py-2.5 f-center flex-col">
            <div className="flex flex-col flex-wrap items-center justify-center sm:flex-nowrap sm:flex-row sm:justify-between w-full max-w-screen-2xl mx-auto">
                <div className="branding mb-3 sm:mb-0">
                    <img src={Logo} alt="logo" width="160px" />
                </div>

                {/* <div className="flex items-center mb-3 sm:mb-0">
                </div> */}

                <div className="flex items-center gap-4">
                    {selectedUser.isChild && <ChildMenu />}
                    {!selectedUser.isChild && <Menu />}

                    <div className="group relative">
                        <Chip
                            className="!lowercase"
                            title={selectedUser.isChild ? `${selectedUser.email} (View Only)` : authUser?.email}
                        />

                        <div className="absolute top-full left-0 w-full hidden group-hover:block z-10">
                            <div className="mt-2 p-2 bg-white border-gray-200 rounded-md shadow-md border">
                                {child.length !== 0 && <div className="text-xs text-gray-500">Self Account:</div>}
                                <div className="flex flex-row items-center">
                                    <div
                                        className="flex items-center mt-2 mb-2 px-1 w-4/5 bg-white hover:bg-gray-100 cursor-pointer"
                                        onClick={handleParentClick}
                                    >
                                        <div className="f-center h-8 w-8 bg-gray-200 rounded-full shrink-0">
                                            <FaUserAlt />
                                        </div>
                                        <p className="ml-2 text-sm font-semibold text-ellipsis overflow-hidden">
                                            {authUser?.name || authUser?.email}
                                        </p>
                                    </div>
                                    <div className="flex justify-end items-center pr-1">
                                        <Button
                                            className="h-9 w-9 rounded-full !font-bold !p-0"
                                            variant="contained"
                                            color="gray"
                                            size="sm"
                                            onClick={handleClickLogout}
                                            title="Logout"
                                        >
                                            <GrLogout size={18} />
                                        </Button>
                                    </div>
                                </div>

                                {child.length !== 0 && <div className="text-xs text-gray-500">Child Account(s):</div>}
                                {child.length !== 0 && (
                                    <div className="flex flex-col justify-start items-center group-hover:block ">
                                        {child.map((account, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center mt-2 mb-2 px-1 bg-white hover:bg-gray-100 cursor-pointer"
                                                onClick={handleChildClick}
                                                child-index={index}
                                            >
                                                <div className="f-center h-8 w-8 bg-gray-200 rounded-full shrink-0">
                                                    <FaUserAlt />
                                                </div>
                                                <p className="ml-2 text-sm font-semibold text-ellipsis overflow-hidden">
                                                    {account.username || account.email}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="mt-2 border-gray-200 w-full" />

            <div className="flex items-center justify-between w-full max-w-screen-2xl mx-auto mt-3">
                {!selectedUser.isChild && <HamburgMenu />}
                <div className="flex items-center">
                    {!selectedUser.isChild && (
                        <div className="flex items-center gap-3 mr-4">
                            <div className="flex items-center justify-center">
                                <WhatsappButton
                                    name={"selenium"}
                                    checked={seleniumStatus}
                                    onChange={seleniumCall}
                                    //disabled={leadbotStatus}
                                />
                            </div>

                            <div className="flex items-center justify-center">
                                <LeadbotToggle
                                    name={"leadbot"}
                                    checked={leadbotStatus}
                                    onChange={leadbotCall}
                                    //disabled={leadbotStatus}
                                />
                            </div>

                            <Select
                                name="integration"
                                value={selectedOption}
                                options={[
                                    { value: 1, label: "IndiaMART" },
                                    { value: 2, label: "Facebook" },
                                    { value: 3, label: "TradeIndia" },
                                    { value: 4, label: "Justdial" },
                                ]}
                                onChange={handleSelectOption}
                                placeholder={"Integrations..."}
                                getOptionLabel={(option) => {
                                    if (option.value === 1) {
                                        return (
                                            <span
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "start",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <img
                                                        src={indiamartLogo}
                                                        alt="IM"
                                                        style={{ maxWidth: "24px", maxHeight: "24px" }}
                                                        className="mr-2"
                                                    />
                                                    <span>{option.label}</span>
                                                </span>
                                                {integrations.length !== 0 && integrations.includes(1) && (
                                                    <BsCheckLg style={{ color: "green" }} />
                                                )}
                                            </span>
                                        );
                                    } else if (option.value === 2) {
                                        return (
                                            <span
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "start",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <BsFacebook
                                                        style={{ color: "#0866FF", fontSize: "24px" }}
                                                        className="mr-2"
                                                    />
                                                    <span>{option.label}</span>
                                                </span>
                                                {integrations.length !== 0 && integrations.includes(2) && (
                                                    <BsCheckLg style={{ color: "green" }} />
                                                )}
                                            </span>
                                        );
                                    } else if (option.value === 3) {
                                        return (
                                            <span
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "start",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <img
                                                        src={tradeIndiaLogo}
                                                        alt="TI"
                                                        style={{ maxWidth: "24px", maxHeight: "24px" }}
                                                        className="mr-2"
                                                    />
                                                    <span>{option.label}</span>
                                                </span>
                                                {integrations.length !== 0 && integrations.includes(3) && (
                                                    <BsCheckLg style={{ color: "green" }} />
                                                )}
                                            </span>
                                        );
                                    } else if (option.value === 4) {
                                        return (
                                            <span
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "start",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <img
                                                        src={justdialLogo}
                                                        alt="JD"
                                                        style={{
                                                            maxWidth: "24px",
                                                            maxHeight: "24px",
                                                            filter: "grayscale(100%)",
                                                        }}
                                                        className="mr-2"
                                                    />
                                                    <span style={{ color: "gray" }}>{option.label}</span>
                                                </span>
                                                <span
                                                    style={{ color: "gray", fontSize: "12px", fontFamily: "monospace" }}
                                                >
                                                    {" "}
                                                    COMING SOON
                                                </span>
                                            </span>
                                        );
                                    }
                                }}
                                styles={{
                                    // To make the select wider
                                    control: (provided) => ({
                                        ...provided,
                                        width: "250px", // Adjust the width as needed
                                    }),
                                }}
                            />
                        </div>
                    )}
                    <div className="justify-self-end">
                        <SearchBox />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
