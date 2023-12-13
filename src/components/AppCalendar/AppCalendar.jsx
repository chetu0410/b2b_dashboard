import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const AppCalendar = ({ value, onChange }) => {
    return <Calendar value={value} onChange={onChange} />;
};

export default AppCalendar;
