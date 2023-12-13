import React from "react";
import { MdHelpOutline } from "react-icons/md";
import { Button } from "../../components";

const Footer = ({ supportCall }) => {
    return (
        <footer className="footer bg-gray p-3">
            <div className="fixed z-20 bottom-2 -right-24 flex items-center justify-end drop-shadow transition ease-in-out delay-150 duration-200 hover:-translate-x-24">
                <Button variant="contained" color="primary" size="sm" onClick={supportCall}>
                    <MdHelpOutline size={28} />
                    Get Support
                </Button>
            </div>
            <p className="f-center">
                &copy; All Copyrights are reserved by <span className="text-blue-400 underline">Yogleads</span>
            </p>
        </footer>
    );
};

export default Footer;
