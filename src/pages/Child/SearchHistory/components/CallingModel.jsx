import classNames from "classnames";
import React from "react";
import { BsCheckLg } from "react-icons/bs";
import { MdClose } from "react-icons/md";
import { Button } from "../../../../components";

const CallingModel = ({ name, model, data = {}, onSelect, onClose, onSubmit, disabled }) => {
    const variants = {
        top: "top-full right-0 mt-2 max-w-sm w-full",
        bottom: "bottom-full left-0 mb-2 w-[384px]",
    };

    return (
        <div
            className={classNames(
                "absolute p-4 rounded-md bg-white border border-gray-300 shadow-md z-10",
                variants[name]
            )}
        >
            <div className="relative">
                <p
                    className="flex items-center justify-between p-2 pr-6 rounded-sm hover:bg-gray-100 cursor-pointer"
                    onClick={(e) => onSelect(data?.self_account_details?.parent_user_uid)}
                >
                    {data?.self_account_details?.email} (Self)
                    {model.child === data?.self_account_details?.parent_user_uid && <BsCheckLg />}
                </p>

                <span
                    className="h-8 w-8 f-center bg-gray rounded-full cursor-pointer absolute -top-3 -right-3"
                    onClick={(e) => onClose(name)}
                >
                    <MdClose className="text-sm" />
                </span>
            </div>

            {data?.child_account_details?.map((ele, i) => (
                <p
                    key={i}
                    className="flex items-center justify-between p-2 rounded-sm hover:bg-gray-100 cursor-pointer"
                    onClick={(e) => onSelect(ele.user_uid)}
                >
                    <span>{ele.email}</span>

                    <span className="mt-0.5 text-xl">{model.child === ele.user_uid && <BsCheckLg />}</span>
                </p>
            ))}

            <div className="btns flex items-center gap-4 mt-5">
                <Button variant="contained" color="primary" size="sm" onClick={onSubmit} disabled={disabled}>
                    Submit
                </Button>
                <Button variant="outlined" color="gray" size="sm" onClick={(e) => onClose(name)}>
                    Cancel
                </Button>
            </div>
        </div>
    );
};

export default CallingModel;
