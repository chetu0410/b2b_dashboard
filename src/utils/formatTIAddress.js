const formatTIAddress = (city, state, country) => {
    const parts = [city, state, country].filter(Boolean); // filter out null or undefined values
    if (parts.length === 0) return null; // if all fields are null or undefined

    return parts.join(", "); // Join the non-null parts with a comma and space
};

export default formatTIAddress;
