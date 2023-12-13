import React from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

const ProfileBox = () => {
    return (
        <div className="profile_menu_box f-center gap-2 cursor-pointer">
            <img
                className="rounded-full object-cover"
                src="/img/profile.png"
                alt="profile"
                width="32px"
                height="32px"
            />

            <div className="profile_details font-medium">
                <p className="name text-sm text-gray-800">Johnson</p>
                <p className="name text-xs text-gray-600">Admin</p>
            </div>

            <MdOutlineKeyboardArrowDown className="text-2xl text-gray-600" />
        </div>
    );
};

export default ProfileBox;
