const extractExecNames = (data) => {
    if (!data) return null;

    try {
        const nameObject = JSON.parse(data.replace(/None/g, '"null"').replace(/'/g, '"'));
        const names = Object.keys(nameObject);

        if (names.length === 1) return names[0];
        else return names.join(", ");
    } catch (err) {
        return data;
    }
};

export default extractExecNames;
