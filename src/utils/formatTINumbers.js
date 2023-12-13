const formatTINumbers = (mobile, other_mobiles) => {
    // Handle null cases
    let mobiles_1 = mobile || "";
    let mobiles_2 = other_mobiles || "";

    // Split strings into arrays and extract unique numbers
    mobiles_1 = Array.from(
        new Set(
            mobiles_1
                .split(",")
                .map((num) => num.trim())
                .filter((num) => num)
        )
    );
    mobiles_2 = Array.from(
        new Set(
            mobiles_2
                .split(",")
                .map((num) => num.trim())
                .filter((num) => num)
        )
    );

    // Combine and get unique numbers
    const combinedNumbers = Array.from(new Set([...mobiles_1, ...mobiles_2]));

    // Join the numbers into a string separated by commas
    return combinedNumbers.join(", ");
};

export default formatTINumbers;
