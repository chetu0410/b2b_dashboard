import React, { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import IntegrationIcon from "../Icons/IntegrationIcon";
import { MdDashboard } from "react-icons/md";
import { TbWorldSearch } from "react-icons/tb";
import { AiFillGoogleCircle } from "react-icons/ai";
import { BsGlobeCentralSouthAsia } from "react-icons/bs";
import { SiHandshake } from "react-icons/si";
import { FaSquareFacebook } from "react-icons/fa6";
import { BiSolidChart } from "react-icons/bi";
import { HiOutlineDownload } from "react-icons/hi";

const Menu = () => {
    const integrations = useMemo(() => {
        try {
            return localStorage.getItem("integrations") ? JSON.parse(localStorage.getItem("integrations")) : [];
        } catch (err) {
            return [];
        }
    }, []);

    const location = useLocation();

    const isSubMenuActive = useMemo(() => {
        return (
            location.pathname.includes("/admin/indiamart-data") ||
            location.pathname.includes("/admin/fb-data") ||
            location.pathname.includes("/admin/tradeindia-data")
        );
    }, [location.pathname]);

    return (
        <div className="main_menu f-center">
            <ul className="md:flex md:items-center md:gap-3 whitespace-nowrap">
                <li>
                    <MenuLink to="/dev/admin/report">
                        <MdDashboard />
                        Dashboard
                    </MenuLink>
                </li>

                <li>
                    <MenuLink to="/dev/admin/global-search">
                        <TbWorldSearch size="18" />
                        Global Search
                    </MenuLink>
                </li>

                <li>
                    <MenuLink to="/dev/admin/search-history">
                        <AiFillGoogleCircle style={{ fontSize: "1.3rem" }} />
                        Search History
                    </MenuLink>
                </li>

                <li>
                    <MenuLink to="/dev/admin/my-data">
                        <BsGlobeCentralSouthAsia />
                        My Data
                    </MenuLink>
                </li>

                {/* Integration Data Dropdown */}
                {integrations.length !== 0 &&
                    (integrations.includes(1) || integrations.includes(2) || integrations.includes(3)) && (
                        <li className="group relative">
                            <div
                                className={`group flex items-center cursor-default ${
                                    isSubMenuActive ? "btn btn-contained" : "btn"
                                }`}
                            >
                                {location.pathname.includes("/admin/indiamart-data") && (
                                    <>
                                        <SiHandshake />
                                        IndiaMART Data
                                    </>
                                )}
                                {location.pathname.includes("/admin/fb-data") && (
                                    <>
                                        <FaSquareFacebook size="18" />
                                        Facebook Data
                                    </>
                                )}
                                {location.pathname.includes("/admin/tradeindia-data") && (
                                    <>
                                        <BiSolidChart size="18" />
                                        TradeIndia Data
                                    </>
                                )}
                                {!isSubMenuActive && (
                                    <>
                                        <IntegrationIcon height={18} width={18} fill={"#000000"} stroke={"#000000"} />
                                        Integration Data
                                    </>
                                )}
                            </div>
                            <div className="absolute top-full left-0 w-full hidden group-hover:block z-10">
                                <ul className="mt-2 space-y-0 bg-white border border-gray-200 rounded-md overflow-hidden shadow-md">
                                    {integrations.includes(1) && (
                                        <li>
                                            <SubMenuLink to="/dev/admin/indiamart-data">IndiaMART Data</SubMenuLink>
                                        </li>
                                    )}
                                    {integrations.includes(2) && (
                                        <li>
                                            <SubMenuLink to="/dev/admin/fb-data">Facebook Data</SubMenuLink>
                                        </li>
                                    )}
                                    {integrations.includes(3) && (
                                        <li>
                                            <SubMenuLink to="/dev/admin/tradeindia-data">TradeIndia Data</SubMenuLink>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </li>
                    )}

                <li>
                    <MenuLink to="/dev/admin/downloads">
                        <HiOutlineDownload size="18" className="font-bold" />
                        Downloads
                    </MenuLink>
                </li>

                {/* <li>
                    <MenuLink to="/admin/automation">
                        <BsListUl />
                        Automation
                    </MenuLink>
                </li>

                <li>
                    <MenuLink to="/admin/search-history">
                        <MdOutlineAccessTimeFilled />
                        My Search History
                    </MenuLink>
                </li> */}
            </ul>
        </div>
    );
};

export default Menu;

const MenuLink = ({ children, to }) => {
    return (
        <NavLink to={to} className={({ isActive }) => `${isActive ? "btn btn-contained" : "btn"}`}>
            {children}
        </NavLink>
    );
};

const SubMenuLink = ({ children, to }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `block px-4 py-2 text-sm text-center text-gray-700  ${
                    isActive ? "font-bold bg-amber-200" : "font-medium hover:bg-gray-100"
                }`
            }
        >
            {children}
        </NavLink>
    );
};
