import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { animated, to, useSpring } from "react-spring";

import { IoMenu, IoLogoWhatsapp, IoSettings } from "react-icons/io5";
import Model from "../Model/Model";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

const HamburgMenu = () => {
    /**Model */
    const [showModel, setShowModel] = useState(false);
    const location = useLocation();

    const [hamburgSprings, hamburgApi] = useSpring(() => ({
        from: {
            angle: 0,
            opacity: 0,
            x: -10,
        },
    }));

    const [hamburgStatus, setHamburgStatus] = useState(
        location.pathname.includes("/admin/wa-schedule") || location.pathname.includes("/admin/settings") ? true : null
    );
    const [menuStatus, setMenuStatus] = useState(false);
    const [transition, setTransition] = useState(false);

    const handleToggleHamburg = () => {
        setHamburgStatus((prev) => {
            if (!location.pathname.includes("/admin/wa-schedule") && !location.pathname.includes("/admin/settings"))
                return !Boolean(prev);
            else return prev;
        });
    };

    useEffect(() => {
        if (hamburgStatus === true) {
            hamburgApi.start({
                from: {
                    angle: 0,
                    opacity: 0,
                    x: -10,
                },
                to: {
                    angle: 90,
                    opacity: 100,
                    x: 0,
                },
                onStart: () => {
                    setTransition(true);
                    setMenuStatus(true);
                },
                onRest: () => {
                    setTransition(false);
                },
            });
        } else if (hamburgStatus === false) {
            hamburgApi.start({
                from: {
                    angle: 90,
                    opacity: 100,
                    x: 0,
                },
                to: {
                    angle: 0,
                    opacity: 0,
                    x: -10,
                },
                onStart: () => setTransition(true),
                onRest: () => {
                    setTransition(false);
                    setMenuStatus(false);
                },
            });
        } else {
            hamburgApi.start({
                from: {
                    angle: 0,
                    opacity: 0,
                    x: -10,
                },
                to: {
                    angle: 0,
                    opacity: 0,
                    x: -10,
                },
            });
        }
    }, [hamburgStatus]);

    return (
        <div className="flex items-center gap-2">
            <animated.div
                className="w-10 h-10 p-1 f-center bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300"
                style={{ transform: to(hamburgSprings.angle, (value) => `rotate(${value}deg)`) }}
                onClick={handleToggleHamburg}
            >
                <IoMenu size={38} color="black" />
            </animated.div>

            {menuStatus && (
                <animated.div
                    className="flex items-center"
                    style={{
                        transform: to(hamburgSprings.x, (value) => `translateX(${value}%)`),
                        opacity: to(hamburgSprings.opacity, (value) => value / 100),
                    }}
                >
                    <ul className="md:flex md:items-center md:gap-2 whitespace-nowrap">
                        <li>
                            <MenuLink
                                to="/dev/admin/wa-schedule"
                                disabled={transition} // Disable the link during transition
                            >
                                <IoLogoWhatsapp size={18} />
                                WhatsApp Schedule
                            </MenuLink>
                        </li>

                        <li className="btn">
                            <Model/>
                        </li>
                        
                    </ul>
                </animated.div>
            )}
        </div>
    );
};

export default HamburgMenu;

const MenuLink = ({ children, to, disabled }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `${isActive ? "btn btn-contained" : "btn"}`}
            style={{ pointerEvents: disabled ? "none" : "" }}
        >
            {children}
        </NavLink>
    );
};
