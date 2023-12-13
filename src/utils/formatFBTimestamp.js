const formatFBTimestamp = (timestamp) => {
    const date = new Date(timestamp);

    // Extract date components
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();

    // Extract time components
    const hours = date.getHours() % 12 || 12; // Convert to 12-hour format
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    const period = date.getHours() >= 12 ? "PM" : "AM";

    // Create the formatted string
    const formattedTimestamp = `${day}-${month}-${year} ${hours}:${minutes}:${seconds} ${period}`;

    return formattedTimestamp;
};

export default formatFBTimestamp;
