import { useState } from "react";

import AppRangeCalendar from "./AppRangeCalendar";
import Button from "../Button/Button";

const ReportCalendar = ({ startDate = new Date(), endDate = new Date(), onSave, onClose, onChange, onClear }) => {
    const [date, setDate] = useState({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
    });
    const [err, setErr] = useState({ status: false, message: "" });

    const handleChangeRangeDate = (date) => {
        setDate({
            startDate: date.selection.startDate,
            endDate: date.selection.endDate,
        });

        if (onChange) onChange(date);
    };

    const handleClickSave = () => {
        if (date?.startDate?.toString() === "Invalid Date") {
            setErr({ status: true, message: "Select start date" });
            return;
        }

        if (date?.endDate?.toString() === "Invalid Date") {
            setErr({ status: true, message: "Select end date" });
            return;
        }

        if (!onSave) return;
        onSave(date);
    };

    return (
        <div className="absolute top-full right-0 mt-3 bg-white p-6 rounded-md shadow-md border border-gray-300">
            <AppRangeCalendar sd={date.startDate} ed={date.endDate} onChange={handleChangeRangeDate} />

            <hr className="border border-gray-200 my-2" />

            <div className="flex items-center justify-between gap-3">
                <Button variant="outlined" color="gray" size="sm" onClick={onClear}>
                    Clear
                </Button>

                {err.status && <p className="text-sm text-red-500 font-medium">{err.message}</p>}

                <div className="flex items-center gap-3">
                    <Button color="blue" size="sm" onClick={onClose}>
                        Close
                    </Button>

                    <Button variant="contained" color="blue" size="sm" onClick={handleClickSave}>
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ReportCalendar;
