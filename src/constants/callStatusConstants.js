export const leadVariant = {
    0: {
        value: 0,
        text: "Interested",
    },
    1: {
        value: 1,
        text: "Not Interested",
    },
    2: {
        value: 2,
        text: "Call Tomorrow",
    },
    3: {
        value: 3,
        text: "Call Day After",
    },
    4: {
        value: 4,
        text: "Call Next Week",
    },
    5: {
        value: 5,
        text: "Call On Specific Date",
    },
    list: function () {
        const vals = Object.values(this);
        return vals.slice(0, vals.length - 1);
    },
};

export const connectVariant = {
    0: {
        value: 0,
        text: "Wrong Number",
    },
    1: {
        value: 1,
        text: "Not Connected",
    },
    2: {
        value: 2,
        text: "Connected",
    },
    list: function () {
        const vals = Object.values(this);
        return vals.slice(0, vals.length - 1);
    },
};
