import _ from "lodash";

const formatDate = (date, format = "yyyy-mm-dd", sparator = "-") => {
    if (!date) return "";
    let d = new Date(date);
    if (_.isNumber(date)) d = new Date(date);

    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    let hour = d.getHours().toString().padStart(2, "0");
    const minute = d.getMinutes().toString().padStart(2, "0");
    const seconds = d.getSeconds().toString().padStart(2, "0");

    const ampm = hour >= 12 ? "PM" : "AM";
    if (format === "hh:mm:AMPM" || format === "hh:mm:ss:AMPM" || format === "dd-mm-yyyy hh:mm:AMPM") {
        hour = hour % 12;
        hour = hour ? hour : 12;
    }

    if (format === "dd-mm-yyyy") return `${day}${sparator}${month}${sparator}${year}`;
    if (format === "dd-mm-yyyy hh:mm:ss")
        return `${day}${sparator}${month}${sparator}${year} ${hour}:${minute}:${seconds}`;
    if (format === "dd-mm-yyyy hh:mm:AMPM")
        return `${day}${sparator}${month}${sparator}${year} ${hour}:${minute} ${ampm}`;
    if (format === "yyyy-mm-dd hh:mm:ss")
        return `${year}${sparator}${month}${sparator}${day} ${hour}:${minute}:${seconds}`;

    if (format === "hh:mm:ss") return `${hour}:${minute}:${seconds}`;
    if (format === "hh:mm:ss:AMPM") return `${hour}:${minute}:${seconds} ${ampm}`;
    if (format === "hh:mm") return `${hour}:${minute}`;
    if (format === "hh:mm:AMPM") return `${hour}:${minute} ${ampm}`;
    if (format === "dd") return `${day}`;
    if (format === "mm") return `${month}`;
    if (format === "yyyy") return `${year}`;
    if (format === "yyyy-mm") return `${year}${sparator}${month}`;

    return `${year}${sparator}${month}${sparator}${day}`;
};

export default formatDate;
