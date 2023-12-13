import { useEffect, useState } from "react";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file

const AppRangeCalendar = ({ sd, ed, onChange }) => {
    const [state, setState] = useState([
        {
            startDate: new Date(),
            endDate: null,
            key: "selection",
        },
    ]);

    useEffect(() => {
        if (!sd && !ed) return;

        // eslint-disable-next-line
        if (new Date(ed) == "Invalid Date" || new Date(sd) == "Invalid Date") return;

        if (sd && ed) setState([{ ...state[0], startDate: sd, endDate: ed }]);
        if (sd) setState([{ ...state[0], startDate: sd }]);
        if (ed) setState([{ ...state[0], endDate: ed }]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sd, ed]);

    const handleChangeDate = (item) => {
        setState([item.selection]);
        if (onChange) onChange(item);
    };

    return (
        <DateRangePicker
            editableDateInputs={true}
            onChange={handleChangeDate}
            moveRangeOnFirstSelection={false}
            ranges={state}
        />
    );
};

export default AppRangeCalendar;
