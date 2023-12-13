import React from "react";
import { MdClose } from "react-icons/md";
import { TiDelete } from "react-icons/ti";
import { Button } from "../../../../components";

const DeleteModel = ({ selectedLeads = [], handleClickDelete, onClose }) => {
    const handleClickToggleModel = (e) => {
        if (!onClose) return;
        onClose(e);
    };

    return (
        <div className="whatsapp_download_app_model fixed top-0 bottom-0 left-0 right-0 bg-model f-center">
            <div className="max-w-xl w-full bg-white p-8 rounded-md shadow-app2 relative">
                <span
                    className="absolute -top-10 right-2 h-8 w-8 f-center bg-white rounded-full cursor-pointer"
                    onClick={(e) => handleClickToggleModel(e)}
                >
                    <MdClose className="text-lg" />
                </span>

                <div className="flex justify-start">
                    <div className="">
                        <TiDelete style={{ color: "#D11A2A", fontSize: "3rem" }} />
                    </div>
                    <div className="flex justify-center items-center">
                        <h4 className="text-2xl font-semibold">Confirm Delete</h4>
                    </div>
                </div>

                <div className="f-center flex-col max-w-m ml-2 mr-2 mt-2">
                    <p className="text-lg text-red-500 font-medium">
                        {`You have selected ${selectedLeads.length} lead(s) to delete permanently.`}
                    </p>
                    <p className="text-lg font-medium">Are you sure you want to proceed?</p>
                    <div className="flex justify-evenly w-full mt-5">
                        <Button variant="contained" color="red" onClick={handleClickDelete}>
                            Yes, Delete
                        </Button>
                        <Button variant="contained" color="primary" onClick={(e) => handleClickToggleModel(e)}>
                            No, Go Back
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteModel;
